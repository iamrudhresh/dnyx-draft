# Multi-Agent Guidelines & Repository Rules

## 1. Core Principles
- **Local-First Architecture**: All core features (editor, live preview, IndexedDB storage, encryption) must run completely client-side without requiring external server calls.
- **Type Safety**: Strictly adhere to TypeScript. Avoid `any` types; prefer strict schemas via `zod` and interface definitions.
- **Framework Conventions**: Follow Next.js 16 (App Router) best practices. Keep client components minimal (`'use client'`) and prefer React Server Components for static/data shells where applicable.
- **UI & Design**: Utilize Tailwind CSS v4 and Shadcn UI (Radix primitives). Ensure full dark mode accessibility with `next-themes`.

## 2. State Management Rules
- Use **Zustand** for global client-side state.
- Keep stores modular: `useWorkspaceStore`, `useSettingsStore`, and `useLiveRoomStore`.
- Persist critical document states to **Dexie.js (IndexedDB)**.

## 3. Formatting & Linting
- Formatting and linting are strictly governed by **Biome**.
- Run `pnpm format` or `pnpm check` before committing.
