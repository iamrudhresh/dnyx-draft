'use client';

import { ArrowRight, KeyRound, Sparkles, Wand2, Workflow } from 'lucide-react';
import type React from 'react';

const AI_ACTIONS = [
  { label: 'Fix grammar', color: 'bg-blue-600' },
  { label: 'Summarize selection', color: 'bg-purple-600' },
  { label: 'Rewrite tone', color: 'bg-indigo-600' },
  { label: 'Shorten paragraph', color: 'bg-emerald-600' },
  { label: 'Generate Mermaid diagram', color: 'bg-amber-600' },
];

export const AiSection: React.FC = () => {
  return (
    <section id="ai" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
              <Wand2 className="h-3.5 w-3.5" />
              <span>Bring Your Own Key</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              AI writing help, without giving up your privacy.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Plug in your own Anthropic (Claude) or OpenAI API key and get inline writing actions —
              summarize, fix grammar, rewrite, shorten — plus AI diagram generation that turns a plain
              description into a ready-to-insert Mermaid block. Your key is AES-GCM encrypted at rest and
              unlocked locally with a passphrase; requests go straight from your browser to the provider.
              Dnyx Draft&apos;s servers never see your key, your prompts, or your documents.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Encrypted key vault</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your API key is AES-GCM encrypted in IndexedDB — never stored in plaintext, never uploaded.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Inline writing actions</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Summarize, fix grammar, rewrite, or shorten any selection — or the whole document — in one click.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Workflow className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">AI diagram generation</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Describe a flow in plain language and get a ready-to-insert Mermaid diagram back.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mock panel */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs">
              <span className="font-mono text-[11px] text-slate-500">AI Actions</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Your key, connected directly
              </span>
            </div>
            <div className="p-5 space-y-2.5">
              {AI_ACTIONS.map((action) => (
                <div
                  key={action.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-purple-400 dark:hover:border-purple-600 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${action.color}`} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {action.label}
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                POST https://api.anthropic.com/v1/messages
                <br />
                <span className="text-slate-400 dark:text-slate-500"># sent directly from your browser</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
