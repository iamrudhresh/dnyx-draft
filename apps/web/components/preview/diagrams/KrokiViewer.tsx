'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { DiagramToolbar } from '../DiagramToolbar';

// Renders any diagram type supported by https://kroki.io
// Supported engines: plantuml, graphviz, d2, wavedrom, erd, pikchr, structurizr, etc.

interface KrokiViewerProps {
  source: string;
  engine: string;
}

function encodeKroki(source: string): string {
  // Kroki uses base64url-encoded deflate-compressed source
  // Use the text endpoint instead: POST to /engine/svg with body = source
  return source;
}

export const KrokiViewer: React.FC<KrokiViewerProps> = ({ source, engine }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const render = async () => {
      try {
        const res = await fetch(`https://kroki.io/${engine}/svg`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          body: encodeKroki(source),
        });
        if (!res.ok) throw new Error(`Kroki error: ${res.status}`);
        const svg = await res.text();
        if (!cancelled) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Render failed');
          setLoading(false);
        }
      }
    };

    if (source) render();

    return () => {
      cancelled = true;
    };
  }, [source, engine]);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      svgRef.current = containerRef.current.querySelector('svg');
    }
  }, [svgContent]);

  if (loading) {
    return (
      <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/30 text-xs text-slate-400 gap-2">
          <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Rendering {engine} diagram…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md font-mono">
        {engine} render failed: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <DiagramToolbar svgRef={svgRef} containerRef={containerRef} label={engine} />
      <div
        ref={containerRef}
        className="flex justify-center overflow-x-auto bg-white dark:bg-slate-900/30 p-4"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
