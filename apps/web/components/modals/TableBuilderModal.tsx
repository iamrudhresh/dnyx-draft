'use client';

import { AlignCenter, AlignLeft, AlignRight, Plus, Table, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatMarkdownTables } from '@/lib/utils/markdown-formatter';

interface TableBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertTable: (markdownTable: string) => void;
}

type Alignment = 'left' | 'center' | 'right';

export const TableBuilderModal: React.FC<TableBuilderModalProps> = ({
  open,
  onOpenChange,
  onInsertTable,
}) => {
  const [rows, setRows] = useState<string[][]>([
    ['Product', 'Category', 'Price ($)', 'In Stock'],
    ['Dnyx Draft', 'Developer Tool', '0.00', 'Yes'],
    ['Local Vault', 'Security', '0.00', 'Yes'],
  ]);

  const [alignments, setAlignments] = useState<Alignment[]>(['left', 'left', 'right', 'center']);

  const addColumn = () => {
    setRows((prev) => prev.map((r, i) => [...r, i === 0 ? `Header ${r.length + 1}` : '']));
    setAlignments((prev) => [...prev, 'left']);
  };

  const removeColumn = (colIndex: number) => {
    if (rows[0].length <= 1) return;
    setRows((prev) => prev.map((r) => r.filter((_, i) => i !== colIndex)));
    setAlignments((prev) => prev.filter((_, i) => i !== colIndex));
  };

  const addRow = () => {
    setRows((prev) => [...prev, new Array(prev[0].length).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  const updateCell = (rowIndex: number, colIndex: number, val: string) => {
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      next[rowIndex][colIndex] = val;
      return next;
    });
  };

  const cycleAlignment = (colIndex: number) => {
    setAlignments((prev) => {
      const next = [...prev];
      const current = next[colIndex];
      next[colIndex] = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
      return next;
    });
  };

  const handleInsert = () => {
    const headers = rows[0];
    const separators = alignments.map((a) => {
      if (a === 'center') return ':---:';
      if (a === 'right') return '---:';
      return ':---';
    });

    const body = rows.slice(1);
    const rawMarkdown = [
      `| ${headers.join(' | ')} |`,
      `| ${separators.join(' | ')} |`,
      ...body.map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');

    onInsertTable(formatMarkdownTables(rawMarkdown) + '\n\n');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Table className="h-5 w-5 text-blue-500" /> Interactive Table Builder
          </DialogTitle>
          <DialogDescription>
            Customize your rows, columns, and text alignment. Click &quot;Insert Table&quot; to add
            formatted Markdown.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar Controls */}
        <div className="flex items-center justify-between pt-2 pb-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="text-xs h-8 text-slate-700 dark:text-slate-300"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Add Row
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addColumn}
              className="text-xs h-8 text-slate-700 dark:text-slate-300"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-blue-500" /> Add Column
            </Button>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {rows.length - 1} rows × {rows[0].length} cols
          </span>
        </div>

        {/* Spreadsheet Grid */}
        <div className="max-h-[50vh] overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg shadow-inner bg-slate-50/50 dark:bg-slate-950">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <th className="w-8 p-2 text-center text-slate-400 font-mono">#</th>
                {rows[0].map((header, colIdx) => (
                  <th
                    key={colIdx}
                    className="p-1.5 border-r border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateCell(0, colIdx, e.target.value)}
                        placeholder="Header"
                        className="w-full px-2 py-1 font-bold bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => cycleAlignment(colIdx)}
                        title={`Alignment: ${alignments[colIdx]} (Click to cycle)`}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                      >
                        {alignments[colIdx] === 'center' ? (
                          <AlignCenter className="h-3.5 w-3.5 text-blue-500" />
                        ) : alignments[colIdx] === 'right' ? (
                          <AlignRight className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <AlignLeft className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </button>
                      {rows[0].length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(colIdx)}
                          title="Delete Column"
                          className="p-1 hover:text-red-500 text-slate-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, rowIdx) => {
                const actualRowIdx = rowIdx + 1;
                return (
                  <tr
                    key={rowIdx}
                    className="border-b border-slate-200 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/40"
                  >
                    <td className="p-2 text-center text-slate-400 font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <span>{actualRowIdx}</span>
                        {rows.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeRow(actualRowIdx)}
                            title="Delete Row"
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className="p-1.5 border-r border-slate-200 dark:border-slate-800"
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(actualRowIdx, colIdx, e.target.value)}
                          placeholder="Cell value"
                          className={`w-full px-2 py-1 bg-white dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 ${
                            alignments[colIdx] === 'center'
                              ? 'text-center'
                              : alignments[colIdx] === 'right'
                                ? 'text-right'
                                : 'text-left'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Insert Table into Document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
