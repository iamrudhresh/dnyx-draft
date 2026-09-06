'use client';

import { Activity, AlertTriangle, CheckCircle2, Clock, Mic, Sparkles } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { calculateDocumentMetrics } from '@/lib/utils/markdown-formatter';

interface DocumentDiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  title: string;
}

interface DiagnosticIssue {
  type: 'warning' | 'info';
  message: string;
  line?: number;
}

export const DocumentDiagnosticsModal: React.FC<DocumentDiagnosticsModalProps> = ({
  open,
  onOpenChange,
  content,
  title,
}) => {
  const metrics = calculateDocumentMetrics(content);

  // Client-side linting rules
  const lines = content.split('\n');
  const issues: DiagnosticIssue[] = [];

  let inCodeBlock = false;
  let codeBlockStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockStart = i + 1;
      }
    }

    // Check broken markdown image/link syntax
    if (/!\[.*?\]\(\s*\)/.test(line)) {
      issues.push({
        type: 'warning',
        message: 'Empty image URL detected',
        line: i + 1,
      });
    }

    if (/\[.*?\]\(\s*\)/.test(line)) {
      issues.push({
        type: 'warning',
        message: 'Empty hyperlink URL detected',
        line: i + 1,
      });
    }

    // Check consecutive multiple blank lines
    if (i > 0 && line.trim() === '' && lines[i - 1]?.trim() === '' && lines[i - 2]?.trim() === '') {
      issues.push({
        type: 'info',
        message: 'Multiple consecutive blank lines',
        line: i + 1,
      });
    }
  }

  if (inCodeBlock) {
    issues.push({
      type: 'warning',
      message: `Unclosed code fence started on line ${codeBlockStart}`,
      line: codeBlockStart,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Activity className="h-5 w-5 text-blue-500" /> Document Diagnostics & Readability
          </DialogTitle>
          <DialogDescription>
            Client-side structural health check and readability analysis for &quot;{title}&quot;.
          </DialogDescription>
        </DialogHeader>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Readability
            </span>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {metrics.fleschScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {metrics.readabilityLabel}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Total Words
            </span>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              {metrics.wordCount}
            </div>
            <span className="text-[11px] text-slate-500">{metrics.charCount} characters</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Read Time
            </span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ~{metrics.readingTimeMin}
              <span className="text-xs font-normal text-slate-400"> min</span>
            </div>
            <span className="text-[11px] text-slate-500">at 200 wpm</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center justify-center gap-1">
              <Mic className="h-3 w-3" /> Speaking Time
            </span>
            <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
              ~{metrics.speakingTimeMin}
              <span className="text-xs font-normal text-slate-400"> min</span>
            </div>
            <span className="text-[11px] text-slate-500">at 130 wpm</span>
          </div>
        </div>

        {/* Structural Health Check */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Structural Linting & Formatting
          </h4>

          <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-950">
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 p-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>No syntax issues or unclosed blocks detected. Document is healthy!</span>
              </div>
            ) : (
              issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{issue.message}</span>
                  </div>
                  {issue.line && (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      Line {issue.line}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
