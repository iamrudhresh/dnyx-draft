export interface TemplateItem {
  id: string;
  title: string;
  category: 'Engineering' | 'Academic' | 'Productivity';
  description: string;
  content: string;
}

export const TEMPLATE_LIST: TemplateItem[] = [
  {
    id: 'readme',
    title: 'Open-Source Project README',
    category: 'Engineering',
    description: 'Clean badges, tech stack, quick start guide, architecture overview, and license.',
    content: `# Project Name

> A fast, elegant, and modern tool for developers and technical teams.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)]()

## Key Features
- **Real-Time Speed**: Lightning-fast performance and instant response.
- **Local-First Architecture**: 100% offline data persistence.
- **Developer First**: Strict TypeScript, modern conventions, and clean APIs.

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Install dependencies
pnpm install

# Start development server
pnpm dev
\`\`\`

## System Architecture

\`\`\`mermaid
flowchart LR
  Client[Web Client] --> Gateway[API Gateway]
  Gateway --> ServiceA[Auth Service]
  Gateway --> ServiceB[Document Engine]
  ServiceB --> DB[(Database)]
\`\`\`

## License
Distributed under the MIT License. See \`LICENSE\` for more information.
`,
  },
  {
    id: 'rfc',
    title: 'Technical RFC / Architecture Decision',
    category: 'Engineering',
    description: 'RFC template with context, proposed solution, trade-offs, and verification plan.',
    content: `# RFC-042: Migration to Local-First Storage Architecture

- **Author**: Engineering Team
- **Status**: Draft / Under Review
- **Date**: 2026-08-22

## 1. Summary
This document proposes transitioning our primary client storage layer from synchronous \`localStorage\` to an asynchronous, transactional IndexedDB architecture backed by Dexie.js.

## 2. Motivation & Problem Statement
Currently, \`localStorage\` has a hard 5MB quota limit and blocks the main UI thread during large document serializations.

## 3. Proposed Architecture
1. **Dexie.js Storage Adapter**: Modular schema with multi-table indexing.
2. **Web Crypto Vault**: Optional client-side AES-256-GCM encryption for sensitive files.
3. **Reactive Zustand Store**: State synchronizes with IndexedDB transactions.

## 4. Risks and Trade-offs
- **Complexity**: Asynchronous database initializations require handling hydration boundaries.
- **Mitigation**: Add suspense boundary fallback skeletons.
`,
  },
  {
    id: 'api-spec',
    title: 'REST & GraphQL API Specification',
    category: 'Engineering',
    description: 'Endpoints, request headers, payload parameters, and JSON response schemas.',
    content: `# API Specification: Workspace Service

## Base URL
\`https://api.example.com/v1\`

## Authentication
Bearer token authorization header:
\`Authorization: Bearer <TOKEN>\`

---

## 1. Documents API

### \`GET /documents\`
Fetch paginated documents list.

**Query Parameters:**
| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`limit\` | \`number\` | No | Defaults to 20 (Max 100) |
| \`folderId\` | \`string\` | No | Filter documents by parent folder |

**Response \`200 OK\`:**
\`\`\`json
{
  "data": [
    {
      "id": "doc_8f92j1",
      "title": "Architecture Overview.md",
      "updatedAt": 1724352000000
    }
  ],
  "total": 1
}
\`\`\`
`,
  },
  {
    id: 'latex-paper',
    title: 'Academic LaTeX Research Paper',
    category: 'Academic',
    description:
      'Standard research paper with abstract, mathematical derivations, theorems, and bibliography.',
    content: `# Convergence of Gradient Methods in Non-Convex Optimization

**Author**: Dr. Alex Mercer, AI Research Labs  
**Date**: August 2026  

---

### Abstract
We present a rigorous analysis of adaptive momentum algorithms in non-convex stochastic optimization.

---

## 1. Mathematical Formulation

Let $f: \\mathbb{R}^d \\to \\mathbb{R}$ be an $L$-smooth function. The stochastic gradient update with momentum is given by:

$$
m_{t} = \\beta_1 m_{t-1} + (1-\\beta_1) g_t
$$

$$
\\theta_{t+1} = \\theta_t - \\frac{\\alpha}{\\sqrt{v_t} + \\epsilon} m_t
$$

Where $v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2$ tracks second moments.

### Theorem 1 (Bound on Gradient Norm)
Under standard assumptions, after $T$ iterations:

$$
\\min_{t=1 \\dots T} \\mathbb{E}\\left[\\|\\nabla f(\\theta_t)\\|^2\\right] \\le \\mathcal{O}\\left(\\frac{1}{\\sqrt{T}}\\right)
$$
`,
  },
  {
    id: 'meeting-notes',
    title: 'Weekly Sprint Meeting & Action Items',
    category: 'Productivity',
    description:
      'Attendees, agenda discussion points, decisions made, and assigned action checklists.',
    content: `# Engineering Sprint Sync — Week 34

- **Date**: 2026-08-23
- **Lead**: Product Manager
- **Attendees**: Alice, Bob, Charlie, Dana

---

## 1. Agenda Items
1. Monorepo build performance review
2. IndexedDB multi-tab synchronization strategy
3. Offline encryption key derivation optimization

## 2. Key Decisions Made
- [x] Standardize on Biome for linting and formatting across packages.
- [x] Use WebCrypto PBKDF2 with 100,000 iterations for AES-GCM vaults.

## 3. Action Items
- [ ] **Alice**: Refactor document tabs drag-and-drop state.
- [ ] **Bob**: Benchmark KaTeX formula rendering latency.
- [ ] **Charlie**: Draft documentation for CSV import module.
`,
  },
];
