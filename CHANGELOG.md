# Changelog

All notable changes to **Dnyx Draft** are documented in this file.

---

## [4.0.0] - 2026-08-31 (Sprint 1–8 Complete)

### ✨ Collaboration
- **Live Share**: Polling-based real-time collaboration with host/editor/viewer roles, invite URL generation, participant presence list, and 2-second content sync. In-memory room store with 6-hour expiry and 30-second stale participant pruning via `/api/live-room` (POST/GET/PATCH/DELETE).
- **Comments & Reviews**: Threaded comment system backed by IndexedDB — anchor text, threaded replies, resolve/reopen, delete, and filter-by-resolved. Author name persisted in `localStorage`.

### 📊 Extended Diagram Engines
- **KrokiViewer**: Renders PlantUML, Graphviz/DOT, D2, WaveDrom, ERD, and Pikchr via the Kroki API as SVG.
- **MarkmapViewer**: Interactive mind maps using `markmap-lib` + `markmap-view` with D3 zoom/pan.
- **VegaLiteViewer**: Data charts via `vega-embed` with automatic dark/light theme detection.
- **ABCViewer**: ABC music notation rendered by `abcjs` with Play/Stop audio synthesis via the Web Audio API.
- **GeoMapViewer**: Interactive GeoJSON and TopoJSON maps via Leaflet; TopoJSON converted client-side using `topojson-client`.
- **STLViewer**: 3D model viewer using Three.js + STLLoader + OrbitControls with a grid helper and auto-center/scale.
- **DiagramToolbar**: Shared diagram toolbar (zoom in/out/reset, copy SVG, download PNG, fullscreen) used by all diagram viewers.
- **MarkdownPreview**: Routes 14 fenced code block languages to their correct viewer.

### 🛡️ Security & Import
- **GitHub PAT Vault**: AES-GCM encrypted personal access token store (`lib/crypto/pat-vault.ts`). Supports up to 50 named tokens; each token is encrypted with a device-derived key stored in IndexedDB `tokens` table.
- **GitHub Import**: PAT selection UI with add/delete flow; token-authenticated `Authorization` header on fetch.

### 📤 Export
- **PDF Export**: Client-side PDF generation via `jsPDF` + `html2canvas` with SVG serialization; serializes Mermaid and other SVG diagrams to PNG before capture, then pages content for A4.

### 🖊️ Editor Toolbar
- **Text Alignment**: Left, center, right, justify buttons insert `<div style="text-align:...">` wrappers.
- **RTL/LTR Toggle**: Reads and sets `textDirection` from `useSettingsStore`; applied as `dir` attribute on the preview container.
- **Emoji Picker**: Opens `EmojiPickerModal` backed by `@emoji-mart/react` (dynamic import); inserts emoji shortcode at cursor.
- **Insert Diagram**: Opens `InsertDiagramModal` with 17 searchable diagram templates across 9 categories.

### 🌍 Localization & Settings
- **15-Language UI**: Complete translation map in `lib/i18n/index.ts` — EN, ZH, JA, KO, FR, DE, ES, PT-BR, RU, AR, HI, BG, TR, IT.
- **Language Selector**: Dropdown in SettingsModal to switch interface language; persisted via `useSettingsStore`.
- **Text Direction**: LTR/RTL toggle in SettingsModal.

### 🗑️ Workspace Management
- **TrashModal**: Dedicated trash window — restore or permanently delete individual documents, Empty Trash button with count.
- **ReleaseNotesModal**: v4.0.0 branded release notes; auto-shows on first run after a version bump via `lastSeenVersion` comparison.

### 🔧 ActivityBar & Navigation
- Added **Live Share** (Wifi), **Comments** (MessageSquare), **Trash** (Trash2), and **What's New** (Newspaper) buttons to ActivityBar bottom utility section. Each dispatches a `md:open-*` custom event caught by AppHeader.

### 📱 PWA
- **Service Worker** (`public/sw.js`): Cache-first for static assets, network-first for navigation and API routes. Registered in `app/providers.tsx` on mount.

### 🗃️ Database
- **IndexedDB v3**: Added `blobs`, `comments`, and `tokens` tables. New interfaces: `BlobItem`, `CommentItem`, `ReplyItem`, `TokenItem`.

---

## [4.0.0] - 2026-08-22

### 🚀 Major Framework & Architecture Migration
- **Next.js 16 (App Router)**: Completely migrated from legacy vanilla JavaScript to Next.js 16, React 19, and 100% Strict TypeScript.
- **Turborepo Monorepo**: Restructured into `apps/web`, `apps/desktop`, and `packages/` with centralized pnpm workspace configuration.
- **Tailwind CSS v4**: Built modern design system supporting crisp **Light Theme** and sleek **Dark Theme** via `next-themes`.

### ✨ New Features & Capabilities
- **Microsoft Word (`.docx`) Export Engine**: Client-side document builder converting Markdown headings, styled tables, lists, and code blocks into standard Word `.docx` documents.
- **Interactive Presentation Slide Deck Mode**: Marp-style full-screen presentation deck with keyboard navigation (Arrow keys, Spacebar, PageUp/Down) and progress tracking.
- **AST Synchronized Scrolling**: Line-matched proportional bidirectional scrolling between editor and preview panes.
- **Interactive Table Builder**: Visual spreadsheet modal allowing users to create, align (Left, Center, Right), resize, and insert Markdown tables.
- **CSV / TSV to Markdown Converter**: Instant client-side converter to turn tabular spreadsheet data into Markdown tables.
- **Auto-Table & Document Formatter**: AST linter to align table columns with uniform padding.
- **Document Diagnostics & Readability Analytics**: Flesch Reading Ease score (/100), word/syllable counts, reading time, and speaking time calculations.
- **In-Editor Find & Replace Bar**: Search with match count, case sensitivity, whole word, and regex support (`Ctrl+F`).
- **Native Web File System Access API**: Mount and edit local PC folders directly in the browser via `showDirectoryPicker`.
- **Pre-Built Professional Template Hub**: 6 starter templates for READMEs, Technical RFCs, API Specifications, Academic papers, Meeting notes, and Feature tours.
- **Interactive Floating Table of Contents (TOC)**: Auto-generated outline from `#` headers with smooth click-to-scroll navigation.

### 🌐 SEO, AEO & GEO Enhancements
- Added OpenGraph, Twitter card metadata, and Google-compliant JSON-LD `WebApplication` schema.
- Generated `sitemap.xml`, `robots.txt`, `public/llms.txt`, and `public/.well-known/llms.txt` for search engines and AI crawlers.

### 🧹 Refactoring & Cleanup
- Removed legacy vanilla scripts and old single-file implementations.
- Zero Biome formatting/linting warnings across all 80+ files in the repository.
