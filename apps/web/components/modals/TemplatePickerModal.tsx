'use client';

import {
  BookOpen,
  CheckSquare,
  Compass,
  FileCode,
  Layers,
  LayoutTemplate,
  Sigma,
} from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface TemplatePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TemplateOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'readme',
    title: 'Open-Source Project README',
    description: 'Clean badges, tech stack, quick start guide, architecture overview, and license.',
    icon: <FileCode className="h-5 w-5 text-blue-500" />,
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
    description: 'RFC template with context, proposed solution, trade-offs, and verification plan.',
    icon: <Layers className="h-5 w-5 text-indigo-500" />,
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
    description: 'Endpoints, request headers, payload parameters, and JSON response schemas.',
    icon: <Compass className="h-5 w-5 text-emerald-500" />,
    content: `# API Specification: Workspace Service

## Base URL
\`https://api.example.com/v1\`

## Authentication
Bearer token authorization header:
\`Authorization: Bearer <API_KEY>\`

---

## Endpoints

### 1. \`GET /documents\`
Returns a paginated list of documents.

#### Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`page\` | integer | Optional | Page number (default: 1) |
| \`limit\` | integer | Optional | Items per page (default: 20) |

#### Response: \`200 OK\`
\`\`\`json
{
  "status": "success",
  "data": [
    {
      "id": "doc_8f19b2",
      "title": "Project Roadmap.md",
      "updatedAt": "2026-08-22T21:00:00Z"
    }
  ]
}
\`\`\`
`,
  },
  {
    id: 'academic',
    title: 'Academic Paper & Math Notes',
    description: 'Structured research paper format with LaTeX formulas and proofs.',
    icon: <Sigma className="h-5 w-5 text-purple-500" />,
    content: `# Quantum State Evolution & Density Matrices

**Author**: Dr. Alex Mercer  
**Department**: Theoretical Physics, Quantum Information Group  

## Abstract
In this paper, we explore the time evolution of mixed quantum states in open systems under Markovian approximations.

## 1. Mathematical Formulation
The Lindblad master equation for the density operator $\\rho$ is given by:

$$
\\frac{d\\rho}{dt} = -\\frac{i}{\\hbar}[H, \\rho] + \\sum_{k} \\left( L_k \\rho L_k^\\dagger - \\frac{1}{2} \\{ L_k^\\dagger L_k, \\rho \\} \\right)
$$

Where:
- $H$ represents the system Hamiltonian
- $L_k$ are the Lindblad jump operators

## 2. Special Case: Two-Level System
For a single qubit undergoing dephasing:

$$
\\rho(t) = \\begin{pmatrix} \\rho_{00}(0) & \\rho_{01}(0) e^{-\\gamma t} \\\\ \\rho_{10}(0) e^{-\\gamma t} & \\rho_{11}(0) \\end{pmatrix}
$$
`,
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes & Sprint Planning',
    description: 'Action items checklist, decisions made, attendee list, and next steps.',
    icon: <CheckSquare className="h-5 w-5 text-amber-500" />,
    content: `# Sprint Planning & Architecture Sync

- **Date**: August 22, 2026
- **Attendees**: @rudhresh, @engineering-lead, @product-team
- **Facilitator**: Lead Architect

## 🎯 Objectives
1. Finalize Phase 1 feature release for Dnyx Draft.
2. Review DOCX export engine performance and test coverage.

## 📋 Action Items
- [ ] Implement AST synchronized scrolling between editor & preview
- [ ] Add Word (.docx) export format to modal
- [x] Configure Biome check & zero-warning pipeline
- [ ] Run end-to-end user acceptance tests

## 💡 Decisions Made
- **Decision 1**: Standardize on client-side \`docx\` generation for zero server latency.
- **Decision 2**: Keep all documents persisted locally in IndexedDB for maximum user privacy.
`,
  },
  {
    id: 'guide',
    title: 'Interactive Feature Showcase',
    description: 'Comprehensive demo of Markdown tables, code, alerts, math, and diagrams.',
    icon: <BookOpen className="h-5 w-5 text-rose-500" />,
    content: `# Dnyx Draft — Feature Tour ✨

Welcome to your **All-In-One** Markdown workspace!

## 1. Formatted Tables
| Tool | Offline Support | DOCX Export | LaTeX Math |
| :--- | :---: | :---: | :---: |
| **Dnyx Draft** | ✅ Yes | ✅ Yes | ✅ Yes |
| Dillinger | ⚠️ Partial | ❌ No | ❌ No |

## 2. Interactive Diagram
\`\`\`mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Review
  Review --> Published: Approved
  Review --> Draft: Revisions Needed
  Published --> [*]
\`\`\`

## 3. Mathematical Equations
Calculate the standard normal distribution:

$$
f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}
$$
`,
  },
];

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({ open, onOpenChange }) => {
  const { createDocument } = useWorkspaceStore();

  const handleSelectTemplate = async (template: TemplateOption) => {
    await createDocument(`${template.title}.md`, null, template.content);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <LayoutTemplate className="h-5 w-5 text-blue-500" /> Choose a Document Template
          </DialogTitle>
          <DialogDescription>
            Start your next document with a pre-formatted, professional template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 max-h-[65vh] overflow-y-auto pr-1">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/80 bg-slate-50/50 dark:bg-[#0b0f19] hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    {t.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-blue-600 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60"
                >
                  Use Template →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
