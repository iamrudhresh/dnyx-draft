'use client';

import { ChevronDown, ChevronUp, HelpCircle, Layers, Lock, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Privacy & Storage',
    question: 'Where is my data stored? Does it touch any servers?',
    answer:
      'All your documents, folders, and settings are stored 100% client-side inside your browser’s IndexedDB database using Dexie.js. No documents, keystrokes, or metadata are transmitted to any remote server.',
  },
  {
    category: 'Security',
    question: 'How does client-side AES-256 password encryption work?',
    answer:
      'When you lock a document, your passphrase derives a 256-bit AES key via PBKDF2 (100,000 rounds) using the WebCrypto API. The document content is encrypted using AES-GCM and stored as ciphertext in IndexedDB. Without your secret passphrase, it cannot be decrypted even with direct disk access.',
  },
  {
    category: 'Formats & Export',
    question: 'Can I export my notes to Microsoft Word or a ZIP archive?',
    answer:
      'Yes. You can export any document directly as a styled Microsoft Word document (.docx) or download your complete workspace organized by folders in a single .zip file at any time with one click.',
  },
  {
    category: 'Version History',
    question: 'How does Document Version History and Diff comparison work?',
    answer:
      'You can create version snapshots with custom descriptions at any milestone. The built-in diff viewer provides a Git-style line-by-line comparison with green added and red deleted highlights, with instant one-click rollback.',
  },
  {
    category: 'Accessibility',
    question: 'Is voice-to-text dictation really free with no subscription?',
    answer:
      'Yes. Voice dictation is powered entirely by the browser’s built-in Web Speech API. There are no API keys, no subscription tiers, and no cloud service fees required.',
  },
  {
    category: 'Hardware & OS',
    question: 'Can I open directories from my local hard drive?',
    answer:
      'Yes. Dnyx Draft supports the Web File System Access API. Click the HardDrive icon in the sidebar to open any folder from your PC and edit markdown files in-place.',
  },
  {
    category: 'Rendering',
    question: 'Which syntax formats and diagram types are supported?',
    answer:
      'Dnyx Draft supports standard GitHub Flavored Markdown (GFM), inline and block LaTeX math formulas via KaTeX ($...$ and $$...$$), Mermaid.js diagrams and flowcharts, syntax-highlighted code blocks via highlight.js, and WikiLinks ([[Document Title]]).',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#070a12]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Support &amp; Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Everything you need to know about privacy, storage, and engine capabilities.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60 shrink-0">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-blue-500 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
