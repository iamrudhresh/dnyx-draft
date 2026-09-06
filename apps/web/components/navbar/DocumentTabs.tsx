'use client';

import { FileText, Pin, PinOff, Plus, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { cn } from '@/lib/utils';

export const DocumentTabs: React.FC = () => {
  const {
    documents,
    openTabs,
    pinnedTabs,
    activeDocumentId,
    setActiveDocument,
    closeTab,
    createDocument,
    reorderTabs,
    pinTab,
    unpinTab,
  } = useWorkspaceStore();

  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [contextTab, setContextTab] = useState<string | null>(null);

  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedTabIndex(index);
    e.dataTransfer.setData('text/plain', `${index}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTabIndex === null || draggedTabIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTabIndex !== null && draggedTabIndex !== index) {
      reorderTabs(draggedTabIndex, index);
    }
    setDraggedTabIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTabIndex(null);
    setDragOverIndex(null);
  };

  // Sort: pinned tabs first
  const sortedTabs = [...openTabs].sort((a, b) => {
    const aPinned = pinnedTabs.includes(a);
    const bPinned = pinnedTabs.includes(b);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto bg-slate-100/80 dark:bg-[#0b0f19] px-2 pt-1.5 border-b border-slate-200 dark:border-slate-800/80 select-none scrollbar-none transition-colors"
      onClick={() => setContextTab(null)}
    >
      {sortedTabs.map((tabId, index) => {
        const doc = documents.find((d) => d.id === tabId);
        if (!doc) return null;
        const isActive = activeDocumentId === tabId;
        const isPinned = pinnedTabs.includes(tabId);
        const isDragged = draggedTabIndex === index;
        const isDragOver = dragOverIndex === index;
        const isContextOpen = contextTab === tabId;

        return (
          <div key={tabId} className="relative">
            <div
              draggable
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDrop={(e) => handleDrop(index, e)}
              onDragEnd={handleDragEnd}
              onClick={() => setActiveDocument(tabId)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextTab(isContextOpen ? null : tabId);
              }}
              className={cn(
                'group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg border-t border-x cursor-pointer transition-all max-w-[200px]',
                isActive
                  ? 'bg-white dark:bg-[#090d16] text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-800 shadow-xs'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200',
                isDragged && 'opacity-40 scale-95',
                isDragOver && 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 scale-[1.02]',
                isPinned && 'pr-2',
              )}
            >
              {isPinned ? (
                <Pin
                  className={cn(
                    'h-3 w-3 shrink-0 transition-colors fill-current',
                    isActive ? 'text-blue-500' : 'text-slate-400',
                  )}
                />
              ) : (
                <FileText
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-colors',
                    isActive ? 'text-blue-500' : 'opacity-60',
                  )}
                />
              )}
              <span className="truncate">{doc.title}</span>
              {!isPinned && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tabId);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-slate-100 p-0.5 rounded-full transition-all ml-0.5 shrink-0"
                  title="Close Tab"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Right-click context menu */}
            {isContextOpen && (
              <div
                className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    isPinned ? unpinTab(tabId) : pinTab(tabId);
                    setContextTab(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {isPinned ? (
                    <PinOff className="h-3.5 w-3.5 text-slate-500" />
                  ) : (
                    <Pin className="h-3.5 w-3.5 text-blue-500" />
                  )}
                  {isPinned ? 'Unpin Tab' : 'Pin Tab'}
                </button>
                {!isPinned && (
                  <button
                    type="button"
                    onClick={() => {
                      closeTab(tabId);
                      setContextTab(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Close Tab
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => createDocument('Untitled.md')}
        className="p-1 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 rounded-md transition-colors ml-1 shrink-0"
        title="New Document (Ctrl+N)"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};
