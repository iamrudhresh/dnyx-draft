'use client';

import { CaseSensitive, Regex, Replace, Search, WholeWord, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FindAndReplaceBarProps {
  open: boolean;
  onClose: () => void;
  content: string;
  onUpdateContent: (newContent: string) => void;
}

export const FindAndReplaceBar: React.FC<FindAndReplaceBarProps> = ({
  open,
  onClose,
  content,
  onUpdateContent,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  if (!open) return null;

  const createRegex = (global = true) => {
    if (!findText) return null;
    try {
      let pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord && !useRegex) {
        pattern = `\\b${pattern}\\b`;
      }
      const flags = (global ? 'g' : '') + (matchCase ? '' : 'i');
      return new RegExp(pattern, flags);
    } catch {
      return null;
    }
  };

  const regex = createRegex();
  const matches = findText && regex ? (content.match(regex) || []).length : 0;

  const handleReplace = () => {
    const singleRegex = createRegex(false);
    if (!singleRegex) return;
    const newContent = content.replace(singleRegex, replaceText);
    onUpdateContent(newContent);
  };

  const handleReplaceAll = () => {
    const allRegex = createRegex(true);
    if (!allRegex) return;
    const newContent = content.replace(allRegex, replaceText);
    onUpdateContent(newContent);
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#0b0f19]/95 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 select-none shadow-xs backdrop-blur-sm transition-all animate-in slide-in-from-top-2 duration-150">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Find Input */}
        <div className="relative flex items-center min-w-[180px] max-w-xs flex-1">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find in document..."
            className="w-full pl-8 pr-16 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
          {findText && (
            <span className="absolute right-2 text-[10px] font-mono text-slate-400">
              {matches} found
            </span>
          )}
        </div>

        {/* Search Options */}
        <div className="flex items-center gap-0.5 border border-slate-200 dark:border-slate-700 rounded-md p-0.5 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setMatchCase(!matchCase)}
            className={`p-1 rounded ${matchCase ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
            title="Match Case"
          >
            <CaseSensitive className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setWholeWord(!wholeWord)}
            className={`p-1 rounded ${wholeWord ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
            title="Match Whole Word"
          >
            <WholeWord className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setUseRegex(!useRegex)}
            className={`p-1 rounded ${useRegex ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
            title="Use Regular Expression"
          >
            <Regex className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Replace Input */}
        <div className="relative flex items-center min-w-[180px] max-w-xs flex-1">
          <Replace className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            className="w-full pl-8 pr-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>

        {/* Replace Buttons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReplace}
            disabled={!findText || matches === 0}
            className="h-7 text-xs"
          >
            Replace
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReplaceAll}
            disabled={!findText || matches === 0}
            className="h-7 text-xs"
          >
            Replace All
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
        title="Close (Escape)"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
