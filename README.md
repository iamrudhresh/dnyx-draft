<div align="center">

  <img src="assets/icon.jpg" alt="Dnyx Draft logo" width="96" height="96" style="border-radius: 16px;" />

  <h1>Dnyx Draft</h1>

  **A modern, local-first Markdown editor and viewer with live preview.**

  Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Shadcn UI**, **Zustand**, and **Dexie.js**.

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Framework](https://img.shields.io/badge/framework-Next.js%2016-black.svg)](https://nextjs.org/)
  [![Language](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
  [![Styling](https://img.shields.io/badge/styling-Tailwind%20CSS%20v4-38BDF8.svg)](https://tailwindcss.com/)

</div>

---

## 🚀 Key Features

- **⚡ Real-Time Live Preview**: Instant split-screen or full-screen rendering of GitHub Flavored Markdown (GFM).
- **🧮 LaTeX Math Formulas**: Seamless inline ($E = mc^2$) and block equation rendering powered by KaTeX.
- **📊 Extended Diagram Engines**: Mermaid, Markmap, Vega-Lite, PlantUML, Graphviz, D2, WaveDrom, ABC notation, GeoJSON/TopoJSON maps, and 3D STL viewer — all with zoom/pan/copy/download toolbars.
- **💾 Local-First & Privacy First**: Zero login required. All documents, folders, revisions, comments, and tokens persist locally via IndexedDB (Dexie.js).
- **🎨 Light & Dark Themes**: High-contrast light theme and deep dark theme with zero FOUC via `next-themes`.
- **📁 Folder Explorer & Tabs**: Multi-document tabs, nested folders, search filtering, and favorites.
- **📤 Smart Export**: Export to Markdown, HTML, Word (.docx), or PDF (jsPDF + html2canvas with diagram serialization).
- **🌐 GitHub Import**: Import Markdown files from public or private GitHub repositories with encrypted PAT vault (AES-GCM, up to 50 tokens).
- **🔗 Share Snapshots**: Fast, ephemeral read-only shareable links.
- **🤝 Live Share**: Polling-based real-time collaboration with host/editor/viewer roles and 2-second content sync.
- **💬 Comments**: Threaded, anchored comment system with resolve/reopen backed by IndexedDB.
- **🗑️ Trash & Recovery**: Dedicated trash window with restore and permanent delete.
- **😊 Emoji Picker**: Full emoji database via `@emoji-mart/react` with cursor insertion.
- **📐 Insert Diagram**: Searchable modal with 17 diagram templates across 9 categories.
- **↔️ Text Direction & Alignment**: LTR/RTL toggle plus left/center/right/justify alignment buttons.
- **🌍 15-Language UI**: EN, ZH, JA, KO, FR, DE, ES, PT-BR, RU, AR, HI, BG, TR, IT.
- **📱 PWA**: Service worker with offline caching; installable as a standalone app.

---

## 🛠️ Tech Stack & Architecture

- **Monorepo**: Turborepo + pnpm
- **Framework**: Next.js 16 (App Router) with Server Components & Streaming SSR
- **Language**: 100% Strict TypeScript (zero JavaScript)
- **UI Components**: Shadcn UI & Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Local Storage**: Dexie.js (IndexedDB)
- **Testing**: Vitest + React Testing Library + jsdom
- **Tooling & Linter**: Biome + Husky

---

## 📦 Project Structure

```
Dnyx-Draft/
├── apps/
│   ├── web/                     # Next.js 16 (App Router) Web Application
│   └── landing/                 # Marketing/landing site
├── packages/
│   ├── markdown-engine/         # Shared AST parsing library
│   ├── crypto-vault/            # AES-256-GCM encryption package
│   ├── storage/                 # Dexie.js database schemas
│   └── ui/                      # Shared UI design tokens & theme library
├── docs/                        # Full Documentation Suite
│   ├── llms/                    # AI/LLM Cheatsheets
│   ├── architecture.md          # Architecture & data flow
│   ├── DESIGN.md                # UI & design tokens specification
│   ├── PRODUCT.md               # Product vision & user personas
│   ├── setup.md                 # Local setup & installation
│   ├── testing.md               # Vitest & integration testing guide
│   ├── deployment.md            # Vercel & container deployment
│   └── troubleshooting.md       # Common solutions & FAQ
└── .github/                     # Workflows & Copilot instructions
```

---

## 💻 Quick Start

### 1. Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x / 10.x

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/dnyxtech/dnyx-draft.git
cd dnyx-draft

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Code Quality

```bash
# Run Vitest test suite
pnpm test

# Run Biome formatting & lint check
pnpm check

# Type check TypeScript
pnpm --filter web typecheck
```

---

## 💖 Sponsor This Project

<div align="center">

  [![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?logo=githubsponsors&logoColor=white&style=for-the-badge)](https://github.com/sponsors/dnyxtech)

  If Dnyx Draft saves you time, consider [sponsoring the project on GitHub](https://github.com/sponsors/dnyxtech) — it helps fund ongoing development and maintenance. ⭐ Starring the repo helps too!

</div>

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
