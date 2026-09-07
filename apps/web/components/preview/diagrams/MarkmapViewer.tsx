'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DiagramToolbar } from '../DiagramToolbar';

interface MarkmapViewerProps {
  source: string;
}

export const MarkmapViewer: React.FC<MarkmapViewerProps> = ({ source }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep a ref to the Markmap instance so we can refit on resize / print
  // biome-ignore lint/suspicious/noExplicitAny: Markmap type not exported
  const mmRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refit = useCallback(() => {
    mmRef.current?.fit();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const [{ Transformer }, { Markmap }] = await Promise.all([
          import('markmap-lib'),
          import('markmap-view'),
        ]);

        if (!svgRef.current || cancelled) return;

        // Clear previous render
        while (svgRef.current.firstChild) {
          svgRef.current.removeChild(svgRef.current.firstChild);
        }

        const transformer = new Transformer();
        const { root } = transformer.transform(source);
        const mm = Markmap.create(svgRef.current, {});
        mm.setData(root);
        mm.fit();
        mmRef.current = mm;

        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Markmap render failed');
      }
    };

    if (source) render();

    return () => {
      cancelled = true;
    };
  }, [source]);

  // Refit on container resize (responsive) and on print (printable bounds)
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver(() => refit());
    ro.observe(containerRef.current);

    window.addEventListener('beforeprint', refit);
    return () => {
      ro.disconnect();
      window.removeEventListener('beforeprint', refit);
    };
  }, [refit]);

  if (error) {
    return (
      <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md font-mono">
        Markmap error: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <DiagramToolbar
        svgRef={svgRef as React.RefObject<SVGSVGElement | null>}
        containerRef={containerRef}
        label="markmap"
      />
      <div ref={containerRef} className="bg-white dark:bg-slate-900/30 p-2">
        <svg
          ref={svgRef}
          className="w-full"
          style={{ minHeight: '300px', display: ready ? 'block' : 'none' }}
        />
        {!ready && (
          <div className="flex items-center justify-center p-6 text-xs text-slate-400 gap-2">
            <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            Rendering markmap…
          </div>
        )}
      </div>
    </div>
  );
};
