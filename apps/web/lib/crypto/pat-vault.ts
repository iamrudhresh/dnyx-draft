'use client';

import { db } from '../db';
import type { TokenItem } from '../db/schema';

const VAULT_KEY = 'md-pat-vault-key';

async function getOrCreateVaultKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(VAULT_KEY);
  if (stored) {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const exported = await crypto.subtle.exportKey('raw', key);
  const binary = String.fromCharCode(...new Uint8Array(exported));
  localStorage.setItem(VAULT_KEY, btoa(binary));
  return key;
}

async function encrypt(text: string): Promise<string> {
  const key = await getOrCreateVaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  let binary = '';
  for (let i = 0; i < combined.byteLength; i++) binary += String.fromCharCode(combined[i]);
  return btoa(binary);
}

async function decrypt(cipherText: string): Promise<string> {
  const key = await getOrCreateVaultKey();
  const combined = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export async function listTokens(): Promise<
  Array<{ id: string; name: string; createdAt: number }>
> {
  if (!db) return [];
  const tokens = await db.tokens.orderBy('createdAt').toArray();
  return tokens.map(({ id, name, createdAt }) => ({ id, name, createdAt }));
}

export async function addToken(name: string, token: string): Promise<void> {
  if (!db) return;
  const encryptedToken = await encrypt(token);
  const item: TokenItem = {
    id: crypto.randomUUID(),
    name,
    encryptedToken,
    createdAt: Date.now(),
  };
  await db.tokens.add(item);
}

export async function getToken(id: string): Promise<string | null> {
  if (!db) return null;
  const item = await db.tokens.get(id);
  if (!item) return null;
  return decrypt(item.encryptedToken);
}

export async function deleteToken(id: string): Promise<void> {
  if (!db) return;
  await db.tokens.delete(id);
}
