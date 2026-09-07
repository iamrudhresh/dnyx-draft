'use client';

import { decryptData, encryptData } from '../crypto/aes';
import { db } from '../db';

export type AiProvider = 'anthropic' | 'openai';

let sessionPassphrase: string | null = null;
let sessionCachedKeys: Partial<Record<AiProvider, string>> = {};

export function setSessionPassphrase(passphrase: string) {
  sessionPassphrase = passphrase;
  sessionCachedKeys = {};
}

export function clearSession() {
  sessionPassphrase = null;
  sessionCachedKeys = {};
}

export function hasSessionPassphrase(): boolean {
  return sessionPassphrase !== null;
}

export async function saveApiKey(provider: AiProvider, apiKey: string, passphrase: string) {
  if (!db) throw new Error('Database not available');
  const encrypted = await encryptData(apiKey, passphrase);
  const id = `ai-key-${provider}`;
  await db.tokens.put({
    id,
    name: `ai-${provider}`,
    encryptedToken: encrypted,
    createdAt: Date.now(),
  });
  sessionPassphrase = passphrase;
  sessionCachedKeys[provider] = apiKey;
}

export async function loadApiKey(provider: AiProvider): Promise<string | null> {
  if (sessionCachedKeys[provider]) return sessionCachedKeys[provider] ?? null;
  if (!sessionPassphrase) return null;
  if (!db) return null;

  const record = await db.tokens.get(`ai-key-${provider}`);
  if (!record) return null;

  try {
    const key = await decryptData(record.encryptedToken, sessionPassphrase);
    sessionCachedKeys[provider] = key;
    return key;
  } catch {
    return null;
  }
}

export async function hasStoredKey(provider: AiProvider): Promise<boolean> {
  if (!db) return false;
  const record = await db.tokens.get(`ai-key-${provider}`);
  return !!record;
}

export async function deleteApiKey(provider: AiProvider) {
  if (!db) return;
  await db.tokens.delete(`ai-key-${provider}`);
  delete sessionCachedKeys[provider];
}

export async function testApiKey(provider: AiProvider, apiKey: string): Promise<boolean> {
  try {
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      });
      return res.ok;
    }
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    }
    return false;
  } catch {
    return false;
  }
}
