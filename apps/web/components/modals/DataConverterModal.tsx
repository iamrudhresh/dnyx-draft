'use client';

import { ArrowRight, Check, Copy, FileSpreadsheet } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { convertCsvToMarkdown } from '@/lib/utils/markdown-formatter';

interface DataConverterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertMarkdown: (markdown: string) => void;
}

export const DataConverterModal: React.FC<DataConverterModalProps> = ({
  open,
  onOpenChange,
  onInsertMarkdown,
}) => {
  const [inputText, setInputText] = useState(
    'Name, Role, Location, Status\nJohn Doe, Lead Architect, San Francisco, Active\nJane Smith, UI Designer, London, Active\nAlex Ray, Core Developer, Remote, On Leave',
  );
  const [copied, setCopied] = useState(false);

  const convertedMarkdown = convertCsvToMarkdown(inputText);

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsertMarkdown(convertedMarkdown + '\n\n');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" /> CSV / TSV to Markdown Converter
          </DialogTitle>
          <DialogDescription>
            Paste comma-separated (CSV) or tab-delimited (TSV/Excel) spreadsheet data to convert it
            into a formatted Markdown table.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Left: Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Raw Data (CSV / TSV / Excel)
            </label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste comma or tab-separated data here..."
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 resize-none shadow-inner"
            />
          </div>

          {/* Right: Markdown Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Formatted Markdown Table
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-medium text-slate-500 hover:text-emerald-500 flex items-center gap-1"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={convertedMarkdown}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none resize-none shadow-inner"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            disabled={!convertedMarkdown.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Insert into Document <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
