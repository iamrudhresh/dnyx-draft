'use client';

import {
  Binary,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  GraduationCap,
  Lock,
  Presentation,
  ShieldCheck,
  Terminal,
  Users,
  Workflow,
} from 'lucide-react';
import type React from 'react';

const USE_CASES = [
  {
    icon: <Terminal className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    role: 'Software Engineers & Architects',
    tagline: 'Technical RFCs, API Specs & Code Documentation',
    description:
      'Write architecture decision records with interactive Mermaid flowcharts, syntax-highlighted code blocks, and VS Code-style keyboard shortcuts.',
    bullets: [
      'Interactive Mermaid.js architecture diagrams',
      'Fuzzy Command Palette (Ctrl+P / Cmd+K)',
      'Direct screenshot paste and image drop',
      'Native local disk folder mounting',
    ],
    badgeColor: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
    role: 'Students, Academics & Researchers',
    tagline: 'Mathematical Proofs, Equations & Research Papers',
    description:
      'Draft mathematical derivations with instant KaTeX LaTeX formula rendering. Cross-reference related research papers using internal [[WikiLinks]].',
    bullets: [
      'Fast inline & block LaTeX math ($...$ & $$...$$)',
      'Bidirectional [[WikiLinks]] note connectivity',
      'Word count & reading pace metrics in real-time',
      'One-click Table of Contents generation',
    ],
    badgeColor: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    icon: <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    role: 'Technical Writers & Content Creators',
    tagline: 'Structured Documentation, Guides & Word Export',
    description:
      'Build complex data tables with the visual table editor, convert raw CSVs into markdown grids, and export directly to Microsoft Word (.docx).',
    bullets: [
      'Direct export to Microsoft Word (.docx)',
      'Visual interactive Table Builder & CSV Converter',
      'Flesch Reading Ease readability scoring',
      'Standalone HTML export with custom stylesheets',
    ],
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    icon: <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    role: 'Privacy-Conscious Professionals',
    tagline: 'Confidential Notes & Zero-Knowledge Vaults',
    description:
      'Store sensitive business strategies, passwords, and private journals with military-grade PBKDF2 + AES-256-GCM client-side encryption.',
    bullets: [
      'Zero-knowledge AES-256 password lock',
      '100% offline local storage (IndexedDB)',
      'Zero server tracking or telemetry',
      'Complete workspace backup as ZIP archive',
    ],
    badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
];

export const UseCasesSection: React.FC = () => {
  return (
    <section id="use-cases" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070a11] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
            <Users className="h-3.5 w-3.5" />
            <span>Target Audiences &amp; Workflows</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Built for High-Velocity Thinking
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Whether you are writing a distributed systems RFC, solving calculus equations, or securing proprietary notes, Dnyx Draft adapts to your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {USE_CASES.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0b0f19] hover:border-blue-500/80 dark:hover:border-blue-500/80 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.role}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.tagline}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2">
                {item.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
