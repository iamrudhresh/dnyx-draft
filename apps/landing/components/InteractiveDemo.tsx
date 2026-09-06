'use client';

import {
  Check,
  Code2,
  Copy,
  Diff,
  FileCode,
  FileSpreadsheet,
  Lock,
  Sigma,
  Workflow,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface DemoTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  markdown: string;
  renderedTitle: string;
  renderedHtml: React.ReactNode;
}

const DEMO_TABS: DemoTab[] = [
  {
    id: 'math',
    name: 'LaTeX Math Formulas',
    icon: <Sigma className="h-4 w-4 text-purple-500" />,
    markdown: `### Standard Normal Distribution

The Gaussian probability density function:

$$
f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}
$$

Inline equations work seamlessly too: $E = mc^2$ and $e^{i\\pi} + 1 = 0$.`,
    renderedTitle: 'Standard Normal Distribution',
    renderedHtml: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 text-xs">
          The Gaussian probability density function:
        </p>
        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-center font-serif text-base text-purple-800 dark:text-purple-300">
          f(x) = (1 / σ√(2π)) · e<sup>-½((x-μ)/σ)²</sup>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-xs">
          Inline equations work seamlessly too:{' '}
          <span className="font-serif italic font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            E = mc²
          </span>{' '}
          and{' '}
          <span className="font-serif italic font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            e<sup>iπ</sup> + 1 = 0
          </span>
          .
        </p>
      </div>
    ),
  },
  {
    id: 'mermaid',
    name: 'Mermaid Flowcharts',
    icon: <Workflow className="h-4 w-4 text-blue-500" />,
    markdown: `\`\`\`mermaid
flowchart TD
  User([User Input]) --> Editor[Markdown Editor]
  Editor --> Parser[AST Lexer Engine]
  Parser --> KaTeX[LaTeX Math Engine]
  Parser --> Highlight[Syntax Highlighter]
  Parser --> Mermaid[Diagram Renderer]
  KaTeX & Highlight & Mermaid --> Preview[Live Split Preview]
\`\`\``,
    renderedTitle: 'System Processing Architecture',
    renderedHtml: (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex justify-center">
          <div className="px-3 py-1.5 rounded-full bg-slate-800 text-white font-semibold text-[11px] shadow-sm">
            User Input
          </div>
        </div>
        <div className="text-center text-slate-400 text-xs">↓</div>
        <div className="flex justify-center">
          <div className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20">
            AST Lexer &amp; Parser Engine
          </div>
        </div>
        <div className="text-center text-slate-400 text-xs">↓</div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="p-2 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
            KaTeX Math
          </div>
          <div className="p-2 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
            highlight.js
          </div>
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
            Mermaid SVG
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'tables',
    name: 'Formatted Tables & CSV',
    icon: <FileSpreadsheet className="h-4 w-4 text-emerald-500" />,
    markdown: `| Engine | Offline Support | DOCX Export | LaTeX Math |
| :--- | :---: | :---: | :---: |
| **Dnyx Draft** | Supported (Local) | Native Client-side | KaTeX (Full) |
| Notion | Cloud-Only | PDF Export Only | Basic |
| Dillinger | Partial | Not Supported | Not Supported |`,
    renderedTitle: 'Formatted Comparison Table',
    renderedHtml: (
      <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold">
            <tr>
              <th className="p-2.5">Engine</th>
              <th className="p-2.5 text-center">Offline Support</th>
              <th className="p-2.5 text-center">DOCX Export</th>
              <th className="p-2.5 text-center">LaTeX Math</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr className="bg-blue-50/40 dark:bg-blue-950/20 font-medium">
              <td className="p-2.5 text-blue-600 dark:text-blue-400 font-bold">Dnyx Draft</td>
              <td className="p-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Supported (Local)</td>
              <td className="p-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Native Client-side</td>
              <td className="p-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">KaTeX (Full)</td>
            </tr>
            <tr>
              <td className="p-2.5">Notion</td>
              <td className="p-2.5 text-center text-slate-500">Cloud-Only</td>
              <td className="p-2.5 text-center text-slate-500">PDF Export Only</td>
              <td className="p-2.5 text-center text-slate-500">Basic</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'vault',
    name: 'AES-256 Crypto Vault',
    icon: <Lock className="h-4 w-4 text-amber-500" />,
    markdown: `🔒 ENCRYPTED VAULT FILE (AES-256-GCM)
---
U2FsdGVkX19G4L6eM0Z28/w... [Zero-Knowledge Ciphertext]

* Password protection prevents plaintext exposure in browser storage.
* PBKDF2 with 100,000 iterations for military-grade key derivation.`,
    renderedTitle: 'Zero-Knowledge Security Architecture',
    renderedHtml: (
      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-2.5">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
          <Lock className="h-4 w-4" /> Password-Protected Document
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          The document content is encrypted using WebCrypto AES-256-GCM before writing to IndexedDB.
          Even with direct disk access, content cannot be decrypted without your password.
        </p>
      </div>
    ),
  },
  {
    id: 'diff',
    name: 'Visual Version Diffs',
    icon: <Diff className="h-4 w-4 text-rose-500" />,
    markdown: `@@ Revision 2 -> Revision 3 @@
- const databaseUrl = "http://localhost:8000";
+ const databaseUrl = "indexeddb://local-vault";
  
  // Initialize storage layer
+ await db.revisions.add(snapshot);`,
    renderedTitle: 'Git-Style Line-by-Line Changes',
    renderedHtml: (
      <div className="p-3 font-mono text-xs space-y-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="p-1 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 line-through">
          - const databaseUrl = &quot;http://localhost:8000&quot;;
        </div>
        <div className="p-1 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          + const databaseUrl = &quot;indexeddb://local-vault&quot;;
        </div>
        <div className="p-1 text-slate-500">  // Initialize storage layer</div>
        <div className="p-1 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          + await db.revisions.add(snapshot);
        </div>
      </div>
    ),
  },
];

export const InteractiveDemo: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>('math');
  const [copied, setCopied] = useState<boolean>(false);
  const activeTab = DEMO_TABS.find((t) => t.id === activeTabId) || DEMO_TABS[0];

  return (
    <section id="demo" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070a11]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Experience the Markdown Engine
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Switch between capabilities to see how Dnyx Draft transforms plain text into rich diagrams, formulas, tables, and secure vaults.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {DEMO_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTabId === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Live Comparison Box */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left: Raw Code */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Markdown Source Input
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeTab.markdown);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-200/80 dark:border-slate-800/80">
                {activeTab.markdown}
              </pre>
            </div>
          </div>

          {/* Right: Rendered Output */}
          <div className="p-6 bg-slate-50/40 dark:bg-[#080c14] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 block mb-2">
                Instant Rendered Result
              </span>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  {activeTab.renderedTitle}
                </h4>
                {activeTab.renderedHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
