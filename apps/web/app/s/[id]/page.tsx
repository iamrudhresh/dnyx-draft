'use client';

import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { MarkdownPreview } from '@/components/preview/MarkdownPreview';

interface SnapshotData {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  expiresAt: number;
}

export default function SharedSnapshotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<SnapshotData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'not-found' | 'expired' | 'error'>(
    'loading',
  );

  useEffect(() => {
    fetch(`/api/share/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setStatus('not-found');
          return;
        }
        if (res.status === 410) {
          setStatus('expired');
          return;
        }
        if (!res.ok) {
          setStatus('error');
          return;
        }
        const json = await res.json();
        setData(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [id]);

  const renderBody = () => {
    if (status === 'loading') {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading snapshot…
        </div>
      );
    }
    if (status === 'not-found') {
      return (
        <ErrorState
          title="Snapshot not found"
          message="This link may have been deleted or never existed."
        />
      );
    }
    if (status === 'expired') {
      return (
        <ErrorState
          title="Snapshot expired"
          message="This shared link has passed its expiry date."
        />
      );
    }
    if (status === 'error') {
      return (
        <ErrorState
          title="Something went wrong"
          message="Could not load this snapshot. Please try again later."
        />
      );
    }
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-hidden">
        <MarkdownPreview content={data?.content ?? ''} />
      </main>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#090d16]">
      <header className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>
            {data ? data.title : 'Dnyx Draft'}
            {data && (
              <span className="ml-2 font-normal text-xs text-slate-400">— shared snapshot</span>
            )}
          </span>
        </div>
        <Link href="/" className="text-xs flex items-center gap-1 text-blue-500 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Open in Workspace
        </Link>
      </header>

      {renderBody()}
    </div>
  );
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
      <AlertCircle className="h-10 w-10 text-slate-300" />
      <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h1>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
      <Link href="/" className="mt-2 text-sm text-blue-500 hover:underline">
        ← Back to workspace
      </Link>
    </div>
  );
}
