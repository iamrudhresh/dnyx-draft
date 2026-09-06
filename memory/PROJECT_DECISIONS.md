# Architecture & Product Decisions

## ADR-001: Next.js 16 App Router & 100% Strict TypeScript
- **Decision**: Adopt Next.js 16 with App Router, Turbopack, and strict TypeScript.
- **Rationale**: Provides fast builds, type safety, server route handlers, and clean React 19 component architecture.

## ADR-002: Local-First Storage with Dexie.js
- **Decision**: Persist all client documents to IndexedDB via Dexie.js.
- **Rationale**: Eliminates mandatory backend dependencies, ensures privacy, and enables offline functionality.

## ADR-003: Zustand for State Management
- **Decision**: Use Zustand over Redux.
- **Rationale**: Zero provider overhead, 1.1KB footprint, works inside and outside React lifecycle.
