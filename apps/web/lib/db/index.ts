import Dexie, { type Table } from 'dexie';
import type {
  BlobItem,
  CommentItem,
  DocumentItem,
  FolderItem,
  RevisionItem,
  TokenItem,
} from './schema';

export class MarkdownDatabase extends Dexie {
  documents!: Table<DocumentItem, string>;
  folders!: Table<FolderItem, string>;
  revisions!: Table<RevisionItem, string>;
  blobs!: Table<BlobItem, string>;
  comments!: Table<CommentItem, string>;
  tokens!: Table<TokenItem, string>;

  constructor() {
    super('DnyxDraftDB');
    this.version(1).stores({
      documents: 'id, title, folderId, isFavorite, isSecret, isTrash, createdAt, updatedAt, *tags',
      folders: 'id, name, parentId, createdAt',
    });
    this.version(2).stores({
      documents: 'id, title, folderId, isFavorite, isSecret, isTrash, createdAt, updatedAt, *tags',
      folders: 'id, name, parentId, createdAt',
      revisions: 'id, documentId, timestamp',
    });
    this.version(3).stores({
      documents: 'id, title, folderId, isFavorite, isSecret, isTrash, createdAt, updatedAt, *tags',
      folders: 'id, name, parentId, createdAt',
      revisions: 'id, documentId, timestamp',
      blobs: 'id, name, mimeType, createdAt',
      comments: 'id, documentId, resolved, createdAt',
      tokens: 'id, name, createdAt',
    });
    this.version(4).stores({
      documents:
        'id, title, folderId, isFavorite, isSecret, isTrash, createdAt, updatedAt, *tags, fileType',
      folders: 'id, name, parentId, createdAt',
      revisions: 'id, documentId, timestamp',
      blobs: 'id, name, mimeType, createdAt',
      comments: 'id, documentId, resolved, createdAt',
      tokens: 'id, name, createdAt',
    });
  }
}

// Typed as MarkdownDatabase | null — callers must guard with `if (db)`.
export const db: MarkdownDatabase | null =
  typeof window !== 'undefined' ? new MarkdownDatabase() : null;

const OLD_DB_NAME = 'MarkdownViewerDB';
const NEW_DB_NAME = 'DnyxDraftDB';

// One-time migration from the pre-rebrand database name. Copies data over
// without deleting the old database, so nothing is lost if this runs twice
// or partway through.
async function migrateLegacyDatabaseName(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  const databases = (await window.indexedDB.databases?.()) ?? [];
  const hasLegacyDb = databases.some((info) => info.name === OLD_DB_NAME);
  if (!hasLegacyDb) return;

  const newDb = new MarkdownDatabase();
  const alreadyMigrated = (await newDb.documents.count()) > 0;
  newDb.close();
  if (alreadyMigrated) return;

  const legacyDb = new Dexie(OLD_DB_NAME);
  legacyDb.version(4).stores({
    documents:
      'id, title, folderId, isFavorite, isSecret, isTrash, createdAt, updatedAt, *tags, fileType',
    folders: 'id, name, parentId, createdAt',
    revisions: 'id, documentId, timestamp',
    blobs: 'id, name, mimeType, createdAt',
    comments: 'id, documentId, resolved, createdAt',
    tokens: 'id, name, createdAt',
  });

  try {
    await legacyDb.open();
    const targetDb = new MarkdownDatabase();
    for (const table of [
      'documents',
      'folders',
      'revisions',
      'blobs',
      'comments',
      'tokens',
    ] as const) {
      const rows = await legacyDb.table(table).toArray();
      if (rows.length > 0) {
        await targetDb.table(table).bulkPut(rows);
      }
    }
    targetDb.close();
  } catch {
    // Legacy database missing a table/version, or otherwise unreadable — skip migration.
  } finally {
    legacyDb.close();
  }
}

if (typeof window !== 'undefined') {
  void migrateLegacyDatabaseName();
}
