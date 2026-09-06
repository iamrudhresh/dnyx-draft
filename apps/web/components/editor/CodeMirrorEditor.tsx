'use client';

import { autocompletion, type CompletionContext } from '@codemirror/autocomplete';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorSelection } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useTheme } from 'next-themes';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

export interface CodeMirrorEditorRef {
  insertText: (prefix: string, suffix?: string, defaultText?: string) => void;
  getScrollPercent: () => number;
  scrollToPercent: (percent: number) => void;
  focus: () => void;
  getValue: () => string;
}

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScrollPercent?: (percent: number) => void;
  onSelectionChange?: (stats: { words: number; chars: number; text: string } | null) => void;
  fontSize?: number;
  fontFamily?: string;
  wordWrap?: boolean;
  tabSize?: number;
  lineNumbers?: boolean;
  vimMode?: boolean;
}

// Slash command completions — triggers when typing / at the start of a word
function slashCompletions(context: CompletionContext) {
  const match = context.matchBefore(/\/\w*/);
  if (!match || (match.from === match.to && !context.explicit)) return null;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    from: match.from,
    options: [
      {
        label: '/h1',
        displayLabel: '# Heading 1',
        detail: 'Large heading',
        apply: '# Heading 1\n',
        type: 'keyword',
      },
      {
        label: '/h2',
        displayLabel: '## Heading 2',
        detail: 'Medium heading',
        apply: '## Heading 2\n',
        type: 'keyword',
      },
      {
        label: '/h3',
        displayLabel: '### Heading 3',
        detail: 'Small heading',
        apply: '### Heading 3\n',
        type: 'keyword',
      },
      {
        label: '/bold',
        displayLabel: '**Bold**',
        detail: 'Bold text',
        apply: '**bold text**',
        type: 'text',
      },
      {
        label: '/italic',
        displayLabel: '*Italic*',
        detail: 'Italic text',
        apply: '*italic text*',
        type: 'text',
      },
      {
        label: '/strike',
        displayLabel: '~~Strike~~',
        detail: 'Strikethrough',
        apply: '~~strikethrough~~',
        type: 'text',
      },
      {
        label: '/highlight',
        displayLabel: '==Highlight==',
        detail: 'Highlight text',
        apply: '==highlighted text==',
        type: 'text',
      },
      {
        label: '/link',
        displayLabel: '[Link](url)',
        detail: 'Hyperlink',
        apply: '[link text](https://example.com)',
        type: 'function',
      },
      {
        label: '/image',
        displayLabel: '![Image](url)',
        detail: 'Embed image',
        apply: '![alt text](https://example.com/image.png)',
        type: 'function',
      },
      {
        label: '/code',
        displayLabel: '```code```',
        detail: 'Code block',
        apply: '```typescript\n// your code here\n```\n',
        type: 'function',
      },
      {
        label: '/math',
        displayLabel: '$$Math$$',
        detail: 'LaTeX math block',
        apply: '$$\nE = mc^2\n$$\n',
        type: 'function',
      },
      {
        label: '/inlinemath',
        displayLabel: '$math$',
        detail: 'Inline math',
        apply: '$E = mc^2$',
        type: 'function',
      },
      {
        label: '/table',
        displayLabel: '| Table |',
        detail: '3-column table',
        apply:
          '| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |\n',
        type: 'function',
      },
      {
        label: '/mermaid',
        displayLabel: '```mermaid```',
        detail: 'Flowchart diagram',
        apply:
          '\n\n```mermaid\nflowchart LR\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result]\n    B -->|No| D[Other]\n```\n',
        type: 'function',
      },
      {
        label: '/list',
        displayLabel: '- Bullet list',
        detail: 'Unordered list',
        apply: '- Item 1\n- Item 2\n- Item 3\n',
        type: 'keyword',
      },
      {
        label: '/numbered',
        displayLabel: '1. Numbered list',
        detail: 'Ordered list',
        apply: '1. Item 1\n2. Item 2\n3. Item 3\n',
        type: 'keyword',
      },
      {
        label: '/task',
        displayLabel: '- [ ] Task list',
        detail: 'Checkbox list',
        apply: '- [ ] Task 1\n- [ ] Task 2\n- [x] Completed task\n',
        type: 'keyword',
      },
      {
        label: '/quote',
        displayLabel: '> Blockquote',
        detail: 'Quote block',
        apply: '> Your quote or reference here.\n',
        type: 'text',
      },
      {
        label: '/callout',
        displayLabel: '> [!NOTE]',
        detail: 'Info callout box',
        apply: '> [!NOTE]\n> Important information here.\n',
        type: 'text',
      },
      {
        label: '/hr',
        displayLabel: '--- Divider',
        detail: 'Horizontal rule',
        apply: '\n---\n\n',
        type: 'keyword',
      },
      {
        label: '/date',
        displayLabel: 'Insert today',
        detail: today,
        apply: today,
        type: 'constant',
      },
      {
        label: '/toc',
        displayLabel: 'Table of Contents',
        detail: 'Auto TOC placeholder',
        apply: '<!-- TOC -->\n',
        type: 'function',
      },
    ],
    filter: true,
  };
}

