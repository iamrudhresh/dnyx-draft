'use client';

import { Database, KeyRound, ServerOff, ShieldCheck } from 'lucide-react';
import type React from 'react';

export const ArchitectureSection: React.FC = () => {
  return (
    <section id="architecture" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#070a12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Zero-Knowledge Architecture
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            No accounts, no tracking cookies, and no background database synchronization. Your data remains strictly inside your machine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
              <ServerOff className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Client-Side Execution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All Markdown parsing, diagram compilation, and Word document bundling runs inside your web browser using pure TypeScript.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Dexie.js IndexedDB Engine</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Documents and folder structures are indexed locally in browser IndexedDB with debounced auto-saving and full offline persistence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">WebCrypto AES-256 Vault</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Standardized WebCrypto PBKDF2 key derivation and AES-GCM encryption guarantee that locked notes cannot be read even from direct storage dumps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">BYOK AI, Direct to Provider</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI requests go straight from your browser to Anthropic or OpenAI using your own encrypted key. Dnyx Draft&apos;s servers never see your prompts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
