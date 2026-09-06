'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { DataViewerToolbar } from './DataViewerToolbar';

interface CsvTableViewerProps {
  content: string;
  docId?: string;
  editable?: boolean;
}

type SortDir = 'asc' | 'desc' | null;

function parseCsv(text: string): string[][] {
  const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true, delimiter: ',' });
  return result.data;
}

function toCsv(rows: string[][]): string {
  return Papa.unparse(rows);
}

export function CsvTableViewer({ content, docId, editable = false }: CsvTableViewerProps) {
  const { updateDocument } = useWorkspaceStore();
  const [rows, setRows] = useState<string[][]>([]);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [editCell, setEditCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRows(parseCsv(content));
  }, [content]);

  useEffect(() => {
    if (editCell && inputRef.current) inputRef.current.focus();
  }, [editCell]);

  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);

  const sortedRows = useMemo(() => {
    if (sortCol === null || sortDir === null) return dataRows;
    return [...dataRows].sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      const n = Number(av) - Number(bv);
      const cmp = Number.isNaN(n) ? av.localeCompare(bv) : n;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [dataRows, sortCol, sortDir]);

  const handleHeaderClick = (i: number) => {
    if (sortCol !== i) {
      setSortCol(i);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') {
      setSortDir('desc');
      return;
    }
    setSortCol(null);
    setSortDir(null);
  };

  const commitEdit = useCallback(() => {
    if (!editCell) return;
    const { row, col } = editCell;
    const newRows = rows.map((r, ri) =>
      ri === row + 1 ? r.map((c, ci) => (ci === col ? editValue : c)) : r,
    );
    setRows(newRows);
    setEditCell(null);
    if (docId) {
      updateDocument(docId, { content: toCsv(newRows) });
    }
  }, [editCell, editValue, rows, docId, updateDocument]);

  const addRow = () => {
    const newRow = new Array(headers.length).fill('');
    const newRows = [...rows, newRow];
    setRows(newRows);
    if (docId) {
      updateDocument(docId, { content: toCsv(newRows) });
    }
  };

  const deleteRow = (rowIndex: number) => {
    const newRows = rows.filter((_, i) => i !== rowIndex + 1);
    setRows(newRows);
    if (docId) {
      updateDocument(docId, { content: toCsv(newRows) });
      toast.success('Row deleted');
    }
  };

  const handleInsertChart = () => {
    const { createDocument, updateDocument: ud } = useWorkspaceStore.getState();
    const vegaSpec = JSON.stringify(
      {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'Chart from CSV',
        data: {
          values: dataRows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? '']))),
        },
        mark: 'bar',
        encoding: {
          x: { field: headers[0] ?? 'x', type: 'nominal' },
          y: { field: headers[1] ?? 'y', type: 'quantitative' },
        },
      },
      null,
      2,
    );
    createDocument('Chart from CSV', null, `\`\`\`vega-lite\n${vegaSpec}\n\`\`\``).then((id) => {
      ud(id, { fileType: 'markdown' });
      toast.success('Chart document created');
    });
  };

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Empty CSV file
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {editable && docId && <DataViewerToolbar fileType="csv" content={content} docId={docId} />}
      {editable && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add Row
          </button>
          <button
            type="button"
            onClick={handleInsertChart}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Insert as Chart
          </button>
        </div>
      )}
      <div className="flex-1 overflow-auto p-6">
        <table className="markdown-body w-full border-collapse text-sm">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => handleHeaderClick(i)}
                  className="cursor-pointer select-none px-3 py-2 text-left border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {h}
                    {sortCol === i ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </span>
                </th>
              ))}
              {editable && <th className="w-8 border border-slate-200 dark:border-slate-700" />}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    onClick={() => {
                      if (!editable) return;
                      setEditCell({ row: ri, col: ci });
                      setEditValue(cell);
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700"
                  >
                    {editable && editCell?.row === ri && editCell?.col === ci ? (
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit();
                          if (e.key === 'Escape') setEditCell(null);
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded px-1 text-sm outline-none"
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
                {editable && (
                  <td className="border border-slate-200 dark:border-slate-700 text-center">
                    <button
                      type="button"
                      onClick={() => deleteRow(ri)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
