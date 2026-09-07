'use client';

import { AlertTriangle, CheckCircle, FolderOpen, Upload } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { routeFileImport } from '@/lib/import/file-router';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface ImportFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCEPTED =
  '.md,.markdown,.txt,.docx,.html,.htm,.pdf,.csv,.tsv,.json,.yaml,.yml,.ipynb,.xlsx,.xls,.xml,.env,.ini,.toml,.zip,.jpg,.jpeg,.png,.gif,.webp,.svg,.js,.ts,.jsx,.tsx,.py,.rb,.go,.rs,.java,.cpp,.c,.cs,.php,.swift,.sh,.css,.sql';

export const ImportFileModal: React.FC<ImportFileModalProps> = ({ open, onOpenChange }) => {
  const { createDocument, updateDocument } = useWorkspaceStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const importFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setImporting(true);
    setProgress({ done: 0, total: fileArray.length });
    setWarnings([]);

    let successCount = 0;
    const allWarnings: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const routed = await routeFileImport(file);
        const docId = await createDocument(routed.title, null, routed.content);
        await updateDocument(docId, {
          fileType: routed.fileType,
          ...(routed.sourceFormat ? { sourceFormat: routed.sourceFormat } : {}),
          ...(routed.searchableText ? { searchableText: routed.searchableText } : {}),
        });
        if (routed.warnings?.length) {
          allWarnings.push(...routed.warnings.map((w) => `${file.name}: ${w}`));
        }
        successCount++;
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setProgress({ done: i + 1, total: fileArray.length });
    }

    setImporting(false);
    setProgress(null);

    if (successCount > 0) {
      toast.success(`Imported ${successCount} file${successCount > 1 ? 's' : ''}`);
    }
    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }
    if (allWarnings.length > 0) {
      setWarnings(allWarnings);
    } else if (errors.length === 0) {
      onOpenChange(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    importFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) importFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Import File
          </DialogTitle>
          <DialogDescription>
            Drop files or browse to import. DOCX, PDF, and HTML files are converted to Markdown.
            CSV, JSON, YAML, and more are opened in native viewers.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`mt-2 border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-500/5'
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
          }`}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Drop files here
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            or use the buttons below
          </p>

          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              Browse Files
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
              disabled={importing}
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Import Folder
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="hidden"
            onChange={handleFileInput}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error – webkitdirectory is a non-standard attribute
            webkitdirectory=""
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Importing…</span>
              <span>
                {progress.done} / {progress.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Conversion notes ({warnings.length})
            </div>
            <ul className="text-xs text-amber-600 dark:text-amber-300 space-y-0.5 max-h-24 overflow-auto">
              {warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="opacity-60 shrink-0">•</span> {w}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={() => onOpenChange(false)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
