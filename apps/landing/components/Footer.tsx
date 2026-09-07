'use client';

import { ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { APP_URL, README_BUILDER_URL, REPO_URL, SPONSOR_URL } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a11] pt-16 pb-12 select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800">
          {/* Company & Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                Dnyx <span className="text-blue-500">Draft</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              The local-first Markdown workspace with BYOK AI writing, live collaboration, and a
              multi-format file viewer — built for software engineers, technical writers, and
              researchers. Zero cloud lock-in, 100% privacy.
            </p>

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Dnyx Tech
              </div>
              <div>A Division of Dnyx Business Solutions Private Limited</div>
              <div className="text-[11px] text-slate-400">Part of Dnyx Group</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Product
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-500 transition-colors flex items-center gap-1"
                >
                  <span>Launch Web App</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={README_BUILDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-500 transition-colors flex items-center gap-1"
                >
                  <span>README Builder</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#ai" className="hover:text-blue-500 transition-colors">
                  AI Assistant
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-blue-500 transition-colors">
                  Interactive Demo
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-blue-500 transition-colors">
                  Comparison Matrix
                </a>
              </li>
            </ul>
          </div>

          {/* Technology & Security */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Architecture &amp; Privacy
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>100% Client-Side Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Dexie.js IndexedDB Storage</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>WebCrypto AES-256-GCM Vault</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>BYOK AI — Direct to Provider</span>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Legal &amp; Policies
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-blue-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-blue-500 transition-colors">
                  Security Model
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Dnyx Tech. A Division of Dnyx Business Solutions Private Limited (Dnyx Group). All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>&bull;</span>
            <Link href="/security" className="hover:underline">Security</Link>
            <span>&bull;</span>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
              <GithubIcon className="h-3.5 w-3.5" /> Source
            </a>
            <span>&bull;</span>
            <a href={SPONSOR_URL} target="_blank" rel="noreferrer" className="hover:underline">
              Sponsor
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
