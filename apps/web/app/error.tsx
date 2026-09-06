'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Caught Error:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 rounded-2xl border border-red-500/20 m-4">
      <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 font-mono bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        {error?.message || 'An unexpected rendering error occurred.'}
      </p>

      <Button
        type="button"
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Try Again
      </Button>
    </div>
  );
}
