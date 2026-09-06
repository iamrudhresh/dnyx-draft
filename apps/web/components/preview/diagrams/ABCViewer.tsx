'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface ABCViewerProps {
  notation: string;
}

export const ABCViewer: React.FC<ABCViewerProps> = ({ notation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const synthRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const abcjs = await import('abcjs');
        if (!containerRef.current || cancelled) return;

        containerRef.current.innerHTML = '';

        abcjs.renderAbc(containerRef.current, notation, {
          responsive: 'resize',
          add_classes: true,
        });

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'ABC notation render failed');
          setLoading(false);
        }
      }
    };

    if (notation) render();

    return () => {
      cancelled = true;
    };
  }, [notation]);

  const handlePlay = async () => {
    try {
      const abcjs = await import('abcjs');
      if (!abcjs.synth.supportsAudio()) {
        alert('Audio playback not supported in this browser.');
        return;
      }

      if (playing && synthRef.current) {
        synthRef.current.stop();
        setPlaying(false);
        return;
      }

      const visualObj = abcjs.renderAbc('*', notation, {})[0];
      const synth = new abcjs.synth.CreateSynth();
      await synth.init({ visualObj });
      await synth.prime();
      synth.start();
      synthRef.current = synth;
      setPlaying(true);

      const origStop = synth.stop.bind(synth);
      (synth as unknown as Record<string, unknown>).stop = () => {
        setPlaying(false);
        return origStop();
      };
    } catch {
      setPlaying(false);
    }
  };

  if (error) {
    return (
      <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md font-mono">
        ABC notation error: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          abc notation
        </span>
        <button
          type="button"
          onClick={handlePlay}
          className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
            playing
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {playing ? 'Stop' : 'Play'}
        </button>
      </div>
      {loading && (
        <div className="flex items-center justify-center p-6 text-xs text-slate-400 gap-2">
          <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Rendering notation…
        </div>
      )}
      <div
        ref={containerRef}
        className="bg-white dark:bg-slate-900/30 p-4 overflow-x-auto [&_svg]:max-w-full"
      />
    </div>
  );
};
