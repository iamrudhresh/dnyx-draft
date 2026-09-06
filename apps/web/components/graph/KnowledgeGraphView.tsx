'use client';

import { Network, RotateCcw, Search, ZoomIn, ZoomOut } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface GraphNode {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tags?: string[];
  linkCount: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

export const KnowledgeGraphView: React.FC = () => {
  const { documents, activeDocumentId, setActiveDocument, openTab } = useWorkspaceStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [filter, setFilter] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);

  // Parse nodes & edges
  const activeDocs = documents.filter((d) => !d.isTrash);

  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);

  // Build graph data
  useEffect(() => {
    const titleToIdMap: { [title: string]: string } = {};
    for (const doc of activeDocs) {
      titleToIdMap[doc.title.toLowerCase().replace(/\.md$/, '')] = doc.id;
      titleToIdMap[doc.title.toLowerCase()] = doc.id;
    }

    const edges: GraphEdge[] = [];
    const linkCounts: { [id: string]: number } = {};

    for (const doc of activeDocs) {
      linkCounts[doc.id] = linkCounts[doc.id] || 0;

      // Match [[WikiLinks]]
      const wikiRegex = /\[\[(.*?)\]\]/g;
      let match: RegExpExecArray | null = wikiRegex.exec(doc.content);
      while (match !== null) {
        const targetTitle = match[1].toLowerCase().replace(/\.md$/, '').trim();
        const targetId = titleToIdMap[targetTitle];
        if (targetId && targetId !== doc.id) {
          edges.push({ source: doc.id, target: targetId });
          linkCounts[doc.id] = (linkCounts[doc.id] || 0) + 1;
          linkCounts[targetId] = (linkCounts[targetId] || 0) + 1;
        }
        match = wikiRegex.exec(doc.content);
      }
    }

    // Preserve previous positions if already exist
    const oldNodeMap = new Map(nodesRef.current.map((n) => [n.id, n]));

    const nodes: GraphNode[] = activeDocs.map((doc, idx) => {
      const old = oldNodeMap.get(doc.id);
      const angle = (idx / activeDocs.length) * 2 * Math.PI;
      const radiusDist = 120 + Math.random() * 80;

      return {
        id: doc.id,
        title: doc.title.replace(/\.md$/, ''),
        x: old ? old.x : Math.cos(angle) * radiusDist,
        y: old ? old.y : Math.sin(angle) * radiusDist,
        vx: 0,
        vy: 0,
        radius: Math.min(18, Math.max(6, 6 + (linkCounts[doc.id] || 0) * 3)),
        tags: doc.tags,
        linkCount: linkCounts[doc.id] || 0,
      };
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [activeDocs]);

  // Physics animation loop
  useEffect(() => {
    let animationFrameId: number;

    const simulate = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Center attraction & node repulsion
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (n1 === draggedNodeRef.current) continue;

        // Center gravity
        n1.vx -= n1.x * 0.003;
        n1.vy -= n1.y * 0.003;

        // Repulsion between nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 220) {
            const force = (220 - dist) / dist;
            const fx = dx * force * 0.03;
            const fy = dy * force * 0.03;

            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // Edge spring attraction
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;

        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const springForce = (dist - 80) * 0.005;

        const fx = (dx / dist) * springForce;
        const fy = (dy / dist) * springForce;

        if (s !== draggedNodeRef.current) {
          s.vx += fx;
          s.vy += fy;
        }
        if (t !== draggedNodeRef.current) {
          t.vx -= fx;
          t.vy -= fy;
        }
      }

      // Apply velocity and friction
      for (const n of nodes) {
        if (n === draggedNodeRef.current) continue;
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.88;
        n.vy *= 0.88;
      }

      draw();
      animationFrameId = requestAnimationFrame(simulate);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
      ctx.scale(zoom, zoom);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      const isDark = document.documentElement.classList.contains('dark');

      // Draw Edges
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;

        const isHighlighted = hoveredNodeId === s.id || hoveredNodeId === t.id;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isHighlighted
          ? 'rgba(59, 130, 246, 0.8)'
          : isDark
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
      }

      // Draw Nodes
      for (const node of nodes) {
        if (filter && !node.title.toLowerCase().includes(filter.toLowerCase())) {
          continue;
        }

        const isActive = node.id === activeDocumentId;
        const isHovered = node.id === hoveredNodeId;

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

        if (isActive) {
          ctx.fillStyle = '#3b82f6';
        } else if (isHovered) {
          ctx.fillStyle = '#60a5fa';
        } else if (node.linkCount > 0) {
          ctx.fillStyle = isDark ? '#818cf8' : '#6366f1';
        } else {
          ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        }

        ctx.fill();

        if (isActive || isHovered) {
          ctx.strokeStyle = isDark ? '#ffffff' : '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node label
        ctx.font = `${isActive ? 'bold' : 'normal'} 10px sans-serif`;
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(node.title, node.x, node.y + node.radius + 12);
      }

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeDocumentId, hoveredNodeId, filter, zoom, offset]);

  // Coordinate transforms
  const screenToWorld = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;

    const x = (screenX - rect.left - cx - offset.x) / zoom;
    const y = (screenY - rect.top - cy - offset.y) / zoom;
    return { x, y };
  };

  const getNodeAt = (screenX: number, screenY: number): GraphNode | null => {
    const { x, y } = screenToWorld(screenX, screenY);
    for (const node of nodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy <= node.radius * node.radius) {
        return node;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAt(e.clientX, e.clientY);
    if (node) {
      draggedNodeRef.current = node;
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isDraggingCanvasRef.current) {
      setOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    } else {
      const node = getNodeAt(e.clientX, e.clientY);
      setHoveredNodeId(node ? node.id : null);
    }
  };

  const handleMouseUp = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      const node = draggedNodeRef.current;
      draggedNodeRef.current = null;
      // Clicked on node without massive drag
      setActiveDocument(node.id);
      openTab(node.id);
    }
    isDraggingCanvasRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(3, Math.max(0.4, prev * factor)));
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#070a12] select-none relative overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-2.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#090d16]/70 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter nodes..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
            className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.max(0.4, z * 0.8))}
            className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Reset View"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Floating Metrics Pill */}
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-500 shadow-xs flex items-center gap-2">
          <Network className="h-3 w-3 text-blue-500" />
          <span>
            {activeDocs.length} notes · {edgesRef.current.length} links
          </span>
        </div>
      </div>
    </div>
  );
};
