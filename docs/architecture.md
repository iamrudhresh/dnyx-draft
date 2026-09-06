# Architecture & Data Flow

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Next.js 16 App Router UI                       │
│   AppHeader (all modals) · ActivityBar · WorkspaceSidebar · TabBar   │
├─────────────────────────────┬────────────────────────────────────────┤
│     CodeMirror 6 Editor     │         Live Markdown Preview          │
│  Vim · LineNums · Find/Rpl  │  Remark · Rehype · KaTeX · Sanitize   │
│  EditorToolbar              │  MermaidViewer · DiagramToolbar        │
│  (align, RTL, emoji, AI,    │  KrokiViewer · MarkmapViewer          │
│   diagram template insert)  │  VegaLiteViewer · ABCViewer           │
│                             │  GeoMapViewer · STLViewer             │
├─────────────────────────────┴────────────────────────────────────────┤
│               Universal File Viewer (FileViewerRouter)               │
│  CsvTableViewer · JsonTreeViewer · YamlTreeViewer · CodeFileViewer  │
│  ImageViewer · PdfViewer · NotebookViewer · XlsxTableViewer         │
│  XmlTreeViewer · ConfigViewer · ArchiveViewer                        │
│  DataViewerToolbar (Format/Minify/Validate/Convert/Escape)          │
├─────────────────────────────┬────────────────────────────────────────┤
│     Import Pipeline          │    Export Pipeline                    │
│  file-router.ts              │  to-json.ts (structured JSON)        │
│  docx-to-markdown.ts         │  pdf.ts · zip.ts (existing)          │
│  html-to-markdown.ts         │  ExportModal (MD/HTML/PDF/PNG/JSON)  │
│  pdf-to-markdown.ts          │                                      │
│  folder-router.ts            │                                      │
├─────────────────────────────┴────────────────────────────────────────┤
│                    Zustand State Management Layer                    │
│      useWorkspaceStore (+ createBlobDocument) · useSettingsStore     │
├──────────────────────────────┬───────────────────────────────────────┤
│     Dexie.js (IndexedDB v4)  │    Web Crypto (AES-256-GCM)          │
│  documents · folders         │  Secret workspace (pat-vault.ts)     │
│  revisions · blobs           │  AI key store (key-store.ts)         │
│  comments · tokens           │  PBKDF2-SHA256, session passphrase   │
└──────────────────────────────┴───────────────────────────────────────┘
```

## 2. Key Architectural Patterns

### Modal Ownership
**AppHeader owns all modals** and renders them in a single React fragment. ActivityBar and other components dispatch `md:open-*` custom `window.Event` values instead of owning modal state themselves. This prevents duplicate dialog renders and keeps state centralized.

Custom events dispatched: `md:open-settings`, `md:open-presentation`, `md:open-trash`, `md:open-comments`, `md:open-release-notes`, `md:open-live-share`.

### Diagram Routing
`MarkdownPreview` intercepts fenced code blocks and delegates to specialized viewer components:

| Fence tag(s) | Viewer |
| :--- | :--- |
| `mermaid` | `MermaidViewer` |
| `markmap` | `MarkmapViewer` |
| `vega-lite`, `vegalite` | `VegaLiteViewer` |
| `abc` | `ABCViewer` |
| `plantuml`, `dot`, `graphviz`, `d2`, `wavedrom`, `erd`, `pikchr` | `KrokiViewer` |
| `geojson` | `GeoMapViewer` |
| `topojson` | `GeoMapViewer` (via topojson-client) |
| `stl` | `STLViewer` |

All viewers share `DiagramToolbar` (zoom, pan, copy SVG, download PNG, fullscreen).

### PAT Vault
`lib/crypto/pat-vault.ts` encrypts GitHub tokens with AES-GCM before writing to the IndexedDB `tokens` table. A per-device vault key is derived once and persisted to `localStorage`.

### Universal File Viewer — FileViewerRouter
`app/page.tsx` checks `activeDoc.fileType`. When it is set and not `'markdown'`, it renders `<FileViewerRouter doc={activeDoc} />` in place of the editor+preview split. The router switches on `fileType` and mounts the appropriate viewer component.

All heavy viewer packages (mammoth, pdfjs-dist, xlsx, jszip, highlight.js, fast-xml-parser) use **dynamic import** — they are never included in the initial JS bundle.

### Data Format Tooling — DataViewerToolbar
The JSON, XML, YAML, and CSV viewers each render `components/viewers/DataViewerToolbar.tsx` when the document is editable. It exposes Format, Minify, Validate, Convert, and Escape/Unescape actions, backed by pure functions in `lib/format/{json,xml,yaml,csv}.ts` and the format-agnostic converter in `lib/convert/index.ts`.

- **Format/Minify** call the matching `lib/format/*` function and write the result back to the document in place via `updateDocument`, consistent with how these viewers already handle live edits.
- **Validate** runs a lightweight check (parse success, plus AJV `$schema` validation for JSON, well-formedness only for XML, and a column-count warning for CSV) and reports the result as a toast — it does not mutate the document.
- **Convert** opens `components/modals/FormatConverterModal.tsx`, which routes the conversion through `lib/convert/index.ts`'s canonical JS-object intermediate representation (`toObject(content, format)` → `fromObject(obj, format)`) rather than hand-written pairwise converters. By default it creates a new sibling document; a secondary action replaces the current file in place.
- **Escape/Unescape** (JSON string, XML entity, URL, Base64) run on the raw document text and copy the result to the clipboard — they never mutate the document, since they typically apply to a substring rather than the whole file.
- `XmlTreeViewer` is fully editable: `fast-xml-parser`'s `XMLBuilder` serializes tree edits back to XML text, mirroring the existing YAML tree-edit → `js-yaml.dump()` path.

### Import Pipeline
`lib/import/file-router.ts` is the single entry point for all file imports. It dispatches by extension and returns `{ title, content, fileType, sourceFormat?, warnings?, searchableText? }`. Converters:

| Extension(s) | Converter |
| :--- | :--- |
| `.docx` | mammoth (HTML) + turndown (Markdown) |
| `.html`, `.htm` | turndown |
| `.pdf` | pdfjs-dist text extraction |
| `.ipynb` | cell source extraction into `searchableText` |
| Images, `.pdf` (blob) | stored in `db.blobs`; `createBlobDocument` action |

`lib/import/folder-router.ts` walks a dropped folder (via `<input webkitdirectory>`) and calls `routeFileImport` per file with a progress callback.

### AI Key Store (BYOK)
`lib/ai/key-store.ts` encrypts AI API keys with AES-256-GCM derived from a user passphrase (PBKDF2-SHA256, 100 000 iterations). Keys are stored in `db.tokens`. The decrypted key is cached in module-level memory only for the session — it is never written to storage or `localStorage`.

### DB Schema — v4
Version 4 (additive migration) adds `fileType` as an indexed field on `documents` and keeps the `blobs` table (was dormant in v3) active for binary file storage.

## 3. Local-First Data Flow
1. **Typing & Editing**: Editor updates Zustand store; debounced save writes to IndexedDB.
2. **Parsing**: Markdown transformed through Unified/Rehype pipeline with KaTeX and rehype-sanitize.
3. **File Viewing**: Non-markdown documents skip the editor/preview and go directly to `FileViewerRouter`.
4. **Revisions**: Auto-snapshot every 5 minutes per document (max 50 revisions), pruning oldest.
5. **Encryption**: Secret workspace documents, PAT tokens, and AI API keys pass through `crypto.subtle` AES-GCM.

## 4. Serverless APIs

| Route | Methods | Purpose |
| :--- | :--- | :--- |
| `/api/share` | POST, GET | Ephemeral read-only snapshot storage |
| `/api/live-room` | POST, GET, PATCH, DELETE | In-memory polling-based collaboration rooms |

### Live Room Architecture
The current implementation uses a **polling-based in-memory store** (a `Map<string, Room>`) rather than WebSockets. This works for single-instance deploys. For multi-instance production, replace with Redis or Cloudflare Durable Objects.

- **POST** — create room (host content, title, access mode)
- **GET** — join/poll room; upsert participant; return content + participants
- **PATCH** — push content update from editor/host
- **DELETE** — close room

Stale participants (>30 s) and expired rooms (>6 h) are pruned on each request.

## 5. PWA & Service Worker
`public/sw.js` is registered in `app/providers.tsx` on mount. Strategy:
- **Navigation requests**: network-first, fallback to cache.
- **Static assets**: cache-first after first fetch.
- **API routes** (`/api/*`): always network, never cached.
