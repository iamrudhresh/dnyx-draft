'use client';

import { Copy, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CodeFileViewerProps {
  content: string;
  filename?: string;
}

export function CodeFileViewer({ content, filename }: CodeFileViewerProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const ext = filename?.split('.').pop()?.toLowerCase() ?? '';

  useEffect(() => {
    import('highlight.js').then(({ default: hljs }) => {
      if (!codeRef.current) return;
      const result = hljs.highlightAuto(content);
      codeRef.current.innerHTML = result.value;
      codeRef.current.className = `hljs language-${result.language ?? 'plaintext'}`;
    });
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
          {filename ?? 'code'}
        </span>
        <div className="flex items-center gap-2">
          {ext && (
            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
              .{ext}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="h-full m-0 rounded-none text-sm leading-relaxed p-4">
          <code ref={codeRef}>{content}</code>
        </pre>
      </div>
    </div>
  );
}
