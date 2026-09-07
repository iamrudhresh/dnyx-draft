'use client';

import { BarChart3, Layers, Menu, Moon, Sparkles, Sun, Users, Wand2, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { Button } from './ui/button';
import { APP_URL, REPO_URL } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/#features', label: 'Features', icon: Layers, color: 'text-blue-500' },
  { href: '/#ai', label: 'AI Assistant', icon: Wand2, color: 'text-purple-500' },
  { href: '/#use-cases', label: 'Who It’s For', icon: Users, color: 'text-indigo-500' },
  { href: '/#comparison', label: 'Comparison', icon: BarChart3, color: 'text-amber-500' },
];

export const Navbar: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) === 'dark' : true;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg tracking-tight">
            Dnyx <span className="text-blue-600 dark:text-blue-400">Draft</span>
          </span>
        </Link>

        {/* Center Nav Links with Icons */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {NAV_LINKS.map(({ href, label, icon: Icon, color }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>

          <a href={APP_URL} target="_blank" rel="noreferrer" className="hidden sm:block">
            <Button size="sm" variant="default" className="font-semibold text-xs h-9 px-4">
              Open App <span className="ml-1">&rarr;</span>
            </Button>
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon, color }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <Icon className={`h-4 w-4 ${color}`} />
              <span>{label}</span>
            </a>
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <GithubIcon className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <a href={APP_URL} target="_blank" rel="noreferrer" className="block pt-2">
            <Button size="sm" variant="default" className="w-full font-semibold text-xs h-10">
              Open App <span className="ml-1">&rarr;</span>
            </Button>
          </a>
        </div>
      )}
    </header>
  );
};
