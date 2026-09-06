'use client';

import {
  BarChart3,
  Code2,
  Cpu,
  FileText,
  HelpCircle,
  Layers,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { Button } from './ui/button';

export const Navbar: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) === 'dark' : true;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg tracking-tight">
            Markdown <span className="text-blue-600 dark:text-blue-400">Viewer</span>
          </span>
        </Link>

        {/* Center Nav Links with Icons */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a
            href="/#features"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            <span>Features</span>
          </a>
          <a
            href="/#use-cases"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <Users className="h-3.5 w-3.5 text-indigo-500" />
            <span>Who It&apos;s For</span>
          </a>
          <a
            href="/#demo"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <Code2 className="h-3.5 w-3.5 text-purple-500" />
            <span>Interactive Demo</span>
          </a>
          <a
            href="/#architecture"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-500" />
            <span>Architecture</span>
          </a>
          <a
            href="/#comparison"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <BarChart3 className="h-3.5 w-3.5 text-amber-500" />
            <span>Comparison</span>
          </a>
          <a
            href="/#faq"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <HelpCircle className="h-3.5 w-3.5 text-rose-500" />
            <span>FAQ</span>
          </a>
        </nav>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>

          <a href="http://localhost:3000" target="_blank" rel="noreferrer">
            <Button size="sm" variant="default" className="font-semibold text-xs h-9 px-4">
              Open App <span className="ml-1">&rarr;</span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};
