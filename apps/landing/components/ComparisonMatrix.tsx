'use client';

import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type React from 'react';

interface ComparisonRow {
  feature: string;
  mv: { status: 'yes' | 'partial' | 'no'; label: string };
  notion: { status: 'yes' | 'partial' | 'no'; label: string };
  obsidian: { status: 'yes' | 'partial' | 'no'; label: string };
  typora: { status: 'yes' | 'partial' | 'no'; label: string };
}

const COMPARISONS: ComparisonRow[] = [
  {
    feature: 'Local-First Offline Persistence',
    mv: { status: 'yes', label: '100% Offline (IndexedDB)' },
    notion: { status: 'no', label: 'Cloud-Required' },
    obsidian: { status: 'yes', label: 'Local Files' },
    typora: { status: 'yes', label: 'Local Files' },
  },
  {
    feature: 'Runs in the Browser (No Install)',
    mv: { status: 'yes', label: 'Zero-Install Web App' },
    notion: { status: 'yes', label: 'Web + Desktop' },
    obsidian: { status: 'no', label: 'Desktop App Only' },
    typora: { status: 'no', label: 'Desktop App Only' },
  },
  {
    feature: 'BYOK AI Writing Assistant',
    mv: { status: 'yes', label: 'Your Own Anthropic/OpenAI Key' },
    notion: { status: 'partial', label: 'Notion AI Add-on ($)' },
    obsidian: { status: 'partial', label: 'Via Plugin' },
    typora: { status: 'no', label: 'Not Supported' },
  },
  {
    feature: 'Real-Time Collaboration',
    mv: { status: 'yes', label: 'Live Share, No Account' },
    notion: { status: 'yes', label: 'Supported' },
    obsidian: { status: 'partial', label: 'Paid Sync Plugin' },
    typora: { status: 'no', label: 'Not Supported' },
  },
  {
    feature: 'Multi-Format File Viewer',
    mv: { status: 'yes', label: 'CSV, JSON, XLSX, PDF, Jupyter…' },
    notion: { status: 'partial', label: 'Embeds Only' },
    obsidian: { status: 'partial', label: 'Via Plugins' },
    typora: { status: 'no', label: 'Markdown Only' },
  },
  {
    feature: '12+ Diagram Engines',
    mv: { status: 'yes', label: 'Mermaid, D2, Graphviz, PlantUML…' },
    notion: { status: 'partial', label: 'Mermaid Only' },
    obsidian: { status: 'partial', label: 'Mermaid via Plugin' },
    typora: { status: 'partial', label: 'Mermaid Only' },
  },
  {
    feature: 'Client-Side Password Encryption',
    mv: { status: 'yes', label: 'AES-256-GCM Vault' },
    notion: { status: 'no', label: 'No File Passwords' },
    obsidian: { status: 'partial', label: 'Via Plugin' },
    typora: { status: 'no', label: 'No Encryption' },
  },
  {
    feature: 'Direct Word (.docx) & ZIP Export',
    mv: { status: 'yes', label: 'Instant Client-side' },
    notion: { status: 'no', label: 'HTML/PDF Only' },
    obsidian: { status: 'partial', label: 'Via Pandoc CLI' },
    typora: { status: 'yes', label: 'Via Pandoc' },
  },
  {
    feature: 'Account / Registration Required',
    mv: { status: 'yes', label: 'No Login (Instant)' },
    notion: { status: 'no', label: 'Mandatory Login' },
    obsidian: { status: 'yes', label: 'No Account (Free)' },
    typora: { status: 'yes', label: 'No Account (Paid App)' },
  },
];

const StatusCell: React.FC<{ data: { status: 'yes' | 'partial' | 'no'; label: string }; isMv?: boolean }> = ({
  data,
  isMv,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
        data.status === 'yes'
          ? isMv
            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
            : 'text-emerald-700 dark:text-emerald-400'
          : data.status === 'partial'
            ? 'text-amber-700 dark:text-amber-400'
            : 'text-slate-500 dark:text-slate-400'
      }`}
    >
      {data.status === 'yes' ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : data.status === 'partial' ? (
        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
      )}
      <span>{data.label}</span>
    </div>
  );
};

export const ComparisonMatrix: React.FC = () => {
  return (
    <section id="comparison" className="py-24 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          How Dnyx Draft Compares
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          See why engineers, technical writers, and researchers choose Dnyx Draft over cloud silos.
        </p>
      </div>

      <div className="max-w-5xl mx-auto overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl bg-white dark:bg-[#0b0f19]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              <th className="p-4 font-bold text-sm">Capability</th>
              <th className="p-4 font-bold text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Dnyx Draft
              </th>
              <th className="p-4 font-medium text-slate-500">Notion</th>
              <th className="p-4 font-medium text-slate-500">Obsidian</th>
              <th className="p-4 font-medium text-slate-500">Typora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {COMPARISONS.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
              >
                <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                  {row.feature}
                </td>
                <td className="p-4 bg-blue-500/5">
                  <StatusCell data={row.mv} isMv />
                </td>
                <td className="p-4">
                  <StatusCell data={row.notion} />
                </td>
                <td className="p-4">
                  <StatusCell data={row.obsidian} />
                </td>
                <td className="p-4">
                  <StatusCell data={row.typora} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
