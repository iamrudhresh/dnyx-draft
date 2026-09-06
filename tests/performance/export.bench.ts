import { bench, describe } from 'vitest';
import type { DocumentItem, FolderItem } from '@/lib/db/schema';
import { generateWorkspaceZip } from '@/lib/export/zip';

// ---------------------------------------------------------------------------
// Shared fixture builders
// ---------------------------------------------------------------------------

function makeDoc(i: number, folderId: string | null = null): DocumentItem {
  return {
    id: `doc-${i}`,
    title: `Document ${i}.md`,
    content: `# Document ${i}\n\n${'Lorem ipsum dolor sit amet. '.repeat(50)}\n\n## Section\n\nMore content here.\n`,
    folderId,
    tags: ['bench', `tag-${i % 5}`],
    isFavorite: i % 10 === 0,
    isTrash: false,
    createdAt: Date.now() - i * 1000,
    updatedAt: Date.now(),
  };
}

function makeFolder(i: number, parentId: string | null = null): FolderItem {
  return {
    id: `folder-${i}`,
    name: `Folder ${i}`,
    parentId,
    createdAt: Date.now() - i * 1000,
  };
}

// Fixture sets
const SMALL_DOCS = Array.from({ length: 5 }, (_, i) => makeDoc(i));
const SMALL_FOLDERS: FolderItem[] = [makeFolder(0)];

const MEDIUM_DOCS = Array.from({ length: 50 }, (_, i) => makeDoc(i, i < 20 ? 'folder-0' : null));
const MEDIUM_FOLDERS: FolderItem[] = Array.from({ length: 5 }, (_, i) => makeFolder(i));

const LARGE_DOCS = Array.from({ length: 200 }, (_, i) =>
  makeDoc(i, i < 100 ? `folder-${i % 10}` : null),
);
const LARGE_FOLDERS: FolderItem[] = Array.from({ length: 20 }, (_, i) =>
  makeFolder(i, i > 0 ? `folder-${Math.floor(i / 2)}` : null),
);

// A document with a very large content payload (~100 KB)
const LARGE_CONTENT_DOC: DocumentItem = {
  ...makeDoc(0),
  content: '# Large\n\n' + 'A'.repeat(100_000),
};

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe('generateWorkspaceZip performance', () => {
  bench('tiny — 5 docs, 1 folder', async () => {
    await generateWorkspaceZip(SMALL_DOCS, SMALL_FOLDERS);
  });

  bench('medium — 50 docs, 5 folders', async () => {
    await generateWorkspaceZip(MEDIUM_DOCS, MEDIUM_FOLDERS);
  });

  bench('large — 200 docs, 20 nested folders', async () => {
    await generateWorkspaceZip(LARGE_DOCS, LARGE_FOLDERS);
  });

  bench('single 100 KB document', async () => {
    await generateWorkspaceZip([LARGE_CONTENT_DOC], []);
  });

  bench('no folders — flat workspace, 100 docs', async () => {
    const docs = Array.from({ length: 100 }, (_, i) => makeDoc(i, null));
    await generateWorkspaceZip(docs, []);
  });
});
