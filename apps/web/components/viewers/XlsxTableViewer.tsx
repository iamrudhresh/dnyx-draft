'use client';

import { useEffect, useState } from 'react';
import { CsvTableViewer } from './CsvTableViewer';

interface XlsxTableViewerProps {
  content: string;
  docId?: string;
}

export function XlsxTableViewer({ content, docId }: XlsxTableViewerProps) {
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [csvData, setCsvData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    // content is raw text for xlsx; we need the binary
    // XlsxTableViewer receives base64 content from blobId path
    try {
      const bytes = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
      setRawData(bytes);
    } catch {
      setError('Unable to decode XLSX file. Binary format required.');
    }
  }, [content]);

  useEffect(() => {
    if (!rawData) return;
    import('xlsx').then(({ read, utils }) => {
      try {
        const wb = read(rawData, { type: 'array' });
        const names = wb.SheetNames;
        setSheets(names);
        const ws = wb.Sheets[names[activeSheet]];
        if (ws) setCsvData(utils.sheet_to_csv(ws));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to parse XLSX');
      }
    });
  }, [rawData, activeSheet]);

  if (error) {
    return <div className="p-6 text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {sheets.length > 1 && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0">
          {sheets.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveSheet(i)}
              className={`text-xs px-3 py-1 rounded-t border-b-2 transition-colors ${
                i === activeSheet
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {csvData ? (
        <CsvTableViewer content={csvData} docId={docId} />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          Loading spreadsheet…
        </div>
      )}
    </div>
  );
}
