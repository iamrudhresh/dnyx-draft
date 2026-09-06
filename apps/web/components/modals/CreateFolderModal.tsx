'use client';

import { FolderPlus } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  open,
  onOpenChange,
  parentId = null,
}) => {
  const [folderName, setFolderName] = useState('');
  const { createFolder } = useWorkspaceStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state and focus input each time the dialog opens.
  // We can't rely on HTML autoFocus inside a Radix Dialog because the
  // FocusScope takes over — onOpenAutoFocus lets us manage focus ourselves.
  useEffect(() => {
    if (open) setFolderName('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    await createFolder(folderName.trim(), parentId);
    setFolderName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FolderPlus className="h-5 w-5 text-blue-500" /> New Folder
          </DialogTitle>
          <DialogDescription>
            Enter a name for the new folder to organize your Markdown documents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Folder Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Project Notes, Architecture, Guides"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFolderName('');
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Create Folder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
