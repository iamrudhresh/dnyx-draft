'use client';

import { Hash, ListOrdered, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  content: string;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract headings from markdown content
  const lines = content.split('\n');
  const headings: HeadingItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[#*`_~]/g, '').trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      headings.push({ id, text, level });
    }
  }

  const handleHeadingClick = (text: string) => {
    // Search preview DOM for heading with matching text content
    const elements = document.querySelectorAll(
      '.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4',
    );
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.textContent?.trim().toLowerCase().includes(text.toLowerCase())) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="absolute right-4 top-4 z-30 select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-md hover:border-blue-500/50 backdrop-blur transition-all hover:scale-105"
          title="Open Table of Contents Outline"
        >
          <ListOrdered className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden sm:inline">Outline</span>
        </button>
      )}

      {/* Floating TOC Card */}
      {isOpen && (
        <div className="w-64 max-h-[75vh] flex flex-col rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <ListOrdered className="h-3.5 w-3.5 text-blue-500" />
              <span>Table of Contents</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-[60vh]">
            {headings.map((heading, index) => (
              <button
                key={`${heading.id}-${index}`}
                type="button"
                onClick={() => handleHeadingClick(heading.text)}
                className={cn(
                  'w-full flex items-center gap-1.5 text-left py-1 px-2 rounded-md text-xs transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400',
                  heading.level === 1 && 'font-bold text-slate-800 dark:text-slate-200',
                  heading.level === 2 && 'pl-4 font-medium',
                  heading.level === 3 && 'pl-7 text-[11px]',
                  heading.level === 4 && 'pl-9 text-[11px] opacity-80',
                )}
              >
                <Hash className="h-3 w-3 opacity-40 shrink-0" />
                <span className="truncate">{heading.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
