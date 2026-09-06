'use client';

import { ExternalLink, Megaphone, X } from 'lucide-react';
import type React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const APP_VERSION = '4.0.0';

const RELEASE_NOTES = [
  {
    version: '4.0.0',
    date: '2026-08-30',
    highlights: [
      'Rebuilt from scratch with Next.js 16, TypeScript, and Tailwind CSS v4',
      'Local-first IndexedDB workspace with unlimited documents and folders',
      'Extended diagram engines: Markmap, Vega-Lite, PlantUML, Graphviz, D2, WaveDrom, ABC, GeoJSON, STL',
      'Interactive diagram toolbars with zoom, pan, copy SVG/PNG',
      'Inline comments and review system with threaded replies',
      'Live Share for real-time collaboration',
      'Trash window with restore and permanent delete',
      'Emoji picker with full emoji database',
      'Insert Diagram modal with 17+ templates',
      'Text alignment toolbar (left, center, right, justify)',
      'RTL/LTR text direction toggle',
      'PDF export with proper page breaks and diagram serialization',
      'GitHub PAT vault (AES-GCM encrypted, up to 50 tokens)',
      '15-language UI (EN, ZH, JA, KO, FR, DE, ES, PT-BR, RU, AR, HI, BG, TR, IT)',
      'PWA support with service worker and offline caching',
      'Pomodoro focus timer with daily word goal tracking',
      'Knowledge graph view of document connections',
      'Voice-to-text dictation',
      'Command palette, global search, template picker',
    ],
  },
];

interface ReleaseNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4 text-blue-500" />
            What&apos;s New
            <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              v{APP_VERSION}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {RELEASE_NOTES.map((release) => (
            <div key={release.version}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  v{release.version}
                </h3>
                <span className="text-[11px] text-slate-400">{release.date}</span>
              </div>
              <ul className="space-y-1.5">
                {release.highlights.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Full changelog
          </a>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { APP_VERSION };
