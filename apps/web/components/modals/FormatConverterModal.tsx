'use client';

import { ArrowRight, Check, Copy, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DataViewerFormat } from '@/components/viewers/DataViewerToolbar';
import { convert } from '@/lib/convert';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

const FORMATS: DataViewerFormat[] = ['json', 'xml', 'yaml', 'csv'];
const EXTENSIONS: Record<DataViewerFormat, string> = {
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  csv: 'csv',
};

interface FormatConverterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceFormat: DataViewerFormat;
  content: string;
  docId?: string;
}

export function FormatConverterModal({
  open,
  onOpenChange,
  sourceFormat,
  content,
  docId,
}: FormatConverterModalProps) {
  const { createDocument, updateDocument } = useWorkspaceStore();
  const [targetFormat, setTargetFormat] = useState<DataViewerFormat>(
    FORMATS.find((f) => f !== sourceFormat) ?? 'json',
  );
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    convert(content, sourceFormat, targetFormat)
      .then((result) => {
        setOutput(result);
        setError(null);
      })
      .catch((e) => {
        setOutput('');
        setError(e instanceof Error ? e.message : 'Conversion failed');
      });
  }, [open, content, sourceFormat, targetFormat]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNew = async () => {
    const id = await createDocument(`Converted.${EXTENSIONS[targetFormat]}`, null, output);
    await updateDocument(id, { fileType: targetFormat });
    toast.success('New document created');
    onOpenChange(false);
  };

  const handleReplace = async () => {
    if (!docId) return;
    await updateDocument(docId, { content: output, fileType: targetFormat });
    toast.success('Current file replaced');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <RefreshCw className="h-5 w-5 text-purple-500" /> Convert {sourceFormat.toUpperCase()}
          </DialogTitle>
          <DialogDescription>Convert this document to another format.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">To:</span>
          {FORMATS.filter((f) => f !== sourceFormat).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTargetFormat(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                targetFormat === f
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Preview
            </label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="text-[11px] font-medium text-slate-500 hover:text-purple-500 flex items-center gap-1 disabled:opacity-50"
            >
              {copied ? (
                <Check className="h-3 w-3 text-purple-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {error ? (
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400 font-mono">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              rows={10}
              value={output}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none resize-none shadow-inner"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {docId && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleReplace}
              disabled={!output || !!error}
            >
              Replace Current File
            </Button>
          )}
          <Button
            type="button"
            onClick={handleCreateNew}
            disabled={!output || !!error}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Create New Document <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
