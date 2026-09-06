# Contributing

Thanks for helping improve Dnyx Draft. Contributions can include bug reports, documentation fixes, renderer improvements, accessibility work, deployment fixes, tests, and translations.

## Before Changing Code

- Read [Features](Features.md) to understand current user-facing behavior and [Privacy and Security](Privacy-and-Security.md) for data boundaries.
- Check `CHANGELOG.md` for historical context.
- Keep changes scoped to the feature or bug you are working on.
- Do not remove user-facing behavior from docs unless the code no longer implements it.

Create a branch; do not work directly on `main`. Keep documentation-only changes separate from application behavior changes when practical.

## Local Development Setup

**Requirements:** Node.js ≥ 20, pnpm ≥ 9.

```bash
git clone https://github.com/dnyxtech/dnyx-draft.git
cd dnyx-draft
pnpm install
pnpm dev          # starts the Next.js dev server at http://localhost:3000
```

The project is a **pnpm workspaces + Turborepo monorepo**. The web app lives in `apps/web/`. Run all commands from the **repo root** unless noted.

| Command | What it does |
| :--- | :--- |
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build (`apps/web/`) |
| `pnpm typecheck` | TypeScript type check (`apps/web/`) |
| `pnpm check` | Biome format + lint (repo root only) |
| `pnpm test` | All tests once (CI mode) |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm test:e2e` | Playwright end-to-end browser tests |
| `pnpm bench` | Performance benchmarks |

See [docs/setup.md](../setup.md) for the full setup guide and [docs/testing.md](../testing.md) for the test structure.

## Key Source Locations

| Path | Purpose |
| :--- | :--- |
| `apps/web/app/` | Next.js App Router pages and API routes |
| `apps/web/components/` | React components (editor, viewers, modals, sidebar) |
| `apps/web/components/viewers/` | Universal File Viewer components (CSV, JSON, YAML, PDF, …) |
| `apps/web/lib/db/` | Dexie.js schema and IndexedDB access |
| `apps/web/lib/store/` | Zustand stores (`useWorkspaceStore`, `useSettingsStore`) |
| `apps/web/lib/import/` | File import pipeline (DOCX→MD, HTML→MD, PDF→MD, file-router) |
| `apps/web/lib/export/` | Export helpers (PDF, ZIP, JSON) |
| `apps/web/lib/ai/` | AI BYOK key store (encrypted with PBKDF2 + AES-256-GCM) |
| `apps/web/lib/crypto/` | Low-level AES-GCM and PBKDF2 helpers |
| `functions/api/` | Cloudflare Pages Functions (live-room, share) |
| `tests/unit/` | Pure logic unit tests |
| `tests/integration/` | Route handler integration tests |
| `tests/performance/` | Vitest benchmarks |
| `docs/` | Architecture, API, setup, and testing docs |
| `docs/wiki/` | User-facing feature and usage docs |

## Adding a New File Viewer

1. Create `apps/web/components/viewers/MyViewer.tsx`.
2. Add the new `fileType` value to `DocumentFileType` in `apps/web/lib/db/schema.ts`.
3. Add the extension mapping in `apps/web/lib/import/file-router.ts`.
4. Add the `case` in `apps/web/components/viewers/FileViewerRouter.tsx`.
5. Use **dynamic import** for any heavy library (`await import('heavy-pkg')`).
6. Run `pnpm typecheck` and `pnpm build` before opening a PR.

## Adding Format/Convert Tooling for a Text-Based Format

The JSON, XML, YAML, and CSV viewers share `components/viewers/DataViewerToolbar.tsx` for Format, Minify, Validate, Convert, and Escape/Unescape actions. To add a new format to this toolbar (or extend an existing one):

1. Add `formatX`, `minifyX`, and `validateX` pure functions to a new or existing `apps/web/lib/format/<format>.ts` file — one function per operation, no viewer coupling, following the existing `lib/export/*.ts` convention.
2. If the format should support cross-format Convert, add a `toObject`/`fromObject` case to `apps/web/lib/convert/index.ts` rather than writing pairwise converters.
3. Wire the new `DataViewerFormat` value into `DataViewerToolbar.tsx` and the corresponding viewer.
4. Add unit tests under `tests/unit/format-<format>.test.ts` and, if convertible, extend `tests/unit/convert.test.ts`.
5. Add or extend a Playwright spec under `tests/e2e/` covering the new toolbar actions end-to-end (see [Testing](#testing) below).

## Adding or Modifying API Routes

When changing Share Snapshot, Live Room, or health behavior, update:

- `apps/web/app/api/<route>/route.ts` (Next.js route handler)
- `functions/api/live-room.ts` (Cloudflare Pages Function mirror)
- `tests/integration/<route>.test.ts`
- `docs/api.md`
- `docs/wiki/Features.md` (user-facing behavior changes)

## Code Style

- TypeScript everywhere. Follow the existing pattern in the file you are editing.
- Use Tailwind CSS v4 utility classes; avoid inline styles.
- Use Shadcn UI components for new dialogs, buttons, and inputs — do not build raw HTML equivalents.
- Use Lucide React for icons.
- **Dynamic import** all heavy packages (mammoth, pdfjs-dist, xlsx, jszip, highlight.js). Never add them to the top-level import.
- Keep expensive work off the hot typing path.
- Sanitize rendered HTML before insertion (rehype-sanitize is already wired).
- Preserve accessibility: ARIA labels, keyboard focus, Escape-to-close on modals.
- Write comments only when the *why* is non-obvious. Do not comment what the code already says.

## Documentation Rules

- Use concise, direct, internationally readable language and the approved feature names in [Localization and Terminology](Localization.md).
- Update the responsible Wiki page instead of creating a new page for a small addition.
- Document user-facing behavior, limits, data handling, and privacy implications.
- Keep wording simple and direct.
- If a feature sends data to a service, say so.
- If a feature is local-only, say where it is stored.
- Keep README summaries aligned with the wiki.
- When visible interface text changes, regenerate `assets/i18n/*.json`, review every new translation in context, and update `wiki/Localization.md` if the workflow changes.
- Verify claims against current code and tests rather than copying an older changelog statement.
- Use explicit `.md` extensions for repository-relative documentation links.

## Translation Contributions

1. Finalize the English source.
2. Review the terminology tables in [Localization and Terminology](Localization.md).
3. Update the relevant localized README or interface catalog without translating code, commands, paths, URLs, routes, keys, library names, Markdown syntax, or branch names.
4. Preserve Markdown structure, links, anchors, tables, and code fences.
5. Compare the translation with the English source for technical meaning and omissions.
6. Review grammar, UI-label consistency, heading length, and link targets in context.
7. Run `node assets/i18n/generate-ui-locales.mjs` only when interface catalogs are in scope, then review generated output before committing.
8. Run `node assets/i18n/audit-ui-locales.mjs` and resolve every reported problem.

Detailed Wiki pages are maintained in English. When no localized page exists, label the English destination instead of creating a broken localized link.

## Release Notes Format

Use the single extensionless [`RELEASE_NOTES`](../RELEASE_NOTES) file as both the current release note and the canonical example. Update it in place for each version; do not add a duplicate template or a versioned copy. Keep its source entirely in Markdown. The application adds the branded layout, action icons, section navigation, and active-section state after Markdown rendering.

Every release note must contain these parts in this order:

1. Brand line, version heading, unambiguous release date, one- or two-sentence summary, and the release/changelog links.
2. **Highlights** with at least one user-facing bullet.
3. Zero or more detail sections, each covering one user-facing topic.
4. **Thank you** as the final section, with contributor and change-reference bullets when available.

Scale the same format to the release size:

| Release scope | Highlights | Detail sections | Change references |
| :--- | :--- | :--- | :--- |
| Single fix or one commit | 1 | 0–1 | Link the issue, PR, or commit when useful |
| Small feature or maintenance update | 2–3 | 1–2 | List only the related PRs/issues |
| Large feature release | 3–5 | 2–6 | Curate the important PRs/issues; link the release for the full history |

Authoring rules:

- Use the Markdown syntax supported by the editor: headings, paragraphs, emphasis, inline or fenced code, links, images, blockquotes, GitHub-style alerts, ordered or unordered lists, task lists, tables, definition lists, footnotes, and horizontal rules. Use a construct only when it helps explain the release.
- Do not embed HTML elements, inline styles, `<style>` blocks, or scripts in `RELEASE_NOTES`. Presentation belongs to the scoped release-note renderer and stylesheet.
- Describe user impact instead of copying commit subjects.
- Do not show commit, PR, issue, file, or line counts in the introduction.
- Do not add empty headings. Delete any optional section that has no useful content.
- Keep **Highlights** to five bullets or fewer. Combine related changes instead of creating a card for every commit.
- Use `##` for sidebar topics and `###` only for supporting content inside a topic. The sidebar is generated automatically from the `##` headings.
- Use alerts only for migration steps, compatibility notes, data-loss risks, or other actions the user must notice.
- Keep references as Markdown bullets, not tables. For a very large release, list the most important references and rely on the release/changelog link for the complete history.
- With one contributor, use one bullet. With multiple contributors, use one bullet per person in display-name order and state each contribution briefly.
- When no individual credit is appropriate, replace the Contributors subsection with a short maintainer acknowledgement. Never leave a placeholder or empty list.
- Keep **Thank you** last because the application gives the final section its closing-card treatment.
- Preserve the standard release and changelog URLs so the application can add their icons.

Before publishing a release:

1. Verify the version and date in `RELEASE_NOTES`, `CHANGELOG.md`, `script.js`, and `sw.js`.
2. Verify every contributor and PR, issue, or commit link against GitHub.
3. Confirm that `RELEASE_NOTES` contains no raw HTML and remove any headings or Markdown constructs that are not useful for the current version.
4. Run `node assets/i18n/generate-ui-locales.mjs` and `node assets/i18n/audit-ui-locales.mjs` when visible labels or the version title change.
5. Run `npm run build` and the focused release-note lifecycle/responsive tests.

## Testing

Run the full test suite from the monorepo root:

```bash
pnpm test
```

Run benchmarks:

```bash
pnpm bench
```

Use watch mode while iterating on a specific file:

```bash
pnpm test:watch
```

Tests live in `tests/` at the repository root, organized as `unit/`, `integration/`, `performance/`, and `e2e/`. See [docs/testing.md](../docs/testing.md) for the full breakdown of what each suite covers.

End-to-end browser tests (Playwright) run separately, against a real dev server:

```bash
pnpm test:e2e
```

For documentation:

- run `git diff --check`;
- validate every relative file, image, and heading anchor;
- check Markdown fences and one-H1 structure;
- compare localized README headings and navigation;
- search for outdated terminology and unsupported claims; and
- review `git diff --name-only` to confirm the intended scope.

## Issue Reports

Search [existing issues](https://github.com/dnyxtech/dnyx-draft/issues) before opening a new one. Include:

- affected version or commit;
- browser/operating system and delivery target;
- exact reproduction steps;
- minimal non-sensitive Markdown;
- expected and actual results;
- console/network errors; and
- screenshots only when they add useful evidence.

Do not attach confidential Documents, managed-media URLs, Share Snapshot bearer links, Live Share invitations, room secrets, capabilities, or deletion tokens.

## Commit Messages

Conventional commit style is preferred:

```text
feat(editor): add table alignment option
fix(pdf): prevent blank trailing raster page
docs(wiki): clarify live share storage behavior
perf(render): reduce line gutter layout work
```

Useful types include `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, and `chore`.

## Pull Requests

A good PR includes:

- What changed.
- Why it changed.
- How it was tested.
- Screenshots or recordings for UI changes.
- Privacy/storage notes for share, import, live, or renderer changes.
- Documentation updates when behavior changes.

## Security Reports

Please do not open public issues for vulnerabilities. Use GitHub Security Advisories if available or contact the maintainers privately with a minimal reproduction and impact notes.

Include the affected version/commit, required preconditions, impact, minimal reproduction, and a suggested mitigation when known. Do not test against data or systems you do not own or have permission to assess.

## Repository Map

| Path | Purpose |
| :--- | :--- |
| `index.html` | App shell, toolbar, modals, default content, CDN tags. |
| `workspace-storage.js` | Browser IndexedDB storage, migration, backup, history, trash, and recovery operations. |
| `script.js` | Main application logic. |
| `preview-worker.js` | Worker Markdown rendering path. |
| `styles.css` | Layout, themes, renderer styles, modals, responsive UI. |
| `sw.js` | PWA/service-worker cache behavior. |
| `RELEASE_NOTES` | Single canonical extensionless release note bundled with the web/PWA build. |
| `assets/i18n/` | Interface catalogs, generator, and catalog-audit tool. |
| `functions/api/image/[[id]].js` | Content-addressed managed raster image and GIF API. |
| `functions/api/media/[[id]].js` | Route alias for content-addressed managed video uploads and delivery. |
| `functions/api/share/[[id]].js` | Stored Share Snapshot API. |
| `functions/live-room/[[room]].js` | Cloudflare Pages Live Share WebSocket entry. |
| `workers/live-room-worker.js` | Live Share Durable Object relay. |
| `wiki/` | Documentation source pages. |

Related pages: [Installation](Installation.md), [Localization and Terminology](Localization.md), and [Troubleshooting](Troubleshooting.md).
