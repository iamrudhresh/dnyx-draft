import { describe, expect, it } from 'vitest';
import {
  documentSchema,
  githubImportSchema,
  shareSnapshotSchema,
} from '@/lib/validations';

// ---------------------------------------------------------------------------
// documentSchema
// ---------------------------------------------------------------------------
describe('documentSchema', () => {
  it('accepts a valid document', () => {
    const result = documentSchema.safeParse({
      title: 'Guide.md',
      content: '# Hello',
      isFavorite: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = documentSchema.safeParse({ title: '', content: '# Hello' });
    expect(result.success).toBe(false);
  });

  it('rejects a title longer than 100 characters', () => {
    const result = documentSchema.safeParse({
      title: 'A'.repeat(101),
      content: '# Hello',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a title of exactly 100 characters', () => {
    const result = documentSchema.safeParse({
      title: 'A'.repeat(100),
      content: '',
    });
    expect(result.success).toBe(true);
  });

  it('allows optional tags array', () => {
    const result = documentSchema.safeParse({
      title: 'Doc.md',
      content: '# Content',
      tags: ['draft', 'review'],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual(['draft', 'review']);
  });

  it('accepts empty content', () => {
    const result = documentSchema.safeParse({ title: 'Empty.md', content: '' });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// shareSnapshotSchema
// ---------------------------------------------------------------------------
describe('shareSnapshotSchema', () => {
  it('parses valid data with default expiresInDays of 30', () => {
    const parsed = shareSnapshotSchema.parse({
      title: 'Shared Note',
      content: '# Note Content',
    });
    expect(parsed.expiresInDays).toBe(30);
  });

  it('accepts a custom expiresInDays', () => {
    const parsed = shareSnapshotSchema.parse({
      title: 'Note',
      content: '# Hi',
      expiresInDays: 7,
    });
    expect(parsed.expiresInDays).toBe(7);
  });

  it('rejects expiresInDays < 1', () => {
    const result = shareSnapshotSchema.safeParse({
      title: 'Note',
      content: '# Hi',
      expiresInDays: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects expiresInDays > 90', () => {
    const result = shareSnapshotSchema.safeParse({
      title: 'Note',
      content: '# Hi',
      expiresInDays: 91,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty content', () => {
    const result = shareSnapshotSchema.safeParse({ title: 'Note', content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = shareSnapshotSchema.safeParse({ title: '', content: '# Hi' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// githubImportSchema
// ---------------------------------------------------------------------------
describe('githubImportSchema', () => {
  it('accepts a github.com URL', () => {
    const result = githubImportSchema.safeParse({
      url: 'https://github.com/user/repo/blob/main/README.md',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a raw.githubusercontent.com URL', () => {
    const result = githubImportSchema.safeParse({
      url: 'https://raw.githubusercontent.com/user/repo/main/README.md',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-GitHub URL', () => {
    const result = githubImportSchema.safeParse({
      url: 'https://example.com/file.md',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a plain string that is not a URL', () => {
    const result = githubImportSchema.safeParse({ url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty string', () => {
    const result = githubImportSchema.safeParse({ url: '' });
    expect(result.success).toBe(false);
  });
});
