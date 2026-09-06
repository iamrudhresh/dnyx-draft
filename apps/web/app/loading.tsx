import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-200 select-none">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Loading Workspace...</span>
      </div>
    </div>
  );
}
