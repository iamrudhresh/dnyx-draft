'use client';

import { Lock, ShieldCheck, Unlock } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { decryptData, encryptData } from '@/lib/crypto/aes';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface EncryptVaultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EncryptVaultModal: React.FC<EncryptVaultModalProps> = ({ open, onOpenChange }) => {
  const { documents, activeDocumentId, updateDocument } = useWorkspaceStore();
  const activeDoc = documents.find((d) => d.id === activeDocumentId);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isLocked = activeDoc?.isSecret;

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc) return;

    // Fix #6: raised minimum to 8 characters for meaningful security.
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const encrypted = await encryptData(activeDoc.content, password);
      await updateDocument(activeDoc.id, {
        content: `🔒 ENCRYPTED VAULT FILE (AES-256-GCM)\n---\n${encrypted}`,
        isSecret: true,
      });

      setPassword('');
      setConfirmPassword('');
      toast.success(`"${activeDoc.title}" is now locked with AES-256 encryption!`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Encryption failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc) return;

    if (!password) {
      toast.error('Please enter the unlock password.');
      return;
    }

    setLoading(true);
    try {
      const encryptedPayload = activeDoc.content
        .replace(/^🔒 ENCRYPTED VAULT FILE \(AES-256-GCM\)\n---\n/, '')
        .trim();

      const decrypted = await decryptData(encryptedPayload, password);
      await updateDocument(activeDoc.id, {
        content: decrypted,
        isSecret: false,
      });

      setPassword('');
      toast.success(`Unlocked "${activeDoc.title}"!`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Incorrect password or corrupted ciphertext.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            {isLocked ? (
              <Unlock className="h-5 w-5 text-amber-500" />
            ) : (
              <Lock className="h-5 w-5 text-blue-500" />
            )}
            {isLocked ? 'Unlock Encrypted Document' : 'Client-Side Password Lock'}
          </DialogTitle>
          <DialogDescription>
            {isLocked
              ? `Enter the password used to lock "${activeDoc?.title}". Data is decrypted locally in-memory using WebCrypto.`
              : `Encrypt "${activeDoc?.title}" using zero-knowledge AES-256-GCM encryption. Without the password, content cannot be recovered.`}
          </DialogDescription>
        </DialogHeader>

        {isLocked ? (
          <form onSubmit={handleDecrypt} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unlock Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !password}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Unlock className="h-4 w-4 mr-1.5" /> Unlock Document
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEncrypt} className="space-y-4 pt-2">
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-lg flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              <span>
                Your data never leaves your browser. Encryption is performed via PBKDF2 (100,000
                rounds) + AES-256-GCM.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Set Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Lock className="h-4 w-4 mr-1.5" /> Encrypt & Lock
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
