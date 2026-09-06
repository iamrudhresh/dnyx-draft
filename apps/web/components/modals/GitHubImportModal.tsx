'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Key, Loader2, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { addToken, deleteToken, getToken, listTokens } from '@/lib/crypto/pat-vault';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { type GitHubImportInput, githubImportSchema } from '@/lib/validations';
import { GithubIcon } from '../icons/GithubIcon';

interface GitHubImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVault, setShowVault] = useState(false);
  const [tokens, setTokens] = useState<Array<{ id: string; name: string; createdAt: number }>>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [addingToken, setAddingToken] = useState(false);

  const { createDocument, updateDocument } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GitHubImportInput>({
    resolver: zodResolver(githubImportSchema),
  });

  const loadTokens = async () => {
    const list = await listTokens();
    setTokens(list);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadTokens is stable for this dep
  useEffect(() => {
    if (open) loadTokens();
  }, [open]);

  const handleAddToken = async () => {
    if (!newTokenName.trim() || !newTokenValue.trim()) return;
    if (tokens.length >= 50) {
      toast.error('Maximum 50 tokens allowed');
      return;
    }
    setAddingToken(true);
    try {
      await addToken(newTokenName.trim(), newTokenValue.trim());
      setNewTokenName('');
      setNewTokenValue('');
      toast.success(`Token "${newTokenName}" saved`);
      await loadTokens();
    } finally {
      setAddingToken(false);
    }
  };

  const handleDeleteToken = async (id: string, name: string) => {
    if (!confirm(`Delete token "${name}"?`)) return;
    await deleteToken(id);
    if (selectedTokenId === id) setSelectedTokenId('');
    toast.success(`Token "${name}" deleted`);
    await loadTokens();
  };

  const onSubmit = async (data: GitHubImportInput) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      let rawUrl = data.url;
      if (rawUrl.includes('github.com') && !rawUrl.includes('raw.githubusercontent.com')) {
        rawUrl = rawUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }

      // Get PAT token for auth if selected
      const headers: Record<string, string> = {};
      if (selectedTokenId) {
        const pat = await getToken(selectedTokenId);
        if (pat) headers.Authorization = `token ${pat}`;
      }

      const res = await fetch(rawUrl, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const MAX_BYTES = 5 * 1024 * 1024;
      const contentLength = res.headers.get('content-length');
      if (contentLength && Number(contentLength) > MAX_BYTES) {
        throw new Error('File is too large to import (max 5 MB).');
      }

      const markdown = await res.text();
      if (markdown.length > MAX_BYTES) {
        throw new Error('File is too large to import (max 5 MB).');
      }

      const urlParts = rawUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'Imported.md';

      const docId = await createDocument(fileName.endsWith('.md') ? fileName : `${fileName}.md`);
      await updateDocument(docId, { content: markdown });

      reset();
      onOpenChange(false);
      toast.success(`Imported "${fileName}" successfully`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch markdown from GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GithubIcon className="h-5 w-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Paste a GitHub file URL to import its Markdown content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <input
              {...register('url')}
              type="url"
              placeholder="https://github.com/user/repo/blob/main/README.md"
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            />
            {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
          </div>

          {/* PAT selection */}
          {tokens.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Auth Token (optional)</label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="">No authentication</option>
                {tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-md">
              {errorMessage}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Import
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVault((v) => !v)}
              title="Manage PAT tokens"
            >
              <Key className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* PAT Vault */}
        {showVault && (
          <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-amber-500" />
              GitHub PAT Vault ({tokens.length}/50)
            </h4>

            {/* Add new token */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Token name (e.g. My Work PAT)"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] outline-none focus:border-blue-500"
              />
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="ghp_xxxx..."
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    className="w-full pl-2.5 pr-8 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddToken}
                  disabled={addingToken || !newTokenName.trim() || !newTokenValue.trim()}
                  className="h-7 px-2"
                >
                  {addingToken ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Token list */}
            {tokens.length > 0 && (
              <div className="space-y-1">
                {tokens.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
                  >
                    <span className="text-xs text-slate-700 dark:text-slate-200">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteToken(t.id, t.name)}
                      className="text-red-400 hover:text-red-600 p-0.5 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
