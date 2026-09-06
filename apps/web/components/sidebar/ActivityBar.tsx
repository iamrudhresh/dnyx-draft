'use client';

import {
  Activity,
  BookOpen,
  Files,
  History,
  LayoutTemplate,
  ListTree,
  MessageSquare,
  Moon,
  Network,
  Newspaper,
  Search,
  Settings,
  Sun,
  Timer,
  Trash2,
  Tv,
  Wifi,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { type ActivityTab, useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { cn } from '@/lib/utils';

interface ActivityBarProps {
  onOpenSettings: () => void;
  onOpenPresentation: () => void;
  onOpenComments?: () => void;
  onOpenTrash?: () => void;
  onOpenReleaseNotes?: () => void;
  onOpenLiveShare?: () => void;
}

interface ActivityItem {
  id: ActivityTab;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'explorer',
    label: 'Explorer & Files',
    icon: <Files className="h-5 w-5" />,
    shortcut: 'Ctrl+Shift+E',
  },
  {
    id: 'search',
    label: 'Global Search & Replace',
    icon: <Search className="h-5 w-5" />,
    shortcut: 'Ctrl+Shift+F',
  },
  {
    id: 'outline',
    label: 'Outline & Headings',
    icon: <ListTree className="h-5 w-5" />,
    shortcut: 'Alt+O',
  },
  {
    id: 'templates',
    label: 'Templates & Snippets',
    icon: <LayoutTemplate className="h-5 w-5" />,
    shortcut: 'Ctrl+Shift+T',
  },
  {
    id: 'graph',
    label: 'Interactive Knowledge Graph',
    icon: <Network className="h-5 w-5" />,
    shortcut: 'Alt+G',
  },
  {
    id: 'history',
    label: 'Version History & Diffs',
    icon: <History className="h-5 w-5" />,
    shortcut: 'Alt+H',
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics & Readability',
    icon: <Activity className="h-5 w-5" />,
    shortcut: 'Alt+D',
  },
];

export const ActivityBar: React.FC<ActivityBarProps> = ({
  onOpenSettings,
  onOpenPresentation,
  onOpenComments,
  onOpenTrash,
  onOpenReleaseNotes,
  onOpenLiveShare,
}) => {
  const router = useRouter();
  const {
    activeActivityTab,
    setActiveActivityTab,
    isSidebarOpen,
    toggleSidebar,
    pomodoroActive,
    togglePomodoro,
  } = useWorkspaceStore();
  const { enablePomodoroTimer } = useSettingsStore();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) === 'dark' : true;

  const handleTabClick = (tab: ActivityTab) => {
    if (activeActivityTab === tab && isSidebarOpen) {
      toggleSidebar();
    } else {
      setActiveActivityTab(tab);
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <aside className="w-12 shrink-0 bg-slate-100/90 dark:bg-[#090d16] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between items-center py-2 select-none z-30 transition-colors">
      {/* Top Action Tabs */}
      <div className="flex flex-col items-center gap-1 w-full">
        {ACTIVITY_ITEMS.map((item) => {
          const isActive = isSidebarOpen && activeActivityTab === item.id;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={cn(
                    'relative w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer group',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
                  )}
                  aria-label={item.label}
                >
                  {/* Left Active Indicator Strip */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.75 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                  )}
                  {item.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                    {item.shortcut}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Bottom Utility Actions */}
      <div className="flex flex-col items-center gap-1 w-full pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
        {/* README Builder */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => router.push('/readme-builder')}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              aria-label="README Builder"
            >
              <BookOpen className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>README Builder</span>
          </TooltipContent>
        </Tooltip>

        {/* Presentation Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onOpenPresentation}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              aria-label="Present as Slides (Alt+P)"
            >
              <Tv className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>Present as Slides</span>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
              Alt+P
            </span>
          </TooltipContent>
        </Tooltip>

        {/* Live Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={
                onOpenLiveShare ?? (() => window.dispatchEvent(new Event('md:open-live-share')))
              }
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              aria-label="Live Share"
            >
              <Wifi className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Live Share</span>
          </TooltipContent>
        </Tooltip>

        {/* Comments */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={
                onOpenComments ?? (() => window.dispatchEvent(new Event('md:open-comments')))
              }
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              aria-label="Comments"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Comments</span>
          </TooltipContent>
        </Tooltip>

        {/* Trash */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onOpenTrash ?? (() => window.dispatchEvent(new Event('md:open-trash')))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              aria-label="Trash"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Trash</span>
          </TooltipContent>
        </Tooltip>

        {/* Pomodoro Quick Toggle (Only shown when enabled in Settings) */}
        {enablePomodoroTimer && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={togglePomodoro}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
                  pomodoroActive
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50 animate-pulse'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30',
                )}
                aria-label="Pomodoro Focus Timer"
              >
                <Timer className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Pomodoro Focus Timer ({pomodoroActive ? 'Running' : 'Paused'})</span>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Toggle {isDark ? 'Light' : 'Dark'} Mode</span>
          </TooltipContent>
        </Tooltip>

        {/* Release Notes */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={
                onOpenReleaseNotes ??
                (() => window.dispatchEvent(new Event('md:open-release-notes')))
              }
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
              aria-label="What's New"
            >
              <Newspaper className="h-4.5 w-4.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>What&apos;s New</span>
          </TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="Settings (Ctrl+,)"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>Settings</span>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
              Ctrl+,
            </span>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};
