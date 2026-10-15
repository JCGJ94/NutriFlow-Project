# Dependency audit - 2026-10-15 (Phase 0 cutover)

Command: `pnpm audit` at the repository root.

## Result

| Severity | Before | After |
| :--- | ---: | ---: |
| Critical | 4 | 0 |
| High | 63 | 42 |
| Moderate | 67 | 45 |
| Low | 17 | 14 |

## Fixed in this change

| Package | From | To | Why |
| :--- | :--- | :--- | :--- |
| `next` | 16.1.4 | 16.4.1 | Two critical advisories (unauthenticated RCE on Windows-hosted servers and in the Image Optimization API, fixed in >=16.3.3) plus several high ones (fixed in >=16.2.6). |
| `jspdf` | ^4.1.0 | ^4.2.1 | Critical HTML injection (fixed in >=4.2.1). Used by the shopping-list PDF export. |
| `vitest`, `@vitest/coverage-v8` | ^4.0.18 | ^4.1.11 | Critical advisory affecting the Vitest UI server (fixed in >=4.1.0). Dev-only. |

Verified after the upgrade: `tsc --noEmit` clean, 94/94 unit tests, `next build` succeeds.

## Remaining high advisories (decision)

The 42 remaining high advisories cover `minimatch`, `picomatch`,
`brace-expansion`, `braces`, `flatted`, `js-yaml`, `nanoid`, `postcss`,
`browserslist`, `source-map-js`, `vite`, `ws`, `undici` and `sharp`.

Checked with `pnpm why` (only these three were traced):

- `undici` comes from `jsdom` under `vitest` (test tooling only).
- `ws` comes from `@supabase/supabase-js` > `@supabase/realtime-js`, so it can be
  in the runtime path.
- `sharp` is a direct dependency of `apps/web`, so it is in the runtime path.

The other packages were not traced and are assumed to be build and lint
tooling until proven otherwise.

Decision: not addressed in the cutover commit. Treat `sharp` and `ws` first in
a dedicated dependency-hygiene change (upgrade or `pnpm.overrides`), then the
tooling packages (for example by upgrading `eslint` 8 to a supported major),
after the monorepo is flattened.

## Open follow-up

- `lucide-react` 0.321.0 declares a peer range that excludes React 19. It
  works today but should be upgraded.
- `@supabase/ssr` is still on ^0.1.0 and must be upgraded as its own unit
  because it changes the cookie API used by `src/proxy.ts`.
