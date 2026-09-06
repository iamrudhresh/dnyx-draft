'use client';

import {
  CaseSensitive,
  FileText,
  Folder,
  Regex,
  Replace,
  Search,
  WholeWord,
  X,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchMatch {
  docId: string;
  docTitle: string;
  folderName?: string;
  lineNumber: number;
  lineContent: string;
  matchStart: number;
  matchEnd: number;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onOpenChange }) => {
  const { documents, folders, setActiveDocument, updateDocument, openTab } = useWorkspaceStore();

  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Search execution
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const matches: SearchMatch[] = [];

    let regex: RegExp;
    try {
      let pattern = query;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      return [];
    }

    const activeDocs = documents.filter((d) => !d.isTrash && !d.isSecret);

    for (const doc of activeDocs) {
      const folder = folders.find((f) => f.id === doc.folderId);
      const lines = doc.content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        regex.lastIndex = 0;
        let match = regex.exec(line);

        while (match !== null) {
          matches.push({
            docId: doc.id,
            docTitle: doc.title,
            folderName: folder?.name,
            lineNumber: i + 1,
            lineContent: line,
            matchStart: match.index,
            matchEnd: match.index + match[0].length,
          });
          if (!regex.global) break;
          match = regex.exec(line);
        }
      }
    }

    return matches;
  }, [documents, folders, query, matchCase, wholeWord, useRegex]);

  // Group matches by document
  const groupedResults = useMemo(() => {
    const groups: {
      [docId: string]: { docTitle: string; folderName?: string; matches: SearchMatch[] };
    } = {};

    for (const m of results) {
      if (!groups[m.docId]) {
        groups[m.docId] = {
          docTitle: m.docTitle,
          folderName: m.folderName,
          matches: [],
        };
      }
      groups[m.docId].matches.push(m);
    }

    return groups;
  }, [results]);

  const handleSelectMatch = (docId: string) => {
    setActiveDocument(docId);
    openTab(docId);
    onOpenChange(false);
  };

  const handleReplaceAll = () => {
    if (!query.trim()) return;

    let regex: RegExp;
    try {
      let pattern = query;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      toast.error('Invalid regular expression pattern');
      return;
    }

    let modifiedCount = 0;
    const docIds = Object.keys(groupedResults);

    for (const docId of docIds) {
      const doc = documents.find((d) => d.id === docId);
      if (!doc) continue;

      const newContent = doc.content.replace(regex, replaceQuery);
      if (newContent !== doc.content) {
        updateDocument(doc.id, { content: newContent });
        modifiedCount++;
      }
    }

    toast.success(`Replaced in ${modifiedCount} document${modifiedCount === 1 ? '' : 's'}`);
  };

  const totalDocsCount = Object.keys(groupedResults).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-white dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Search className="h-4 w-4 text-blue-500" /> Global Workspace Search &amp; Replace
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Search across all documents in your workspace (Ctrl + Shift + F).
          </DialogDescription>
        </DialogHeader>

        {/* Search & Replace Form */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Find Input */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-blue-500">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all documents..."
              autoFocus
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none font-mono placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Modifiers */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                type="button"
                onClick={() => setMatchCase(!matchCase)}
                title="Match Case (Alt+C)"
                className={`p-1 rounded text-xs transition-colors ${
                  matchCase
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <CaseSensitive className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setWholeWord(!wholeWord)}
                title="Match Whole Word (Alt+W)"
                className={`p-1 rounded text-xs transition-colors ${
                  wholeWord
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <WholeWord className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setUseRegex(!useRegex)}
                title="Use Regular Expression (Alt+R)"
                className={`p-1 rounded text-xs transition-colors ${
                  useRegex
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Regex className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Toggle Replace Bar */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowReplace(!showReplace)}
              className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-medium"
            >
              <Replace className="h-3.5 w-3.5" />
              <span>{showReplace ? 'Hide Replace' : 'Toggle Replace'}</span>
            </button>

            {query && (
              <span className="text-[11px] text-slate-500 font-mono">
                {results.length} result{results.length === 1 ? '' : 's'} in {totalDocsCount} doc
                {totalDocsCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Replace Input */}
          {showReplace && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-emerald-500 mt-2">
              <Replace className="h-4 w-4 text-emerald-500 shrink-0" />
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none font-mono placeholder:text-slate-400"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleReplaceAll}
                disabled={!query.trim() || results.length === 0}
                className="text-xs h-7 px-2.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 shrink-0"
              >
                Replace All
              </Button>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
          {query.trim() === '' ? (
            <div className="text-center py-12 text-xs text-slate-400 space-y-1">
              <Search className="h-6 w-6 mx-auto opacity-40 mb-2" />
              <p>Type a search query to scan all documents in the workspace.</p>
              <p className="text-[11px] opacity-60">
                Supports case-matching, whole-word filtering, and Regex patterns.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 space-y-1">
              <p>No results found for &quot;{query}&quot;.</p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([docId, group]) => (
              <div key={docId} className="py-2.5 space-y-1">
                {/* Document Header */}
                <div
                  onClick={() => handleSelectMatch(docId)}
                  className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer text-xs font-bold text-slate-900 dark:text-white transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{group.docTitle}</span>
                    {group.folderName && (
                      <span className="text-[10px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Folder className="h-2.5 w-2.5" />
                        {group.folderName}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {group.matches.length} match{group.matches.length === 1 ? '' : 'es'}
                  </span>
                </div>

                {/* Matches in Document */}
                <div className="space-y-0.5 pl-6">
                  {group.matches.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      onClick={() => handleSelectMatch(docId)}
                      className="group flex items-start gap-2.5 px-2 py-1 rounded text-[11px] font-mono hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <span className="text-slate-400 text-[10px] select-none shrink-0 w-8 text-right">
                        L{m.lineNumber}
                      </span>
                      <div className="truncate flex-1">
                        <span>{m.lineContent.slice(0, m.matchStart)}</span>
                        <mark className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold px-0.5 rounded">
                          {m.lineContent.slice(m.matchStart, m.matchEnd)}
                        </mark>
                        <span>{m.lineContent.slice(m.matchEnd)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-7 px-3"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
