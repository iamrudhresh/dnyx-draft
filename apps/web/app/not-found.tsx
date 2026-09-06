import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 p-6 text-center select-none">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-6">
        <FileQuestion className="h-8 w-8" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm">
        The document, route, or shared workspace you are looking for does not exist or has been
        moved.
      </p>

      <Link href="/">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium shadow-md shadow-blue-500/20">
          <ArrowLeft className="h-4 w-4" /> Return to Editor
        </Button>
      </Link>
    </div>
  );
}
