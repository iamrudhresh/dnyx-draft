'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Boundary:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#090d16] text-white font-sans">
        <div className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Application Crash Recovery</h2>
        <p className="text-xs text-slate-400 max-w-md mb-6 text-center font-mono">
          {error?.message || 'A fatal runtime exception occurred.'}
        </p>
        <Button
          type="button"
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <RotateCcw className="h-4 w-4" /> Reload Workspace
        </Button>
      </body>
    </html>
  );
}
