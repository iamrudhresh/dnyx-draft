'use client';

import { nanoid } from 'nanoid';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { DiagramToolbar } from './DiagramToolbar';

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default || mermaidModule;

        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        });

        const id = `mermaid-${nanoid()}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Invalid Mermaid syntax');
        }
      }
    };

    if (chart && typeof window !== 'undefined') {
      renderChart();
    }

    return () => {
      isMounted = false;
    };
  }, [chart, resolvedTheme]);

  // After SVG is injected into DOM, grab the actual SVG element for the toolbar
  useEffect(() => {
    if (containerRef.current && svgContent) {
      svgRef.current = containerRef.current.querySelector('svg');
    }
  }, [svgContent]);

  if (error) {
    return (
      <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md font-mono">
        Failed to render Mermaid diagram: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <DiagramToolbar svgRef={svgRef} containerRef={containerRef} label="mermaid" />
      <div
        ref={containerRef}
        className="flex justify-center overflow-x-auto bg-slate-100/50 dark:bg-slate-900/30 p-4"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
