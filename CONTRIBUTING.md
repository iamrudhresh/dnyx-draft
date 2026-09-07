# Contributing to Dnyx Draft

Thanks for your interest in contributing! This document covers everything you need to get set up, make a change, and open a pull request.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you're expected to uphold it.

## Prerequisites

- Node.js >= 20.x
- pnpm >= 10.x (`corepack enable` will pick up the version pinned in `package.json`)

## Getting Started

1. Fork the repository and clone your fork.
2. Create a feature branch: `git checkout -b feature/short-description` (or `fix/short-description` for bug fixes).
3. Install dependencies: `pnpm install`.
4. Start the dev server: `pnpm dev` (web app) or `pnpm dev:landing` (landing site), then open [http://localhost:3000](http://localhost:3000).

See the [README](README.md#-project-structure) for how the monorepo is laid out (`apps/web`, `apps/landing`, `packages/*`).

## Before You Open a Pull Request

Run the same checks CI will run:

```bash
pnpm typecheck   # Type-check all workspaces
pnpm check       # Biome format & lint (auto-fixes what it can)
pnpm test        # Vitest unit/integration suite
pnpm test:e2e    # Playwright end-to-end tests (if your change touches UI flows)
```

`lint-staged` also runs Biome automatically on staged files via a pre-commit hook, so most formatting issues are caught before you even commit.

## Commit Messages

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) — this is enforced automatically by a commit-msg hook:

```
<type>(optional scope): <description>

feat: add PDF export progress indicator
fix(editor): correct cursor position after emoji insert
docs: expand troubleshooting guide
chore: bump dependency versions
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

## Code Style

- Strict TypeScript everywhere — no untyped `any`, explicit types on function signatures.
- Tailwind CSS v4 utility classes and Shadcn/Radix UI primitives for components.
- Zustand for state, Zod + React Hook Form for validation.
- Mark client-interactive components with `'use client'`.
- Formatting/linting is handled by Biome (`pnpm check`) — don't hand-format against it.

## Changelog

This repo uses [Changesets](https://github.com/changesets/changesets) to track user-facing changes. If your change affects behavior users would notice, describe it in your PR so a changeset can be added as part of the review — this is used to generate `CHANGELOG.md`.

## Opening the Pull Request

1. Push your branch and open a PR against `main`.
2. Fill out the PR template — link any related issue, describe what changed and why, and confirm the checks above pass.
3. Add screenshots or a short clip for any UI-visible change.
4. A maintainer will review; please keep the PR focused on a single concern to make review faster.

## Reporting Bugs & Requesting Features

Please use the issue templates (Bug Report / Feature Request) rather than a blank issue — they ask for the details that let us reproduce or evaluate a request quickly. For security vulnerabilities, see [SECURITY.md](SECURITY.md) instead of opening a public issue.
