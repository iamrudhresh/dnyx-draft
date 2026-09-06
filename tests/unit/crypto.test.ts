import { describe, expect, it } from 'vitest';
import { decryptData, encryptData } from '@/lib/crypto/aes';

// jsdom provides window.crypto.subtle via the Web Crypto API polyfill.
// These tests verify the AES-256-GCM round-trip and edge-case behaviour.

describe('AES-256-GCM encrypt / decrypt', () => {
  it('decrypts ciphertext back to the original plaintext', async () => {
    const plaintext = 'Hello, Encrypted World!';
    const password = 'super-secret-password-123';

    const cipher = await encryptData(plaintext, password);
    const recovered = await decryptData(cipher, password);

    expect(recovered).toBe(plaintext);
  });

  it('produces a different ciphertext on each call (unique salt + IV)', async () => {
    const plaintext = 'Same content';
    const password = 'same-password';

    const c1 = await encryptData(plaintext, password);
    const c2 = await encryptData(plaintext, password);

    // Ciphertexts must differ because salt & IV are random
    expect(c1).not.toBe(c2);
    // But both must decrypt to the same value
    expect(await decryptData(c1, password)).toBe(plaintext);
    expect(await decryptData(c2, password)).toBe(plaintext);
  });

  it('throws when decrypting with the wrong password', async () => {
    const cipher = await encryptData('Secret', 'correct-password');
    await expect(decryptData(cipher, 'wrong-password')).rejects.toThrow();
  });

  it('round-trips an empty string', async () => {
    const cipher = await encryptData('', 'password');
    const recovered = await decryptData(cipher, 'password');
    expect(recovered).toBe('');
  });

  it('round-trips a large document (> 8 KB to exercise chunked base64)', async () => {
    // Generate ~10 KB of text to hit the chunk boundary in uint8ToBase64
    const large = 'A'.repeat(10_000) + '\nEnd';
    const password = 'chunked-test';

    const cipher = await encryptData(large, password);
    const recovered = await decryptData(cipher, password);

    expect(recovered).toBe(large);
  });

  it('round-trips a document with special characters and emoji', async () => {
    const text = '# 日本語 🎉\n\n> Markdown with 特殊文字 & <tags>';
    const cipher = await encryptData(text, 'emoji-pass');
    expect(await decryptData(cipher, 'emoji-pass')).toBe(text);
  });

  it('produces a base64-safe ciphertext string (no raw bytes)', async () => {
    const cipher = await encryptData('test', 'pass');
    expect(() => atob(cipher)).not.toThrow();
  });

  it('ciphertext is at least 40 chars (salt 16 + IV 12 + tag overhead)', async () => {
    // 16 (salt) + 12 (IV) + 16 (GCM tag) = 44 bytes min → base64 ≥ 60 chars
    const cipher = await encryptData('x', 'p');
    expect(cipher.length).toBeGreaterThanOrEqual(60);
  });
});
