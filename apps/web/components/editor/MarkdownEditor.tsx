'use client';

import type React from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { CodeMirrorEditor, type CodeMirrorEditorRef } from './CodeMirrorEditor';
import { EditorToolbar } from './EditorToolbar';
import { FindAndReplaceBar } from './FindAndReplaceBar';

export interface MarkdownEditorRef {
  getScrollPercent: () => number;
  scrollToPercent: (percent: number) => void;
}

interface MarkdownEditorProps {
  onScrollPercent?: (percent: number) => void;
  onOpenCommandPalette?: () => void;
}

export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  ({ onScrollPercent, onOpenCommandPalette: _onOpenCommandPalette }, ref) => {
    const { documents, activeDocumentId, updateDocument, createDocument } = useWorkspaceStore();
    const { fontSize, wordWrap, fontFamily, tabSize, lineNumbers, vimMode } = useSettingsStore();
    const activeDoc = documents.find((d) => d.id === activeDocumentId);
    const cmRef = useRef<CodeMirrorEditorRef>(null);
    const [findReplaceOpen, setFindReplaceOpen] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [selectionStats, setSelectionStats] = useState<{
      words: number;
      chars: number;
      text: string;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      getScrollPercent: () => cmRef.current?.getScrollPercent() ?? 0,
      scrollToPercent: (percent) => cmRef.current?.scrollToPercent(percent),
    }));

    const handleContentChange = useCallback(
      (newValue: string) => {
        if (!activeDoc) return;
        updateDocument(activeDoc.id, { content: newValue });
      },
      [activeDoc, updateDocument],
    );

    const insertText = useCallback((prefix: string, suffix = '', defaultText = '') => {
      cmRef.current?.insertText(prefix, suffix, defaultText);
    }, []);

    // Direct image paste
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            if (base64) {
              insertText(`\n\n![Screenshot ${new Date().toLocaleTimeString()}](${base64})\n\n`, '');
              toast.success('Pasted image screenshot directly into document');
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    };

    // Drag & drop files
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            if (base64) {
              insertText(`\n\n![${file.name}](${base64})\n\n`, '');
              toast.success(`Embedded image "${file.name}"`);
            }
          };
          reader.readAsDataURL(file);
        } else if (
          file.name.endsWith('.md') ||
          file.name.endsWith('.markdown') ||
          file.name.endsWith('.txt')
        ) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const text = ev.target?.result as string;
            if (text) {
              createDocument(file.name, null, text);
              toast.success(`Imported document "${file.name}"`);
            }
          };
          reader.readAsText(file);
        }
      }
    };

    if (!activeDoc) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-white dark:bg-[#0d1117]">
          <div className="text-center space-y-3">
            <div className="text-5xl opacity-20">📝</div>
            <p className="font-medium text-slate-500 dark:text-slate-400">
              Select or create a document to start writing.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Ctrl+N for a new file · Ctrl+P for Command Palette · Type{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                /
              </kbd>{' '}
              for slash commands
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="h-full flex flex-col bg-white dark:bg-[#0d1117] transition-colors relative"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        {/* Drag overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-30 bg-blue-500/10 dark:bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-xl border border-blue-500 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Drop image or markdown file to import
            </div>
          </div>
        )}

        <EditorToolbar
          onInsert={insertText}
          onToggleFindReplace={() => setFindReplaceOpen((prev) => !prev)}
          selectionStats={selectionStats}
          selectedText={selectionStats?.text ?? null}
        />

        <FindAndReplaceBar
          open={findReplaceOpen}
          onClose={() => setFindReplaceOpen(false)}
          content={activeDoc.content}
          onUpdateContent={(newContent) => updateDocument(activeDoc.id, { content: newContent })}
        />

        <div className="flex-1 overflow-hidden">
          <CodeMirrorEditor
            ref={cmRef}
            value={activeDoc.content}
            onChange={handleContentChange}
            onScrollPercent={onScrollPercent}
            onSelectionChange={setSelectionStats}
            fontSize={fontSize}
            fontFamily={fontFamily}
            wordWrap={wordWrap}
            tabSize={tabSize}
            lineNumbers={lineNumbers}
            vimMode={vimMode}
          />
        </div>
      </div>
    );
  },
);

MarkdownEditor.displayName = 'MarkdownEditor';
