# Testing Guide

## Running Tests

All commands run from the **monorepo root**.

| Command | What it does |
| :--- | :--- |
| `pnpm test` | Run all Vitest tests once (CI mode) |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:e2e` | Run Playwright end-to-end browser tests |
| `pnpm bench` | Run performance benchmarks with verbose output |

Tests live in `tests/` at the repository root. The Vitest config resolves `@/` imports to `apps/web/` so test files share the same import paths as source files. Playwright tests (`tests/e2e/`) are a separate suite — see [End-to-End Tests](#end-to-end-tests) below.

---

## Test Structure

```
tests/
├── unit/                    # Pure logic — no DOM or network
│   ├── convert.test.ts      # lib/convert/index.ts — JSON/XML/YAML/CSV conversion
│   ├── crypto.test.ts       # AES-256-GCM encrypt/decrypt
│   ├── docx.test.ts         # DOCX export blob
│   ├── escape.test.ts       # lib/utils/escape.ts — escape/unescape pairs
│   ├── format-csv.test.ts   # lib/format/csv.ts — format/minify/validate
│   ├── format-json.test.ts  # lib/format/json.ts — format/minify/validate
│   ├── format-xml.test.ts   # lib/format/xml.ts — format/minify/validate
│   ├── format-yaml.test.ts  # lib/format/yaml.ts — format/minify/validate
│   ├── formatter.test.ts    # Grammar-aware Markdown formatter
│   ├── trash-retention.test.ts  # 30-day trash expiry logic
│   ├── utils.test.ts        # formatBytes, calculateReadingTime
│   ├── validations.test.ts  # Zod schemas
│   └── zip.test.ts          # Workspace ZIP export
├── integration/             # Route handlers and module contracts
│   ├── api-health.test.ts   # GET /api/health
│   ├── api-live-room.test.ts # POST/GET/PATCH/DELETE /api/live-room
│   ├── api-share.test.ts    # POST /api/share + GET /api/share/[id]
│   ├── app.test.ts          # Monorepo smoke test
│   └── sitemap.test.ts      # Sitemap entries and locale coverage
├── e2e/                     # Playwright browser tests (pnpm test:e2e)
│   ├── helpers.ts           # resetWorkspace, importFile
│   ├── csv-tooling.spec.ts  # CSV viewer toolbar
│   ├── json-tooling.spec.ts # JSON viewer toolbar
│   ├── xml-tooling.spec.ts  # XML viewer toolbar + editability
│   └── yaml-tooling.spec.ts # YAML viewer toolbar
└── performance/             # Vitest benchmarks (pnpm bench)
    ├── export.bench.ts      # generateWorkspaceZip at varying scale
    └── formatter.bench.ts   # formatMarkdownDocument at varying scale
```

---

## Unit Tests

### Crypto (`crypto.test.ts`)
Verifies the AES-256-GCM implementation in `lib/crypto/aes.ts`:
- Round-trip encrypt → decrypt produces original plaintext.
- Each call produces a different ciphertext (random salt + IV).
- Wrong password throws on decrypt.
- Empty string and large (10 KB) documents round-trip correctly.
- Emoji and special characters survive the round-trip.
- Output is valid base64 and meets minimum length (salt 16 + IV 12 + GCM tag 16 bytes).

### Markdown Formatter (`formatter.test.ts`)
Verifies `formatMarkdownDocument`, `formatMarkdownTables`, `convertCsvToMarkdown`, and `calculateDocumentMetrics` in `lib/utils/markdown-formatter.ts`:
- Tables are aligned with uniform column padding.
- Separator alignment markers (`:--`, `:-:`, `--:`) are preserved.
- Content inside fenced code blocks (`` ``` ``, `~~~`) is left unchanged.
- Content inside `$$` math blocks is left unchanged.
- YAML frontmatter (`---`) is preserved verbatim.
- Tables after frontmatter are formatted.
- CSV and TSV input converts to aligned Markdown tables.
- Quoted CSV cells have surrounding quotes stripped.
- `calculateDocumentMetrics` returns Flesch score, word count, sentence count, and reading/speaking times; Flesch score is clamped to 0–100.

### Trash Retention (`trash-retention.test.ts`)
Mirrors the 30-day retention helpers used in `TrashModal` and `useWorkspaceStore`:
- `daysUntilExpiry` returns `null` for items without a timestamp.
- Returns 30 for a just-trashed item, 15 after 15 days, 1 after 29 days.
- Returns 0 (not negative) at the 30-day boundary and beyond.
- `isExpired` is `false` within 30 days and `true` after 30+ days.
- The batch filter in `initialize()` identifies only documents past the 30-day threshold.

