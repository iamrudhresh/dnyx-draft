'use client';

import { type Change, diffLines } from 'diff';
import { Clock, Diff, Eye, History, RotateCcw, Save, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { db } from '@/lib/db';
import type { RevisionItem } from '@/lib/db/schema';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ open, onOpenChange }) => {
  const { documents, activeDocumentId, updateDocument } = useWorkspaceStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);

  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewDiff, setViewDiff] = useState(true);

  // Load revisions for active document
  useEffect(() => {
    const localDb = db;
    if (!open || !activeDoc || !localDb) return;

    const loadRevisions = async () => {
      setLoading(true);
      try {
        const list = await localDb.revisions
          .where('documentId')
          .equals(activeDoc.id)
          .reverse()
          .sortBy('timestamp');
        setRevisions(list);
        if (list.length > 0) {
          setSelectedRevisionId(list[0].id);
        } else {
          setSelectedRevisionId(null);
        }
      } catch (err) {
        console.error('Failed to load revisions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRevisions();
  }, [open, activeDoc]);

  const handleCreateSnapshot = async () => {
    if (!activeDoc || !db) return;

    const newRev: RevisionItem = {
      id: nanoid(),
      documentId: activeDoc.id,
      title: activeDoc.title,
      content: activeDoc.content,
      summary: customNote.trim() || `Manual Snapshot (${new Date().toLocaleTimeString()})`,
      timestamp: Date.now(),
    };

    try {
      await db.revisions.add(newRev);
      setRevisions((prev) => [newRev, ...prev]);
      setSelectedRevisionId(newRev.id);
      setCustomNote('');
      toast.success('Saved new version snapshot');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save snapshot');
    }
  };

  const handleRestore = async (rev: RevisionItem) => {
    if (!activeDoc) return;
    const confirmRestore = confirm(
      `Are you sure you want to restore "${rev.summary || 'selected version'}"? Current unsaved edits will be replaced.`,
    );
    if (!confirmRestore) return;

    await updateDocument(activeDoc.id, { content: rev.content });
    toast.success(`Restored version from ${new Date(rev.timestamp).toLocaleTimeString()}`);
    onOpenChange(false);
  };

  const handleDeleteRevision = async (revId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db) return;
    await db.revisions.delete(revId);
    setRevisions((prev) => prev.filter((r) => r.id !== revId));
    if (selectedRevisionId === revId) {
      const remaining = revisions.filter((r) => r.id !== revId);
      setSelectedRevisionId(remaining[0]?.id || null);
    }
    toast.success('Snapshot removed');
  };

  const selectedRev = revisions.find((r) => r.id === selectedRevisionId);

  // Compute diffs between selected revision and current document
  const diffs: Change[] =
    selectedRev && activeDoc ? diffLines(selectedRev.content, activeDoc.content) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <History className="h-5 w-5 text-indigo-500" /> Version History & Snapshots
          </DialogTitle>
          <DialogDescription>
            Inspect past revisions, track modifications with visual diffs, and restore previous
            document states for &quot;{activeDoc?.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        {/* Snapshot creator */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 rounded-lg">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Snapshot description (e.g., 'Before refactoring section 2')..."
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
          />
          <Button
            size="sm"
            onClick={handleCreateSnapshot}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
          >
            <Save className="h-3.5 w-3.5 mr-1" /> Create Snapshot
          </Button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-[350px] max-h-[450px] overflow-hidden pt-1">
          {/* Left: Revisions Timeline */}
          <div className="md:col-span-4 border border-slate-200 dark:border-slate-800 rounded-lg overflow-y-auto p-1.5 space-y-1 bg-slate-50/50 dark:bg-slate-950">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
              <span>Saved Revisions ({revisions.length})</span>
            </div>

            {revisions.map((rev) => {
              const isSelected = selectedRevisionId === rev.id;
              const date = new Date(rev.timestamp);

              return (
                <div
                  key={rev.id}
                  onClick={() => setSelectedRevisionId(rev.id)}
                  className={`group p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-semibold truncate">
                      <Clock className="h-3 w-3 text-indigo-500 shrink-0" />
                      <span className="truncate">{rev.summary}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteRevision(rev.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400 rounded transition-opacity"
                    title="Delete snapshot"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {revisions.length === 0 && !loading && (
              <div className="text-center py-8 text-xs text-slate-400 px-4">
                No snapshots saved yet. Click &quot;Create Snapshot&quot; above to capture current
                state.
              </div>
            )}
          </div>

          {/* Right: Diff & Preview Pane */}
          <div className="md:col-span-8 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col bg-white dark:bg-[#090d16] overflow-hidden">
            {selectedRev ? (
              <>
                {/* Header bar */}
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={viewDiff ? 'default' : 'outline'}
                      onClick={() => setViewDiff(true)}
                      className="h-7 text-xs"
                    >
                      <Diff className="h-3 w-3 mr-1" /> Side-by-Side Diff
                    </Button>
                    <Button
                      size="sm"
                      variant={!viewDiff ? 'default' : 'outline'}
                      onClick={() => setViewDiff(false)}
                      className="h-7 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" /> Raw Content
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleRestore(selectedRev)}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Restore This Version
                  </Button>
                </div>

                {/* Diff Viewer Body */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
                  {viewDiff ? (
                    <div className="space-y-0.5">
                      {diffs.map((part, index) => {
                        const isAdded = part.added;
                        const isRemoved = part.removed;

                        return (
                          <div
                            key={index}
                            className={`p-1 rounded whitespace-pre-wrap ${
                              isAdded
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500 pl-2'
                                : isRemoved
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-l-2 border-rose-500 pl-2 line-through opacity-80'
                                  : 'text-slate-700 dark:text-slate-300 pl-2 opacity-90'
                            }`}
                          >
                            <span className="select-none font-bold mr-1.5 opacity-50">
                              {isAdded ? '+' : isRemoved ? '-' : ' '}
                            </span>
                            {part.value}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <pre className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {selectedRev.content}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 p-6 text-center">
                Select a revision on the left to inspect differences or restore it.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
