'use client';

import { Check, Copy, Link as LinkIcon, Loader2, Share2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange }) => {
  const { documents, activeDocumentId } = useWorkspaceStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateShare = async () => {
    if (!activeDoc) return;
    setLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeDoc.title,
          content: activeDoc.content,
          expiresInDays: 30,
        }),
      });

      if (!res.ok) throw new Error('Failed to create snapshot');
      const data = await res.json();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setShareUrl(`${origin}/s/${data.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Share2 className="h-5 w-5 text-blue-500" /> Share Snapshot
          </DialogTitle>
          <DialogDescription>
            Generate a fast, read-only link to share &quot;{activeDoc?.title}&quot; with anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!shareUrl ? (
            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center">
              <LinkIcon className="h-8 w-8 text-blue-500 mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ready to create an instant public link?
              </p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Recipients can view the formatted Markdown with full KaTeX math and diagram support.
              </p>
              <Button onClick={handleCreateShare} disabled={loading} className="mt-4">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Generate Share Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Public Snapshot URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 select-all"
                />
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