### Utils (`utils.test.ts`)
- `formatBytes` formats 0, KB, MB, GB, and respects the `decimals` parameter.
- `calculateReadingTime` strips heading markers, fenced code blocks, inline code, image syntax, and link URLs before counting words; returns minimum 1 minute; includes raw character count.

### Validations (`validations.test.ts`)
Verifies Zod schemas in `lib/validations.ts`:
- `documentSchema` — accepts valid docs, rejects empty/over-100-char titles, accepts optional tags.
- `shareSnapshotSchema` — defaults `expiresInDays` to 30, rejects values outside 1–90, rejects empty content or title.
- `githubImportSchema` — accepts `github.com` and `raw.githubusercontent.com` URLs, rejects non-GitHub URLs and non-URLs.

### ZIP Export (`zip.test.ts`)
- `generateWorkspaceZip` produces a non-empty `application/zip` blob from a workspace with folders and documents.

### DOCX Export (`docx.test.ts`)
- `exportToDocx` produces a non-empty DOCX blob from Markdown content.

### Format (`format-json.test.ts`, `format-xml.test.ts`, `format-yaml.test.ts`, `format-csv.test.ts`)
Verify the pure `formatX`/`minifyX`/`validateX` functions in `lib/format/`:
- JSON: pretty-print/minify round-trip, invalid-JSON error path.
- XML: pretty-print/minify round-trip with attribute preservation (`fast-xml-parser`), malformed-XML rejection (mismatched tags).
- YAML: pretty-print/minify round-trip via `js-yaml`, documents that re-dumping drops comments, invalid-YAML error path.
- CSV: round-trips quoted fields with embedded commas and newlines (a regression test for the CSV viewer's parser, which now uses `papaparse` instead of a naive comma split), minify trims cell whitespace, validate warns on inconsistent column counts without failing.

### Convert (`convert.test.ts`)
Verifies `lib/convert/index.ts`'s `convert(content, from, to)` across every JSON/XML/YAML/CSV pair, including flattening nested objects into `key.nested` CSV columns and rejecting a bare primitive converted to CSV.

### Escape (`escape.test.ts`)
Verifies all four escape/unescape pairs in `lib/utils/escape.ts` (JSON string, XML entity, URL, Base64), including non-ASCII/UTF-8 round-trips and malformed-input error paths.

---

## Integration Tests

Integration tests import route handlers directly and call them with standard `Request`/`NextRequest` objects. No server is started; the handlers run in the Vitest jsdom environment.

### Health (`api-health.test.ts`)
Calls `GET /api/health` and asserts:
- HTTP 200 with `application/json` content type.
- Body fields: `status: "healthy"`, `app`, `version`, `timestamp` (valid ISO date), `engine`.

### Share (`api-share.test.ts`)
Tests `POST /api/share` and `GET /api/share/[id]` using the in-memory `snapshots` Map (cleared `beforeEach`/`afterEach`):
- POST creates a snapshot, returns `id` and `expiresAt`, and stores the snapshot.
- POST defaults to 30-day expiry; accepts custom `expiresInDays`.
- POST returns 400 for missing title, empty content, or `expiresInDays` outside 1–90.
- GET returns the snapshot for a valid id with all expected fields.
- GET returns 404 for an unknown id.
- GET returns 410 Gone and removes the record for an expired snapshot.

### Live Room (`api-live-room.test.ts`)
Tests `POST`, `GET`, `PATCH`, and `DELETE` for `/api/live-room`:
- POST creates a room and returns a `roomId`; returns 400 when `content` or `hostId` is missing; defaults title to `"Untitled"`.
- GET returns room content and participants; returns 404 for unknown rooms; returns 400 when `id` or `clientId` is missing; adds new participants by name; strips `lastSeen` from the response.
- PATCH updates content for authorized participants; returns 400/404 for missing fields or unknown rooms; ignores updates from unknown participants.
- DELETE removes the room (subsequent GET returns 404); returns `ok: true` even for non-existent rooms.
- Full round-trip: host creates → viewer joins → host edits → viewer polls and sees update → host deletes room.

### Sitemap (`sitemap.test.ts`)
Calls the `sitemap()` function from `app/sitemap.ts` and asserts:
- Exactly 16 entries (2 static pages + 14 non-English locale alternates).
- Canonical root URL has priority 1.0 and `changeFrequency: "weekly"`.
- `/readme-builder` has priority 0.8 and `changeFrequency: "monthly"`.
- All 14 non-English locales have entries with priority 0.7 and `changeFrequency: "monthly"`.
- No `/?lang=en` entry (English uses the canonical URL).
- All entries have a `lastModified` Date, absolute URLs, and no duplicates.

---

## Performance Benchmarks

Benchmarks use Vitest's `bench` API. Run them with `pnpm bench` to get Hz, min, max, mean, p75, p99, and rme measurements.

### Formatter (`formatter.bench.ts`)
Benchmarks `formatMarkdownDocument` across five document profiles:
| Scenario | Description |
| :--- | :--- |
| small | 5-row table (baseline) |
| medium | Frontmatter + prose + large table + code fence + math |
| large | 50 sections, each with a table and a code fence |
| prose-only | 100 paragraphs with no tables (formatter pass-through) |
| table-heavy | 30 tables × 8 rows × 4 columns |

### ZIP Export (`export.bench.ts`)
Benchmarks `generateWorkspaceZip` across five workspace sizes:
| Scenario | Description |
| :--- | :--- |
| tiny | 5 docs, 1 folder |
| medium | 50 docs, 5 folders |
| large | 200 docs, 20 nested folders |
| single 100 KB | One document with ~100 KB of content |
| flat 100 docs | 100 docs, no folders |

---

## End-to-End Tests

Playwright specs in `tests/e2e/` drive a real Chromium browser against a running dev server, covering behavior Vitest's jsdom environment can't exercise: real clicks, file-input uploads, clipboard access, and toast notifications.

Run with:

```bash
pnpm test:e2e
```

`playwright.config.ts` (repo root) starts `pnpm --filter web dev` automatically if nothing is already listening on `http://localhost:3000` (`reuseExistingServer: true`, so an already-running dev server is reused instead of a second one being started).

### Helpers (`helpers.ts`)
- `resetWorkspace(page)` — navigates to `/`, deletes the `DnyxDraftDB` and legacy `MarkdownViewerDB` IndexedDB databases for a clean slate, reloads, and dismisses the first-run "What's New" dialog if present.
- `importFile(page, filename, content)` — opens **Tools → Import File…** and uploads in-memory file content via Playwright's `setInputFiles` (no files are written to disk).

### Format/Convert Toolbar Specs
`csv-tooling.spec.ts`, `json-tooling.spec.ts`, `xml-tooling.spec.ts`, and `yaml-tooling.spec.ts` each import a sample document of that type and exercise the `DataViewerToolbar` end to end:
- **Validate** shows the expected success toast.
- **Format**/**Minify** show their success toasts (and, for CSV, that the table still renders correctly afterward).
- **Convert** opens `FormatConverterModal`, switches the target format, and asserts the live preview contains the expected converted content.
- The JSON spec additionally verifies **Escape/Unescape** copies a transformed value to the clipboard (`test.use({ permissions: ['clipboard-read', 'clipboard-write'] })`).
- The XML spec additionally verifies the tree view renders after import, confirming `docId`/`editable` are wired through `FileViewerRouter`.

### Environment Notes
Playwright downloads its own Chromium build on first run. If the default cache location (`%LOCALAPPDATA%\ms-playwright` on Windows) has insufficient disk space, browser processes can crash intermittently with unrelated-looking errors. Redirect the cache and temp directory to a drive with free space if needed:

```bash
export PLAYWRIGHT_BROWSERS_PATH="E:\pw-cache\browsers"
export TEMP="E:\pw-cache\tmp"
export TMP="E:\pw-cache\tmp"
pnpm exec playwright install chromium
pnpm test:e2e
```

---

## Configuration

**`vitest.config.ts`** (repo root):
- Environment: `jsdom` (provides `window.crypto.subtle`, `TextEncoder`, DOM APIs).
- Globals: `true` (no need to import `describe`, `it`, `expect`).
- `@` alias resolves to `apps/web/` to match source import paths.
- `include`: `tests/**/*.test.ts`, `tests/**/*.spec.ts`.
- `benchmark.include`: `tests/**/*.bench.ts`.

**`apps/web/vitest.config.ts`**: kept for editor/tooling alias resolution; `include: []` so it picks up no tests directly.
