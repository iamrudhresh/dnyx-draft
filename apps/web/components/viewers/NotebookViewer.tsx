'use client';

import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeFileViewer } from './CodeFileViewer';

interface NotebookCell {
  cell_type: 'markdown' | 'code' | 'raw';
  source: string | string[];
  outputs?: NotebookOutput[];
  metadata?: { collapsed?: boolean };
}

interface NotebookOutput {
  output_type: string;
  text?: string | string[];
  data?: { 'text/plain'?: string | string[]; 'text/html'?: string | string[]; 'image/png'?: string };
  traceback?: string[];
}

interface NotebookViewerProps {
  content: string;
}

function cellSource(cell: NotebookCell): string {
  return Array.isArray(cell.source) ? cell.source.join('') : cell.source;
}

function CellOutput({ output }: { output: NotebookOutput }) {
  if (output.output_type === 'stream' || output.output_type === 'display_data') {
    const text = output.text ? (Array.isArray(output.text) ? output.text.join('') : output.text) : '';
    if (output.data?.['image/png']) {
      return <img src={`data:image/png;base64,${output.data['image/png']}`} alt="output" className="max-w-full my-1" />;
    }
    if (text) return <pre className="text-xs overflow-auto p-2 bg-slate-50 dark:bg-slate-900 rounded">{text}</pre>;
  }
  if (output.output_type === 'execute_result') {
    const plain = output.data?.['text/plain'];
    const text = Array.isArray(plain) ? plain.join('') : plain;
    if (output.data?.['image/png']) {
      return <img src={`data:image/png;base64,${output.data['image/png']}`} alt="output" className="max-w-full my-1" />;
    }
    if (text) return <pre className="text-xs overflow-auto p-2 bg-slate-50 dark:bg-slate-900 rounded">{text}</pre>;
  }
  if (output.output_type === 'error') {
    return (
      <pre className="text-xs text-red-500 overflow-auto p-2 bg-red-50 dark:bg-red-900/20 rounded">
        {output.traceback?.join('\n') ?? 'Error'}
      </pre>
    );
  }
  return null;
}

function NotebookCellCard({ cell, index }: { cell: NotebookCell; index: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const source = cellSource(cell);

  const handleCopy = () => {
    navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-3">
      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 cursor-pointer"
        onClick={() => setCollapsed((p) => !p)}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        )}
        <span className="text-xs font-medium text-slate-500">
          [{index + 1}] {cell.cell_type}
        </span>
        {cell.cell_type === 'code' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {!collapsed && (
        <div>
          {cell.cell_type === 'markdown' ? (
            <div className="p-4 markdown-body prose dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
            </div>
          ) : (
            <div className="max-h-64 overflow-auto">
              <CodeFileViewer content={source} />
            </div>
          )}

          {cell.outputs && cell.outputs.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-1">
              {cell.outputs.map((output, oi) => (
                <CellOutput key={oi} output={output} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function NotebookViewer({ content }: NotebookViewerProps) {
  let notebook: { cells: NotebookCell[]; metadata?: { kernelspec?: { display_name?: string } } };
  try {
    notebook = JSON.parse(content);
  } catch {
    return (
      <div className="p-6 text-red-500 text-sm">Invalid notebook format (not valid JSON)</div>
    );
  }

  const kernelName = notebook.metadata?.kernelspec?.display_name;

  return (
    <div className="h-full overflow-auto p-6">
      {kernelName && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
            {kernelName}
          </span>
        </div>
      )}
      {(notebook.cells ?? []).map((cell, i) => (
        <NotebookCellCard key={i} cell={cell} index={i} />
      ))}
    </div>
  );
}
