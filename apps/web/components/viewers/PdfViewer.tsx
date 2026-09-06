'use client';

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/db';
import type { DocumentItem } from '@/lib/db/schema';

interface PdfViewerProps {
  doc: DocumentItem;
}

export function PdfViewer({ doc }: PdfViewerProps) {
  const [pdf, setPdf] = useState<{ numPages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<unknown>(null);

  useEffect(() => {
    async function load() {
      if (!db) return;

      let data: ArrayBuffer;
      if (doc.blobId) {
        const blob = await db.blobs.get(doc.blobId);
        if (!blob) return;
        data = blob.data;
      } else if (doc.content) {
        data = new TextEncoder().encode(doc.content).buffer;
      } else {
        return;
      }

      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const loadedPdf = await pdfjsLib.getDocument({ data }).promise;
      pdfRef.current = loadedPdf;
      setPdf({ numPages: loadedPdf.numPages });
      setLoading(false);
    }
    load();
  }, [doc.blobId, doc.content]);

  useEffect(() => {
    async function renderPage() {
      if (!pdfRef.current || !canvasRef.current) return;
      const pdfDoc = pdfRef.current as {
        getPage: (n: number) => Promise<{
          getViewport: (opts: { scale: number }) => { width: number; height: number };
          render: (ctx: unknown) => { promise: Promise<void> };
        }>;
      };
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
    renderPage();
  }, [currentPage, scale, pdf]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading PDF…
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0 flex-wrap">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {currentPage} / {pdf?.numPages ?? 1}
        </span>
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(pdf?.numPages ?? 1, p + 1))}
          disabled={currentPage >= (pdf?.numPages ?? 1)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

        <button
          type="button"
          onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-xs font-mono text-slate-500">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(5, s + 0.2))}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

        <button
          type="button"
          onClick={() => setShowSearch((p) => !p)}
          className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${showSearch ? 'text-blue-500' : ''}`}
        >
          <Search className="h-4 w-4" />
        </button>

        {showSearch && (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              placeholder="Search in document…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-xs bg-white dark:bg-slate-900 outline-none w-48"
            />
            <button type="button" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto flex justify-center p-6 bg-slate-100 dark:bg-slate-900">
        <canvas ref={canvasRef} className="shadow-lg rounded" />
      </div>
    </div>
  );
}
