'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface VegaLiteViewerProps {
  spec: string;
}

export const VegaLiteViewer: React.FC<VegaLiteViewerProps> = ({ spec }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const parsed = JSON.parse(spec);
        const embed = (await import('vega-embed')).default;
        if (!containerRef.current || cancelled) return;

        // Clear previous render
        containerRef.current.innerHTML = '';

        await embed(containerRef.current, parsed, {
          actions: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'excel',
          config: { background: 'transparent' },
        });

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Vega-Lite render failed');
          setLoading(false);
        }
      }
    };

    if (spec) render();

    return () => {
      cancelled = true;
    };
  }, [spec]);

  if (error) {
    return (
      <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md font-mono">
        Vega-Lite error: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-2 py-1 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        vega-lite
      </div>
      {loading && (
        <div className="flex items-center justify-center p-6 text-xs text-slate-400 gap-2">
          <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Rendering chart…
        </div>
      )}
      <div
        ref={containerRef}
        className="flex justify-center bg-white dark:bg-slate-900/30 p-4"
        style={{ display: loading ? 'none' : 'flex' }}
      />
    </div>
  );
};