export const CodeMirrorEditor = forwardRef<CodeMirrorEditorRef, CodeMirrorEditorProps>(
  (
    {
      value,
      onChange,
      onScrollPercent,
      onSelectionChange,
      fontSize = 15,
      fontFamily = 'monospace',
      wordWrap = true,
      tabSize = 2,
      lineNumbers: showLineNumbers = true,
      vimMode: _vimMode = false,
    },
    ref,
  ) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const cmRef = useRef<ReactCodeMirrorRef>(null);

    useImperativeHandle(ref, () => ({
      insertText: (prefix: string, suffix = '', defaultText = '') => {
        const view = cmRef.current?.view;
        if (!view) return;
        const { from, to } = view.state.selection.main;
        const selectedText = view.state.sliceDoc(from, to);
        const text = selectedText || defaultText;
        const replacement = `${prefix}${text}${suffix}`;
        view.dispatch({
          changes: { from, to, insert: replacement },
          selection: EditorSelection.range(
            from + prefix.length,
            from + prefix.length + text.length,
          ),
        });
        view.focus();
      },

      getScrollPercent: () => {
        const scrollEl = cmRef.current?.view?.scrollDOM;
        if (!scrollEl) return 0;
        const { scrollTop, scrollHeight, clientHeight } = scrollEl;
        return scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
      },

      scrollToPercent: (percent: number) => {
        const scrollEl = cmRef.current?.view?.scrollDOM;
        if (!scrollEl) return;
        const { scrollHeight, clientHeight } = scrollEl;
        scrollEl.scrollTop = percent * (scrollHeight - clientHeight);
      },

      focus: () => cmRef.current?.view?.focus(),

      getValue: () => cmRef.current?.view?.state.doc.toString() || '',
    }));

    // Scroll listener for sync scroll
    const scrollListenerAttached = useRef(false);
    const handleScrollRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      const attachScroll = () => {
        const scrollEl = cmRef.current?.view?.scrollDOM;
        if (!scrollEl || !onScrollPercent || scrollListenerAttached.current) return;

        handleScrollRef.current = () => {
          const { scrollTop, scrollHeight, clientHeight } = scrollEl;
          const pct = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
          onScrollPercent(pct);
        };

        scrollEl.addEventListener('scroll', handleScrollRef.current, { passive: true });
        scrollListenerAttached.current = true;
      };

      // Retry until view is ready
      const timer = setTimeout(attachScroll, 100);
      return () => {
        clearTimeout(timer);
        const scrollEl = cmRef.current?.view?.scrollDOM;
        if (scrollEl && handleScrollRef.current) {
          scrollEl.removeEventListener('scroll', handleScrollRef.current);
          scrollListenerAttached.current = false;
        }
      };
    }, [onScrollPercent]);

    const monoFont =
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    const resolvedFont = fontFamily === 'monospace' ? monoFont : fontFamily;

    // Custom theme — only font/layout, colors handled by githubLight/githubDark
    const editorTheme = useMemo(
      () =>
        EditorView.theme({
          '&': {
            fontSize: `${fontSize}px`,
            fontFamily: resolvedFont,
            height: '100%',
          },
          '.cm-scroller': {
            fontFamily: resolvedFont,
            lineHeight: '1.75',
            padding: '0',
            overflow: 'auto',
          },
          '.cm-content': {
            padding: '20px 24px',
            maxWidth: '100%',
            minHeight: '100%',
          },
          '.cm-line': { padding: '0' },
          '.cm-gutters': {
            padding: '0 8px 0 4px',
            minWidth: '3rem',
          },
          '.cm-tooltip.cm-tooltip-autocomplete': {
            borderRadius: '8px',
            border: '1px solid rgba(100,100,100,0.2)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            fontSize: '12px',
            maxHeight: '280px',
          },
          '.cm-tooltip-autocomplete ul li': {
            padding: '4px 10px',
          },
          '.cm-tooltip-autocomplete ul li[aria-selected]': {
            borderRadius: '4px',
          },
        }),
      [fontSize, resolvedFont],
    );

    const extensions = useMemo(() => {
      const exts = [
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        autocompletion({ override: [slashCompletions], activateOnTyping: true }),
        editorTheme,
        // Preserve selection when right-clicking to open a context menu.
        // Without this, CodeMirror moves the cursor on every mousedown, clearing any selection.
        EditorView.domEventHandlers({
          mousedown(e) {
            if (e.button === 2) return true; // "handled" — stops CM from repositioning cursor
            return false;
          },
        }),
        keymap.of([
          {
            key: 'Tab',
            run: (view) => {
              const indent = ' '.repeat(tabSize);
              view.dispatch(view.state.replaceSelection(indent));
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.selectionSet && onSelectionChange) {
            const { from, to } = update.state.selection.main;
            if (from !== to) {
              const selected = update.state.sliceDoc(from, to);
              const words = selected.trim().split(/\s+/).filter(Boolean).length;
              onSelectionChange({ words, chars: selected.length, text: selected });
            } else {
              onSelectionChange(null);
            }
          }
        }),
      ];

      if (wordWrap) exts.push(EditorView.lineWrapping);

      return exts;
    }, [editorTheme, wordWrap, tabSize, onSelectionChange]);

    const onChangeCb = useCallback(
      (val: string) => {
        onChange(val);
      },
      [onChange],
    );

    return (
      <CodeMirror
        ref={cmRef}
        value={value}
        onChange={onChangeCb}
        height="100%"
        theme={isDark ? githubDark : githubLight}
        extensions={extensions}
        className="h-full overflow-hidden"
        basicSetup={{
          lineNumbers: showLineNumbers,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: false, // we have our own Find & Replace
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: false,
          tabSize,
        }}
      />
    );
  },
);

CodeMirrorEditor.displayName = 'CodeMirrorEditor';
