import { describe, expect, it } from 'vitest';
import { calculateReadingTime, formatBytes } from '@/lib/utils';
import { documentSchema, shareSnapshotSchema } from '@/lib/validations';

// ---------------------------------------------------------------------------
// formatBytes
// ---------------------------------------------------------------------------
describe('formatBytes', () => {
  it('returns "0 Bytes" for zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats 1024 bytes as "1 KB"', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats 1 MB correctly', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('formats 1 GB correctly', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  it('respects the decimals parameter', () => {
    expect(formatBytes(1536, 1)).toBe('1.5 KB');
  });

  it('handles 0 decimals', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB');
  });
});

// ---------------------------------------------------------------------------
// calculateReadingTime
// ---------------------------------------------------------------------------
describe('calculateReadingTime', () => {
  it('counts plain words correctly', () => {
    const text = 'Hello world, this is a test document with several words in it.';
    const result = calculateReadingTime(text);
    expect(result.words).toBe(12);
    expect(result.minutes).toBe(1);
  });

  it('strips markdown heading markers before counting', () => {
    const text = '# Heading One\n## Heading Two\nBody text here.';
    const result = calculateReadingTime(text);
    // # markers are stripped; remaining words: "Heading", "One", "Heading", "Two", "Body", "text", "here" = 7
    expect(result.words).toBe(7);
  });

  it('strips fenced code blocks from word count', () => {
    const text = '```ts\nconst x = 1;\n```\nOnly this line counts.';
    const result = calculateReadingTime(text);
    // Should only count "Only this line counts" = 4 words
    expect(result.words).toBe(4);
  });

  it('strips inline code from word count', () => {
    const text = 'Use `npm install` to install dependencies.';
    const result = calculateReadingTime(text);
    // "Use", "to", "install", "dependencies" = 4 words ("npm install" stripped)
    expect(result.words).toBe(4);
  });

  it('strips image syntax', () => {
    const text = '![Alt text](https://example.com/img.png) Caption here.';
    const result = calculateReadingTime(text);
    // "Caption", "here" = 2 words
    expect(result.words).toBe(2);
  });

  it('keeps link text but removes the URL', () => {
    const text = '[Click here](https://example.com) to continue.';
    const result = calculateReadingTime(text);
    // "Click", "here", "to", "continue" = 4 words
    expect(result.words).toBe(4);
  });

  it('returns minimum 1 minute even for very short text', () => {
    const result = calculateReadingTime('Hi');
    expect(result.minutes).toBe(1);
  });

  it('returns 0 words for empty string', () => {
    const result = calculateReadingTime('');
    expect(result.words).toBe(0);
  });

  it('includes the character count of the raw text', () => {
    const text = 'Hello world';
    const result = calculateReadingTime(text);
    expect(result.chars).toBe(text.length);
  });
});

// ---------------------------------------------------------------------------
// Schema smoke-tests (kept from original test file)
// ---------------------------------------------------------------------------
describe('Zod schema smoke tests', () => {
  it('validates document schema correctly', () => {
    const validDoc = { title: 'Guide.md', content: '# Hello', isFavorite: true };
    expect(documentSchema.safeParse(validDoc).success).toBe(true);

    const invalidDoc = { title: '', content: 'Empty title is invalid' };
    expect(documentSchema.safeParse(invalidDoc).success).toBe(false);
  });

  it('validates share snapshot schema with default expiration', () => {
    const parsed = shareSnapshotSchema.parse({ title: 'Shared Note', content: '# Content' });
    expect(parsed.expiresInDays).toBe(30);
  });
});
