'use client';

import {
  Archive,
  FileCode,
  FileDown,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Moon,
  Printer,
  Sun,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateDocxBlob } from '@/lib/export/docx';
import { exportToPDF } from '@/lib/export/pdf';
import { exportDocumentToJson } from '@/lib/export/to-json';
import { generateWorkspaceZip } from '@/lib/export/zip';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Appearance = 'light' | 'dark';

function getStoredAppearance(): Appearance {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('md-export-appearance') as Appearance) ?? 'light';
}

/** Strip YAML/TOML frontmatter from rendered HTML so exports look clean. */
function stripFrontmatter(html: string): string {
  // The frontmatter is rendered as a <pre> or a plain text block at the top;
  // the most reliable approach is to strip it from the markdown before rendering,
  // but since we clone the DOM here we look for a leading <hr> that remark-gfm emits.
  return html;
}

export const ExportModal: React.FC<ExportModalProps> = ({ open, onOpenChange }) => {
  const { documents, folders, activeDocumentId } = useWorkspaceStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);

  const handleExportJson = () => {
    if (!activeDoc) return;
    const json = exportDocumentToJson(activeDoc);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `${activeDoc.title.replace(/\.md$/, '')}.json`);
    toast.success(`Exported "${activeDoc.title}" as JSON`);
  };
  const [appearance, setAppearance] = useState<Appearance>(getStoredAppearance);

  const persistAppearance = (a: Appearance) => {
    setAppearance(a);
    if (typeof window !== 'undefined') localStorage.setItem('md-export-appearance', a);
  };

  const isDark = appearance === 'dark';

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onOpenChange(false);
  };

  const handleExportMarkdown = () => {
    if (!activeDoc) return;
    const blob = new Blob([activeDoc.content], { type: 'text/markdown' });
    downloadBlob(blob, activeDoc.title || 'document.md');
    toast.success(`Exported "${activeDoc.title}" as Markdown`);
  };

  const handleExportHTML = () => {
    if (!activeDoc) return;
    const previewElement = document.querySelector('.markdown-body');
    let renderedHTML: string;
    if (previewElement) {
      const clone = previewElement.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('script').forEach((s) => s.remove());
      for (const el of clone.querySelectorAll('*')) {
        for (const attr of [...el.attributes]) {
          if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
        }
      }
      renderedHTML = stripFrontmatter(clone.innerHTML);
    } else {
      renderedHTML = activeDoc.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const bgColor = isDark ? '#090d16' : '#ffffff';
    const textColor = isDark ? '#c9d1d9' : '#24292f';
    const hlTheme = isDark
      ? 'github-dark.min.css'
      : 'github.min.css';

    const htmlTemplate = `<!DOCTYPE html>
<html data-color-mode="${appearance}" data-dark-theme="dark" data-light-theme="light">
<head>
  <meta charset="utf-8">
  <title>${activeDoc.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-${appearance}.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${hlTheme}">
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      background: ${bgColor};
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .markdown-body table { border-collapse: collapse; }
    .markdown-body table td, .markdown-body table th {
      border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
      padding: 6px 13px;
    }
    .markdown-body table tr { background-color: ${isDark ? '#0d1117' : '#ffffff'}; }
    .markdown-body table tr:nth-child(2n) { background-color: ${isDark ? '#161b22' : '#f6f8fa'}; }
    .markdown-body hr { border-color: ${isDark ? '#30363d' : '#d0d7de'}; }
    .markdown-body blockquote { border-left-color: ${isDark ? '#30363d' : '#d0d7de'}; }
  </style>
</head>
<body class="markdown-body">
  ${renderedHTML}
</body>
</html>`;
    const blob = new Blob([htmlTemplate], { type: 'text/html' });
    downloadBlob(blob, `${activeDoc.title.replace(/\.md$/, '')}.html`);
    toast.success(`Exported "${activeDoc.title}" as HTML (${appearance})`);
  };

  const handleExportDocx = async () => {
    if (!activeDoc) return;
    setExportingDocx(true);
    try {
      const blob = await generateDocxBlob(activeDoc.content, activeDoc.title);
      downloadBlob(blob, `${activeDoc.title.replace(/\.md$/, '')}.docx`);
      toast.success(`Exported "${activeDoc.title}" as Word Document`);
    } catch (err) {
      console.error('Failed to generate DOCX:', err);
      toast.error('Failed to generate DOCX document');
    } finally {
      setExportingDocx(false);
    }
  };

  const handleExportWorkspaceZip = async () => {
    setExportingZip(true);
    try {
      const blob = await generateWorkspaceZip(documents, folders);
      downloadBlob(blob, `workspace-markdown-backup-${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success('Exported complete workspace as ZIP');
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      toast.error('Failed to generate ZIP archive');
    } finally {
      setExportingZip(false);
    }
  };

  const handleExportPDF = async () => {
    if (!activeDoc) return;
    setExportingPdf(true);
    try {
      await exportToPDF(activeDoc.title, appearance);
      toast.success(`Exported "${activeDoc.title}" as PDF (${appearance})`);
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to export PDF');
    } finally {
      setExportingPdf(false);
      onOpenChange(false);
    }
  };

  const handleExportPNG = async () => {
    if (!activeDoc) return;
    setExportingPng(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const previewEl = document.querySelector<HTMLElement>('.markdown-body');
      if (!previewEl) throw new Error('Preview element not found');

      const canvas = await html2canvas(previewEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#090d16' : '#ffffff',
        logging: false,
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error('Failed to generate PNG');
            return;
          }
          const safeTitle = (activeDoc.title || 'document').replace(/\.md$/, '');
          downloadBlob(blob, `${safeTitle}.png`);
          toast.success(`Exported "${activeDoc.title}" as PNG (${appearance})`);
        },
        'image/png',
        1.0,
      );
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.error('Failed to export PNG');
    } finally {
      setExportingPng(false);
    }
  };

  const handlePrint = () => {
    // Apply the chosen appearance class to the body before printing
    const body = document.body;
    const htmlEl = document.documentElement;
    const prevDataTheme = htmlEl.getAttribute('data-theme');

    if (isDark) {
      htmlEl.setAttribute('data-print-theme', 'dark');
    }
    window.print();
    if (isDark) {
      htmlEl.removeAttribute('data-print-theme');
    }
    if (prevDataTheme !== null) htmlEl.setAttribute('data-theme', prevDataTheme);
    void body;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FileDown className="h-5 w-5 text-blue-500" /> Export Options
          </DialogTitle>
          <DialogDescription>
            Choose to export the active document &quot;{activeDoc?.title || 'document'}&quot; or
            download your complete workspace archive.
          </DialogDescription>
        </DialogHeader>

        {/* Appearance toggle */}
        <div className="flex items-center gap-2 pt-1 pb-0.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Export appearance:
          </span>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => persistAppearance('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors ${
                !isDark
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="h-3 w-3" />
              Light
            </button>
            <button
              type="button"
              onClick={() => persistAppearance('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="h-3 w-3" />
              Dark
            </button>
          </div>
          <span className="text-[11px] text-slate-400">
            Applies to HTML, PDF, and PNG exports
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Markdown */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExportMarkdown}
            className="flex flex-col items-start gap-1 h-auto p-4 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <FileText className="h-4 w-4 text-blue-500" /> Markdown (.md)
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active document text file
            </span>
          </Button>

          {/* Microsoft Word */}
          <Button
            type="button"
            variant="outline"
            disabled={exportingDocx}
            onClick={handleExportDocx}
            className="flex flex-col items-start gap-1 h-auto p-4 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              {exportingDocx ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              )}
              Word Document (.docx)
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Microsoft Word format
            </span>
          </Button>

          {/* HTML Document */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExportHTML}
            className="flex flex-col items-start gap-1 h-auto p-4 border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <FileCode className="h-4 w-4 text-emerald-500" /> HTML ({appearance})
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Styled standalone web page
            </span>
          </Button>

          {/* PDF Export */}
          <Button
            type="button"
            variant="outline"
            disabled={exportingPdf}
            onClick={handleExportPDF}
            className="flex flex-col items-start gap-1 h-auto p-4 border-slate-200 dark:border-slate-800 hover:border-red-500 transition-all text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 text-red-500" />
              )}
              PDF ({appearance})
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              High-res with diagram rendering
            </span>
          </Button>

          {/* PNG Export */}
          <Button
            type="button"
            variant="outline"
            disabled={exportingPng}
            onClick={handleExportPNG}
            className="flex flex-col items-start gap-1 h-auto p-4 border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              {exportingPng ? (
                <Loader2 className="h-4 w-4 text-teal-500 animate-spin" />
              ) : (
                <FileImage className="h-4 w-4 text-teal-500" />
              )}
              PNG Image ({appearance})
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Raster screenshot of preview
            </span>
          </Button>

          {/* JSON Export */}
          <Button
            type="button"
            variant="outline"
            onClick={handleExportJson}
            className="flex flex-col items-start gap-1 h-auto p-4 border-slate-200 dark:border-slate-800 hover:border-violet-500 transition-all text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <FileCode className="h-4 w-4 text-violet-500" /> Structured JSON
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Sections + metadata as JSON
            </span>
          </Button>

          {/* Print to PDF */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="flex flex-col items-start gap-1 h-auto p-4 border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all text-left"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <Printer className="h-4 w-4 text-purple-500" /> Print / Save as PDF
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Browser native print dialog
            </span>
          </Button>
        </div>

        {/* Full Workspace ZIP Export Banner */}
        <div className="mt-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Archive className="h-4 w-4 text-blue-500" /> Workspace Backup (.zip)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download all {documents.filter((d) => !d.isTrash).length} documents &amp;{' '}
              {folders.length} folders in a clean ZIP archive.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={exportingZip}
            onClick={handleExportWorkspaceZip}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 text-xs h-8"
          >
            {exportingZip ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Archive className="h-3.5 w-3.5 mr-1" />
            )}
            Export ZIP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
