'use client';

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/db';
import type { DocumentItem } from '@/lib/db/schema';

interface ImageViewerProps {
  doc: DocumentItem;
}

export function ImageViewer({ doc }: ImageViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!doc.blobId || !db) return;
    db.blobs.get(doc.blobId).then((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(new Blob([blob.data], { type: blob.mimeType }));
      setObjectUrl(url);
      prevUrl.current = url;
    });
    return () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    };
  }, [doc.blobId]);

  if (!objectUrl) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading image…
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.25))}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-xs text-slate-500 font-mono min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(10, z + 0.25))}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          title="Fit to pane"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900">
        <img
          src={objectUrl}
          alt={doc.title}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.15s' }}
          className="max-w-none"
          onWheel={(e) => setZoom((z) => Math.max(0.1, Math.min(10, z - e.deltaY * 0.001)))}
        />
      </div>
    </div>
  );
}
