# Claude Project Guidelines

## Build & Test Commands
- Install dependencies: `pnpm install`
- Start development server: `pnpm dev`
- Run unit & integration tests: `pnpm test` (Vitest)
- Type check: `pnpm typecheck`
- Format & lint check: `pnpm check` (Biome)

## Code Standards
- Framework: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Shadcn UI
- State: Zustand
- Validation: Zod + React Hook Form
- Storage: Dexie.js (IndexedDB)
- Icons: Lucide React
- Error Handling: Wrapped with Sentry error boundaries
