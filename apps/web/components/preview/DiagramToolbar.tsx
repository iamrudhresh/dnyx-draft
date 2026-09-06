'use client';

import { Check, Copy, Download, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';

interface DiagramToolbarProps {
  svgRef?: React.RefObject<SVGSVGElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  label?: string;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({ svgRef, containerRef, label }) => {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const zoom = useCallback(
    (delta: number) => {
      const next = Math.max(0.25, Math.min(4, scale + delta));
      setScale(next);
      if (svgRef?.current) {
        svgRef.current.style.transform = `scale(${next})`;
        svgRef.current.style.transformOrigin = 'top left';
      }
    },
    [scale, svgRef],
  );

  const reset = useCallback(() => {
    setScale(1);
    if (svgRef?.current) {
      svgRef.current.style.transform = '';
    }
  }, [svgRef]);

  const copySVG = useCallback(() => {
    if (!svgRef?.current) return;
    const svgText = new XMLSerializer().serializeToString(svgRef.current);
    navigator.clipboard.writeText(svgText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [svgRef]);

  const downloadPNG = useCallback(() => {
    if (!svgRef?.current) return;
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const bbox = svg.getBoundingClientRect();
    canvas.width = bbox.width * 2 || 800;
    canvas.height = bbox.height * 2 || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${label ?? 'diagram'}.png`;
      a.click();
    };
    img.src = url;
  }, [svgRef, label]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef?.current) return;
    if (!fullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen((f) => !f);
  }, [fullscreen, containerRef]);

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] select-none">
      {label && (
        <span className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => zoom(-0.25)}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        title="Zoom out"
      >
        <ZoomOut className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={reset}
        className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]"
        title="Reset zoom"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={() => zoom(0.25)}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        title="Zoom in"
      >
        <ZoomIn className="h-3 w-3" />
      </button>
      <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
      <button
        type="button"
        onClick={copySVG}
        className="flex items-center gap-1 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        title="Copy SVG"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      </button>
      <button
        type="button"
        onClick={downloadPNG}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        title="Download PNG"
      >
        <Download className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={toggleFullscreen}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        title="Fullscreen"
      >
        {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
      </button>
    </div>
  );
};
