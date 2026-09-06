'use client';

import {
  Activity,
  Archive,
  Command,
  Download,
  FileCode,
  HardDrive,
  History,
  Lock,
  Mic,
  Palette,
  Sparkles,
  Zap,
} from 'lucide-react';
import type React from 'react';

const FEATURES = [
  {
    icon: <Command className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    title: 'VS Code Command Palette',
    description:
      'Fuzzy-search across all documents and execute any action with zero mouse friction using Ctrl+P / Cmd+K.',
    badge: 'Productivity',
    color: 'border-blue-500/30 group-hover:border-blue-500',
  },
  {
    icon: <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    title: 'Zero-Knowledge AES-256 Vault',
    description:
      'Lock sensitive notes with browser-native WebCrypto AES-256-GCM. Unencrypted plaintext never touches storage.',
    badge: 'Security',
    color: 'border-amber-500/30 group-hover:border-amber-500',
  },
  {
    icon: <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
    title: 'Version History & Visual Diffs',
    description:
      'Inspect past revisions, track modifications with side-by-side green/red diffs, and rollback with one click.',
    badge: 'Safety',
    color: 'border-indigo-500/30 group-hover:border-indigo-500',
  },
  {
    icon: <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    title: 'Universal Export Engine',
    description:
      'Export directly to Microsoft Word (.docx), standalone rendered HTML with styles & KaTeX, or full workspace ZIPs.',
    badge: 'Portability',
    color: 'border-emerald-500/30 group-hover:border-emerald-500',
  },
  {
    icon: <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
    title: '100% Offline Local-First',
    description:
      'Zero server latency. All documents, folders, and settings persist securely in Dexie.js (IndexedDB).',
    badge: 'Privacy',
    color: 'border-purple-500/30 group-hover:border-purple-500',
  },
  {
    icon: <Mic className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
    title: 'Free Voice-to-Text Dictation',
    description:
      'Dictate your notes naturally with browser-native Web Speech API. Completely free with zero third-party API costs.',
    badge: 'Accessibility',
    color: 'border-rose-500/30 group-hover:border-rose-500',
  },
  {
    icon: <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
    title: 'Document Diagnostics & Linting',
    description:
      'Real-time Flesch reading ease scores, estimated speaking pace, word metrics, and broken markdown syntax detection.',
    badge: 'Analytics',
    color: 'border-teal-500/30 group-hover:border-teal-500',
  },
  {
    icon: <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />,
    title: 'Adaptive Dark & Light Modes',
    description:
      'Seamless theme synchronization across editor, live preview, syntax highlighting, and Mermaid SVG diagrams.',
    badge: 'Design',
    color: 'border-pink-500/30 group-hover:border-pink-500',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Engineered for Power Users
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          Every tool you need to write technical specifications, documentation, academic papers, and private notes without vendor lock-in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((feature, idx) => (
          <div
            key={idx}
            className="group relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] hover:border-blue-500/80 dark:hover:border-blue-500/80 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-800">
                  {feature.badge}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
