import { describe, expect, it } from 'vitest';
import type { DocumentItem, FolderItem } from '@/lib/db/schema';
import { generateWorkspaceZip } from '@/lib/export/zip';

describe('Workspace ZIP Export Generator', () => {
  it('should generate a valid ZIP archive containing folders and markdown files', async () => {
    const folders: FolderItem[] = [
      { id: 'f1', name: 'Guides', parentId: null, createdAt: Date.now() },
    ];

    const docs: DocumentItem[] = [
      {
        id: 'd1',
        title: 'README.md',
        content: '# Project Readme',
        folderId: null,
        tags: [],
        isFavorite: false,
        isTrash: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'd2',
        title: 'Setup.md',
        content: '## Setup instructions',
        folderId: 'f1',
        tags: [],
        isFavorite: false,
        isTrash: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const blob = await generateWorkspaceZip(docs, folders);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('application/zip');
  });
});
