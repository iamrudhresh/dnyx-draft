'use client';

import { ArrowRight, CheckCircle2, Play, Sparkles } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { APP_URL } from '@/lib/constants';

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'math' | 'diagram' | 'ai'>('math');

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-[140px] -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
        {/* Pill Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold backdrop-blur-md mb-8 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>Local-First • BYOK AI • Zero Cloud Dependency</span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-slate-500 dark:text-slate-400 font-normal">Next.js 16 + React 19</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.08] mb-6">
          The Private,{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            AI-Powered
          </span>{' '}
          Markdown Workspace.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          A local-first editor with live preview, LaTeX math, 12+ diagram engines, a full multi-format
          file viewer, bring-your-own-key AI writing, and real-time collaboration — all stored in your
          browser. No account, no server, no lock-in.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a href={APP_URL} target="_blank" rel="noreferrer">
            <Button
              size="lg"
              variant="gradient"
              className="w-full sm:w-auto font-bold text-sm h-12 px-8 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              Launch Web Editor Free <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </a>
          <a href="#demo">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto font-medium text-sm h-12 px-6 hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <Play className="h-4 w-4 mr-2 text-blue-500" /> See Interactive Demo
            </Button>
          </a>
        </div>

        {/* Feature Highlights Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-12">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>100% Offline (IndexedDB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>BYOK AI — Keys Never Leave Your Browser</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Live Share &amp; Real-Time Collaboration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>No Account Required</span>
          </div>
        </div>

        {/* Interactive Hero App Mockup */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-2xl overflow-hidden text-left">
          {/* Mock Window Topbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs select-none">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-400/80" />
                <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-slate-500 font-mono text-[11px]">Dnyx Draft — quantum-spec.md</span>
            </div>

            {/* Quick Demo Mode Switcher in Mock Window */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('math')}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  activeTab === 'math'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                LaTeX Math
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  activeTab === 'diagram'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Mermaid Flow
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                AI Rewrite
              </button>
            </div>
          </div>

          {/* Split Mock Pane */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#090d16] font-mono text-xs p-5 sm:p-6 min-h-[300px]">
            {/* Left: Raw Markdown */}
            <div className="space-y-2.5 pr-0 md:pr-4 text-slate-700 dark:text-slate-300 overflow-hidden">
              {activeTab === 'math' && (
                <>
                  <div className="text-blue-600 dark:text-blue-400 font-bold"># Quantum State Evolution</div>
                  <div className="text-slate-400">The Lindblad master equation for open quantum systems:</div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                    {
                      '$$\\frac{d\\rho}{dt} = -\\frac{i}{\\hbar}[H, \\rho] + \\sum_{k} \\left( L_k \\rho L_k^\\dagger - \\frac{1}{2}\\{L_k^\\dagger L_k, \\rho\\} \\right)$$'
                    }
                  </div>
                  <div className="text-slate-500 italic text-[11px]">&gt; Stored securely in Dexie.js IndexedDB.</div>
                </>
              )}

              {activeTab === 'diagram' && (
                <>
                  <div className="text-blue-600 dark:text-blue-400 font-bold"># Architecture Flow</div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] leading-relaxed">
                    ```mermaid
                    <br />
                    flowchart LR
                    <br />
                    &nbsp;&nbsp;Editor[Editor Input] --&gt; Parser[12+ Diagram Engines]
                    <br />
                    &nbsp;&nbsp;Parser --&gt; DB[(IndexedDB)]
                    <br />
                    &nbsp;&nbsp;DB --&gt; Vault[AES-256 Vault]
                    <br />
                    ```
                  </div>
                </>
              )}

              {activeTab === 'ai' && (
                <>
                  <div className="text-blue-600 dark:text-blue-400 font-bold"># Release Notes (draft)</div>
                  <div className="text-slate-400">fixd the bug where users cant export</div>
                  <div className="text-slate-400">their doc as word file its really annoying</div>
                  <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-semibold text-[11px] border border-dashed border-purple-300 dark:border-purple-800">
                    &gt; Selection sent to your own Anthropic / OpenAI key — “Fix grammar”
                  </div>
                </>
              )}
            </div>

            {/* Right: Rendered Output */}
            <div className="space-y-3.5 pl-0 md:pl-4 pt-4 md:pt-0 font-sans">
              {activeTab === 'math' && (
                <>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                    Quantum State Evolution
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    The Lindblad master equation for open quantum systems:
                  </p>
                  <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-center font-serif text-sm text-blue-700 dark:text-blue-300 font-semibold shadow-xs">
                    {'dρ/dt = -(i/ℏ)[H, ρ] + 𝒟[ρ]'}
                  </div>
                </>
              )}

              {activeTab === 'diagram' && (
                <>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                    Architecture Flow
                  </h2>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-[11px]">
                    <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold shadow-xs">Editor Input</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold shadow-xs">IndexedDB</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="px-2.5 py-1 rounded bg-purple-600 text-white font-semibold shadow-xs">AES-256 Vault</span>
                  </div>
                </>
              )}

              {activeTab === 'ai' && (
                <>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                    Release Notes (draft)
                  </h2>
                  <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                    Fixed the bug where users couldn&apos;t export their document as a Word file — it was
                    really annoying.
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Rewritten with your own API key — nothing sent to Dnyx servers</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                  Ctrl+K
                </kbd>{' '}
                Command Palette
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                  Alt+H
                </kbd>{' '}
                Version Diff
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                  Ctrl+F
                </kbd>{' '}
                Find &amp; Replace
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Local Engine Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
