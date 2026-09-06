'use client';

import { CheckCircle2, Columns, Edit3, Eye, Loader2, RotateCcw, Target, Timer } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { calculateReadingTime, cn } from '@/lib/utils';

export const StatusBar: React.FC = () => {
  const {
    documents,
    activeDocumentId,
    viewMode,
    setViewMode,
    saveStatus,
    pomodoroActive,
    pomodoroSecondsLeft,
    pomodoroMode,
    togglePomodoro,
    resetPomodoro,
    tickPomodoro,
  } = useWorkspaceStore();
  const { writingGoalWords, enablePomodoroTimer } = useSettingsStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);
  const content = activeDoc?.content || '';

  // Pomodoro interval loop
  useEffect(() => {
    if (!pomodoroActive) return;
    const timer = setInterval(() => {
      tickPomodoro();
    }, 1000);
    return () => clearInterval(timer);
  }, [pomodoroActive, tickPomodoro]);

  const pMinutes = Math.floor(pomodoroSecondsLeft / 60);
  const pSeconds = pomodoroSecondsLeft % 60;
  const pTimeString = `${String(pMinutes).padStart(2, '0')}:${String(pSeconds).padStart(2, '0')}`;

  const { words, chars, minutes } = calculateReadingTime(content);

  const goalProgress =
    writingGoalWords > 0 ? Math.min(100, Math.round((words / writingGoalWords) * 100)) : 0;
  const goalReached = writingGoalWords > 0 && words >= writingGoalWords;

  return (
    <footer className="h-7 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/95 dark:bg-[#0d1117]/95 px-3 sm:px-4 text-[11px] text-slate-500 dark:text-slate-400 select-none z-10 transition-colors shrink-0">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Save status */}
        <div className="flex items-center gap-1.5 shrink-0">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              <span className="text-blue-500 font-medium hidden sm:inline">Saving…</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium hidden sm:inline">Saved</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-medium">
                Local · IndexedDB
              </span>
            </>
          )}
        </div>

        <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Document stats */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-300">
              {words.toLocaleString()}
            </strong>{' '}
            words
          </span>
          <span className="hidden md:inline">
            <strong className="font-semibold text-slate-700 dark:text-slate-300">
              {chars.toLocaleString()}
            </strong>{' '}
            chars
          </span>
          <span className="hidden sm:inline">
            ~<strong className="font-semibold text-slate-700 dark:text-slate-300">{minutes}</strong>{' '}
            min read
          </span>
        </div>

        {/* Pomodoro Focus Timer (User configurable in Settings) */}
        {enablePomodoroTimer && (
          <>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex items-center gap-1.5 font-mono">
              <button
                type="button"
                onClick={togglePomodoro}
                className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer',
                  pomodoroActive
                    ? pomodoroMode === 'work'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800',
                )}
                title={pomodoroActive ? 'Pause Pomodoro' : 'Start 25-min Pomodoro Sprint'}
              >
                <Timer className="h-3 w-3" />
                <span>{pTimeString}</span>
                <span className="text-[9px] uppercase opacity-70">({pomodoroMode})</span>
              </button>
              {pomodoroActive && (
                <button
                  type="button"
                  onClick={resetPomodoro}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                  title="Reset Pomodoro"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Writing goal progress */}
        {writingGoalWords > 0 && (
          <>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="hidden sm:flex items-center gap-1.5">
              <Target
                className={cn(
                  'h-3 w-3 shrink-0',
                  goalReached ? 'text-emerald-500' : 'text-blue-500',
                )}
              />
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      goalReached
                        ? 'bg-emerald-500'
                        : goalProgress >= 75
                          ? 'bg-amber-500'
                          : 'bg-blue-500',
                    )}
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'font-medium',
                    goalReached
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400',
                  )}
                >
                  {words.toLocaleString()}/{writingGoalWords.toLocaleString()}
                  {goalReached ? ' ✓' : ''}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: view mode switcher */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant={viewMode === 'editor' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-5 px-2 text-[11px]"
          onClick={() => setViewMode('editor')}
        >
          <Edit3 className="h-3 w-3 mr-1" /> Editor
        </Button>
        <Button
          variant={viewMode === 'split' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-5 px-2 text-[11px]"
          onClick={() => setViewMode('split')}
        >
          <Columns className="h-3 w-3 mr-1" /> Split
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-5 px-2 text-[11px]"
          onClick={() => setViewMode('preview')}
        >
          <Eye className="h-3 w-3 mr-1" /> Preview
        </Button>
      </div>
    </footer>
  );
};
