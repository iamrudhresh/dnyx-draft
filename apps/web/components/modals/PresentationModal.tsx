'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Moon, Sun, Tv, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { MermaidViewer } from '../preview/MermaidViewer';

interface PresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  title: string;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  open,
  onOpenChange,
  content,
  title,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Smart slide parser:
  // 1. Normalize line breaks
  // 2. Remove frontmatter if present
  // 3. Split by horizontal rules (--- or ***) or major headings
  const slides = useMemo(() => {
    if (!content?.trim()) {
      return ['# Empty Document\n\nAdd content in the editor to present slides.'];
    }

    let text = content.replace(/\r\n/g, '\n').trim();

    // Strip YAML frontmatter if at the top
    if (text.startsWith('---')) {
      const secondDivider = text.indexOf('\n---', 3);
      if (secondDivider !== -1) {
        text = text.substring(secondDivider + 4).trim();
      }
    }

    // Split by horizontal rule dividers
    const rawParts = text.split(/\n\s*[-*_]{3,}\s*\n/);
    const parsed = rawParts.map((s) => s.trim()).filter((s) => s.length > 0);

    return parsed.length > 0 ? parsed : [text];
  }, [content]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (!open) {
      setCurrentSlide(0);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleNext, handlePrev, onOpenChange]);

  if (!open) return null;

  const currentSlideContent = slides[currentSlide] || slides[0] || '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 dark:bg-black/95 text-slate-900 dark:text-slate-100 flex flex-col select-none animate-in fade-in duration-150 backdrop-blur-md">
      {/* Top Presentation Bar */}
      <div className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/20 dark:border-slate-800/80 bg-white/10 dark:bg-slate-900/60 backdrop-blur text-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
            <Tv className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white truncate max-w-xs sm:max-w-md">
            {title || 'Presentation'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-xs font-mono text-slate-200 bg-black/40 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-white/10">
            Slide <strong className="text-white">{currentSlide + 1}</strong> / {slides.length}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-200 hover:text-white hover:bg-white/10"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-slate-200 hover:text-white hover:bg-white/10"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-slate-200 hover:text-white hover:bg-white/10"
            title="Exit Presentation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-4xl min-h-[60vh] max-h-[82vh] overflow-y-auto p-6 sm:p-10 md:p-14 rounded-2xl bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col justify-center transition-colors">
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const codeText = String(children).replace(/\n$/, '');

                  if (language === 'mermaid') {
                    return <MermaidViewer chart={codeText} />;
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {currentSlideContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="h-16 flex items-center justify-between px-6 sm:px-8 border-t border-slate-200/20 dark:border-slate-800/80 bg-white/10 dark:bg-slate-900/60 backdrop-blur text-white">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentSlide === 0}
          onClick={handlePrev}
          className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        {/* Progress Bar Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-md py-1">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? 'w-6 bg-blue-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              title={`Jump to slide ${i + 1}`}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={currentSlide === slides.length - 1}
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
