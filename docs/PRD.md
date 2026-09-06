# Product Requirements Document (PRD) — Dnyx Draft

**Product Version**: 4.0.0  
**Framework**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4  
**Classification**: Enterprise Local-First Web Application  

---

## 1. Product Scope & Functional Requirements

### 1.1 Top Navigation & Global Controls
- **Brand Identity**: Clean logo badge with subtle gradient and typography.
- **Inline Title Renaming**: Click-to-rename document title with auto-save to IndexedDB.
- **View Mode Switcher**: Centered toggle buttons for **Editor Only**, **Split View (50/50)**, and **Live Preview Only**.
- **Quick Action Bar**:
  - `Diagnostics`: Opens structural health check, lint warnings, and Flesch readability stats.
  - `Templates`: Opens 6 professional starter templates (README, RFC, API Docs, Academic, Meeting Notes, Tour).
  - `Present`: Launches full-screen presentation slide deck.
  - `Import`: GitHub repository file fetcher via client-side REST.
  - `Export`: Modal for Markdown, HTML, PDF print, and Word `.docx`.
  - `Share`: Read-only snapshot URL generator.
  - `Zen Mode`: Fullscreen focus writing toggle.
  - `Theme Toggle`: Instant switch between Light Theme (`#ffffff`) and Dark Theme (`#090d16`).

---

### 1.2 Sidebar Workspace Explorer
- **Search & Filter**: Real-time filtering by document title, contents, favorites, and tags.
- **Directory Hierarchy**: Nested collapsible folder trees with document counters.
- **Mount Local PC Folder**: Direct integration with the Web File System Access API (`showDirectoryPicker`) to load local folder files.
- **Document Management**: Create file, create folder, toggle favorite, and soft delete to trash.

---

### 1.3 Editor Pane & Power Formatting Toolbar
- **CodeMirror / Styled Textarea**: Line numbers, monospace typography, tab key indentation (`2 spaces`), and standard keyboard shortcuts (`Ctrl+B`, `Ctrl+I`, `Ctrl+F`).
- **Interactive Formatting Tools**:
  - Headings (H1, H2, H3), Lists, Task Checklists (`- [ ]`), Blockquotes, Code Blocks, Math (`$$`), Hyperlinks, and Images.
  - **Visual Table Builder**: Spreadsheet modal for configuring columns, rows, cell values, and alignments (Left, Center, Right).
  - **CSV / TSV to Markdown**: Converts tabular data into aligned Markdown tables.
  - **Auto-Formatter**: One-click AST table alignment and spacing normalization.
  - **Find & Replace Bar**: In-editor search with match counter, case match, whole word match, regex support, and batch replace.

---

### 1.4 Live Preview Engine
- **GFM Rendering**: GitHub-Flavored Markdown tables, strikethrough, checklists, and autolinks.
- **Mathematical Typesetting**: Full KaTeX engine supporting inline ($...$) and block equations ($$...$$).
- **Interactive Diagrams**: Client-side dynamic Mermaid.js rendering for flowcharts, sequence diagrams, and class diagrams.
- **Code Fences**: Language badge with 1-click **Copy Code** button and visual checkmark feedback.
- **Interactive Table of Contents (TOC)**: Floating collapsible outline card with click-to-scroll navigation.
- **Synchronized Scrolling**: Proportional bidirectional scroll sync between editor and preview panes.

---

### 1.5 Export & Presentation Hub
- **Microsoft Word (`.docx`) Export**: Native client-side document generator via `docx` library.
- **Formatted PDF Print**: Print-ready CSS with page-break controls.
- **Standalone HTML**: Single `.html` export with bundled CSS.
- **Interactive Slide Deck**: Marp-style full-screen slide deck with arrow key navigation and slide counters.

---

## 2. Non-Functional Requirements (NFR)

1. **Local-First & Offline**: Complete functionality offline without server connection.
2. **Type Safety**: 100% strict TypeScript with zero `any` types.
3. **Accessibility (a11y)**: Semantic HTML landmarks, ARIA labels, full keyboard navigability, and high-contrast color ratios.
4. **Code Quality**: Enforced via Biome linter and formatter (0 warnings / 0 errors).
