# IndexedDB Storage Engine (Dexie.js)

## Database Schema
- **Database Name**: `DnyxDraftDB` (migrated automatically from the legacy `MarkdownViewerDB` name on first load; see `apps/web/lib/db/index.ts`)
- **Current Version**: 3

### Tables

| Table | Index Keys | Purpose |
| :--- | :--- | :--- |
| `documents` | `id, folderId, isTrash, *tags` | Document metadata — title, content, favorite, secret, trash, tags, timestamps |
| `folders` | `id, parentId` | Folder tree — name, parent, creation time |
| `revisions` | `id, documentId` | Auto-saved revision snapshots (max 50 per doc, every 5 min) |
| `blobs` | `id, name, mimeType, createdAt` | Binary media blobs (images, attachments) — reserved for future media persistence |
| `comments` | `id, documentId, resolved, createdAt` | Threaded document comments with anchor text, replies, resolve state |
| `tokens` | `id, name, createdAt` | AES-GCM encrypted GitHub PAT entries (up to 50) |

### Version History

| Version | Changes |
| :--- | :--- |
| 1 | `documents`, `folders` |
| 2 | Added `revisions` |
| 3 | Added `blobs`, `comments`, `tokens` |

## Encryption

### Document Encryption
Documents marked as `isSecret` are encrypted using `crypto.subtle` (AES-256-GCM) with PBKDF2 100,000-iteration key derivation before writing to disk.

### PAT Vault (`lib/crypto/pat-vault.ts`)
GitHub Personal Access Tokens are stored encrypted in the `tokens` table:
- A per-device **vault key** is derived once and cached in `localStorage` as `md-vault-key` (base64).
- Each token value is encrypted with AES-GCM (random 12-byte IV) and stored as `{ iv, cipher }` JSON in the `value` field.
- Functions: `listTokens()`, `addToken(name, rawValue)`, `getToken(id)`, `deleteToken(id)`.

## Revision Auto-Save
- `debouncedDbSave` triggers a revision snapshot every 5 minutes per document when content changes.
- Maximum 50 revisions per document — oldest are pruned automatically.
- Revisions store: `id, documentId, title, content, timestamp`.

## Persistence Boundary
- Document **content** is written to IndexedDB only (not `localStorage`).
- UI state (active tab, sidebar open, sort order, activity tab, pinned tabs, Pomodoro goal) is persisted via Zustand `persist` middleware to `localStorage` under `md-viewer-workspace`.
- Settings (theme, font, direction, language, version) persist to `localStorage` under `md-viewer-settings`.
