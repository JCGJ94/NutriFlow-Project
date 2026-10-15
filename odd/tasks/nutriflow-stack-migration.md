# NutriFlow stack migration (template conventions, Bun, flat Next.js app)

Objective: move NutriFlow from a pnpm/Turborepo monorepo to a flat Next.js app on Bun, adopting the conventions of the user's Next.js base template, without losing Supabase.
Branch: work continues on `feat/nextjs-full-stack-migration` (or a branch cut from it); `main` is not touched until the user explicitly approves a merge. Delivery: `ask-on-risk`. Test runner: vitest, tsc, eslint, `next build`.
Template: `E:\Full Stack Jose Carlos\Desarrollo con IA\plantilla-base-nextjs16.3\devs` (read-only reference).
Source of truth: this file owns the flatten, package manager, toolchain, `@supabase/ssr`, data-layer and redesign phases; `openspec/changes/consolidate-nextjs-migration/tasks.md` keeps the safety/contracts work already done and the agent guardrails.

## Specs

S1. "pnpm este gestor de paquetes es muy lente- plantearia una migraciona  bun" - package manager becomes Bun (`bun.lock`, `bun install`, Vercel install/build commands, CI, docs).
S2. "esta planbtilla de next utiliza lo que creo que es bastante recomendado hoy en dia" - use the template's conventions as the reference. Interpretation (not stated by the user): flat `src/` layout, `proxy.ts`, `lib/site.ts` as the single SEO source, sitemap/robots/manifest/JSON-LD, `AGENTS.md` with the retrieval-led rule, project skills, Tailwind v4, ESLint 9, `typecheck` script. Google Analytics with a cookie banner is a product/privacy decision and stays opt-in.
S3. "creeemos el mplan para transformar y migrar nutriflow con criterio" - every unit is small, reversible, green before the next one starts, and gets an independent verifier when it is high risk. Nothing is implemented until the user approves this plan.
S4. (confirmed by the user, L3) Supabase stays as database and auth. The template's Neon layer is NOT adopted: it has no auth, and NutriFlow depends on Supabase Auth, RLS, `pgvector` and 3 existing users.
S5. (assumption) Next.js stays on the stable `16.4.1`. The template pins `16.3.0-preview.5`, a preview; its conventions are adopted, not its version. `turbopackFileSystemCacheForBuild` is already `true` by default in 16.4.1 (checked in `node_modules/next/dist/docs`), so it is not copied.
S6. Existing behaviour is preserved by unit: 129 tests, `tsc`, lint (0 errors) and `next build` give the same result before and after each unit. The hosted Supabase is untouched except where a unit says so and the user authorizes it.

## Tasks

| ID | Specs | Route | Status | Unit |
| - | - | - | - | - |
| M0 | S3,S6 | inline | done | Baseline: manual run dropped by the user (L3); commit and push the pending docs and `e0d5f46`; tag `pre-stack-migration`. `main` stays untouched; merging it is a separate, explicit decision at the end. |
| M1 | S2,S3,S6 | inline + verifier | done (2026-10-15), pushed (aeabae4), Vercel preview OK (user); independent verifier PASS on S2/S3/S6 in a fresh clone (stale `apps/web`/`packages/shared` lockfile importers found and removed) ; user set Root Directory to empty; pending on the user: merge `apps/web/.env.local` into the root `.env.local` | Flatten. Evidence: baseline in the monorepo vs flat root: `tsc` 0 / 0, tests 129 / 129 (21 files), `next build` same 43 routes, lint 0 errors (261 to 262 warnings: the lint scope now also covers root `*.js`/`*.ts` config files). `pnpm-lock.yaml` re-resolved: direct versions unchanged, a few transitives bumped within range (sharp's `@img/colour`, `semver`, `picomatch`, `tinyglobby`, `@emnapi/runtime`) and `turbo` removed. Next rewrote `tsconfig.json` (`jsx: react-jsx`, include `.next/dev/types`), which exposed 6 unused `import React` (removed). Original plan: First read the Vercel PROJECT settings (Root Directory, install/build overrides, Node version), not just `vercel.json`. Then `git mv apps/web/*` to root, merge the two `package.json`/tsconfig/eslint configs, vitest and Playwright configs, `packages/shared/src` to `src/lib/contracts` (28 files import `@nutriflow/shared`), update `.github/workflows/ci.yml` paths, delete `turbo.json`, `pnpm-workspace.yaml`, `packages/`, leftovers of `apps/api`. Still on pnpm. Risk item 5. |
| M2 | S1,S3,S6 | inline + verifier | done locally (2026-10-15), not pushed; evidence: `bun install` migrated `pnpm-lock.yaml` to `bun.lock` with the same resolved versions (484 vs 487 entries: only 3 duplicated transitives `nanoid@3.3.11`, `postcss@8.5.6`, `source-map-js@1.2.1` deduped); under Bun scripts `tsc` 0, lint 0 errors / 262 warnings, 129 tests, 43 routes, `next build` OK; `bun install` 12 s here vs pnpm 2 m 26 s online; only `core-js` postinstall (a funding message) is blocked, so no `trustedDependencies` is needed (sharp works through its prebuilt `@img` packages); Vercel docs: `bun.lock` is auto-detected (Bun >= 1.2, `bun install`), `vercel.json` pins `bun install --frozen-lockfile`; added the missing `test:e2e` script. Original plan: Bun. `bun install` from the pnpm lockfile and diff resolved versions; remove `pnpm-lock.yaml`, `packageManager`, `engines.pnpm`; `vercel.json` and project settings; `ci.yml`; README/CONTRIBUTING. Check which dependencies need install scripts (Bun blocks them unless listed in `trustedDependencies`: start with `sharp`, Playwright, `unrs-resolver`). Verify Vercel builds a preview with `bun.lock`. Risk item 5. |
| M3 | S2,S6 | inline | done locally (2026-10-15), not pushed; commits `fd7cee0` (PlanClient hooks called before an early return, Navbar anchors as `next/link`), `6ff05d7` (ESLint 9 flat config + `eslint-config-next` 16.4.1 + `typecheck` script) and the Tailwind 4 commit. Evidence: tsc 0, tests 129/129, 43 routes, lint 0 errors / 288 warnings (React 19 rules `set-state-in-effect`, `immutability`, `purity` kept as warnings: 13 sites in PlansContext, settings, PlanClient and others, to be rewritten in M7). Tailwind 4 via the official upgrade tool; two upgrade artefacts fixed by hand: base styles had been wrapped in `@layer utilities` (their `* {margin:0}` flattened `space-y-*`), and the dark `bg-page-gradient` kept the light `via` stop (`dark:via-none`). Visual smoke of 6 public pages x desktop/mobile x light/dark, v3 build vs v4 build: 0.05% to 2% differing pixels; the remaining differences are a Tailwind 4 precedence change, NOT a pass: converted component classes (`btn-primary`, `card`, `label`, ...) are now overridden by plain utilities on the same element (documented v4 behaviour), so overrides that never rendered in v3 now render. A scan of `src/**/*.tsx` found 12 elements: Navbar CTA `py-2 px-5` (smaller), hero CTA `px-8 py-4` (bigger), shopping-list button `bg-surface-900 text-white` (purple to near-black), shopping-list secondary `border-surface-200`, dashboard and plans empty-state cards (`py-12 border-dashed`, `bg-transparent shadow-none`), plans card `py-3`, plus `transition-*` and `label flex` no-ops. Most of them are on authenticated pages (dashboard, plans, onboarding, settings, shopping-list) that were NOT rendered (need a real Supabase session). DECISION PENDING (user): keep the production look (remove those overriding utilities) or accept the new look (needs a manual review with a test account). The `rotate-3` hero frame differs for a related reason. Linux is unproven (ESLint 9 and Tailwind 4 add native packages; `bun pm untrusted` lists `core-js` and `unrs-resolver` postinstalls, not needed on Windows); Tailwind 4 targets Safari 16.4+, Chrome 111+, Firefox 128+ and only Chromium was tested; no independent verifier ran for M3. A stale `.next` cache from Tailwind 3 prints a false `unknown utility` error: delete `.next` once. Original plan: Toolchain: ESLint 8 to 9 flat config; `typecheck` script; Tailwind 3.4 to 4 with the official upgrade tool plus a smoke check of the main pages (the redesign in M9 owns visual work); React 19 lint rules (no `setState` in `useEffect`). |
| M4 | S6 | inline + verifier | pending | Auth: `@supabase/ssr` 0.1.0 to current (cookie `getAll`/`setAll`), touches `proxy.ts`, server and browser clients. Login, register, session refresh and logout checked by hand and by tests. Risk item 2. |
| M5 | S6 | inline + verifier | pending | Types and schema: generated Supabase types (removes `ProfileRow` and `as any`); `exercise_plans` migration (hosted write, needs explicit authorization with the SQL shown first). Risk item 1. |
| M6 | S2 | inline | pending | Template layers, each opt-in: (a) `lib/site.ts`, sitemap/robots/manifest/JSON-LD for the landing page; (b) merge the template's `X-Robots-Tag` into the Supabase `proxy.ts` (do not replace it); (c) NutriFlow `AGENTS.md` agent instructions and project skills (a Supabase skill instead of `neon-postgres`); (d) Google Analytics + cookie banner ONLY if the user decides so; never send plan or profile data to analytics. Needs from the user: production domain, and the GA id if (d). |
| M7 | S6 | inline + verifier | pending | Data layer: reads in Server Components, writes in Server Actions, remove the `apiClient` round trips that stay internal. Large refactor, split per area (plans, shopping list, profile). |
| M8 | - | separate plan | blocked | OpenRouter LLM layer and agent v1 inside deterministic guardrails (kcal/macros/allergens in code; the model only picks among pre-filtered candidates). Blocked on the Jev/text-model test (needs an OpenRouter key) and on the Spanish product catalog licence decision. |
| M9 | - | separate plan | blocked | Redesign, after M3. |

Order rationale: M0 first so a structural migration is never mixed with unverified functional fixes; M1 before M2 because `workspace:*` and Turborepo are the main pnpm-specific friction; M2 before M3 so toolchain upgrades are tested on the final package manager; M4 (auth, high risk) before the SEO/analytics layers and the data-layer rewrite.

## Evidence and unknowns

- Measured here: `pnpm install --frozen-lockfile --offline` in a fresh clone with a warm store took 15 s. No Bun timing was taken (the user stopped that run and Bun is already decided).
- Disk (measured, L3): writing 5,000 small files took 3,874 ms on E: (HDD, project drive) vs 1,833 ms on C: (SSD); Defender real-time protection is on with no exclusion for development folders. Any package manager writes thousands of files, so this is a bigger lever than pnpm vs Bun. Options for the user: keep the repo and `node_modules` on C: (42 GB free), or add Defender exclusions for the project and the package cache (admin, lowers protection on those folders). Not changed here.
- Jev 1.13 through OpenRouter (tested 2026-10-15 with a temporary key, not stored): `POST /api/v1/systemone` works, ~0.6 s and ~$0.00002 per call. Diet-pattern pick 24/24 across 3 option orders; exercise pick from 11 options 30/30, same answer in every order 10/10; allergen-safe dish pick 6/6; arithmetic comparisons only 7/12, with wrong answers at confidence up to 0.78; an ambiguous question gave confidence 0.58. Small, easy fixtures: Jev fits picking among pre-filtered options, not numbers, so kcal/macros/allergen filtering stay in code (M8).
- Unverified, check inside M2: Vercel support for the text `bun.lock` and the Bun version it uses; `bun audit` and Dependabot support for Bun; that Playwright and vitest behave the same when launched through Bun scripts; that `bun install` keeps the exact resolved versions of `pnpm-lock.yaml`.
- Template `AGENTS.md` had a stray sentence on line 21 (a question pasted by mistake). Removed at the user's request (L3).
- Health data and analytics: nothing in M6(d) may load before consent, and plan/profile data must never reach analytics events (special-category data under GDPR art. 9).

## Log

### L1 - 2026-10-15 - user request (verbatim, Spanish)

> pnpm este gestor de paquetes es muy lente- plantearia una migraciona  bun

> E:\Full Stack Jose Carlos\Desarrollo con IA\plantilla-base-nextjs16.3\devs\AGENTS.md
>
> esta planbtilla de next utiliza lo que creo que es bastante recomendado hoy en dia
>
> creeemos el mplan para transformar y migrar nutriflow con criterio

### L3 - 2026-10-15 - user decisions (verbatim, Spanish)

> descarto prueba manual, si vamos a migrar arquitecturs y stack
>
> apreubo que dejes a supabes y no utilices neon en este caso
>
> esta frase eliminala ¿Autorizas que aplique la migración 007…"

> la carpeta de desarrollo se mantiene donde esta

The user also asked to commit and push without leaving any tool attribution in the history.

> si

> apps/web eso pone root directory

Vercel project setting (user answer): Root Directory = `apps/web`. Consequence: the old root `vercel.json` was never applied (Vercel reads it from the Root Directory), and after the flatten the project must use an empty or `./` Root Directory. Root `vercel.json` reduced to `{"framework":"nextjs"}` so no untested override goes live. Production (`main`) still has the old layout, so changing the setting breaks a redeploy of `main` until the branch is merged.

Approval to start M1 (answer to "¿apruebas que empiece M1?"). Commits: `4d390f4` (flatten), `b64a26c` (lockfile cleanup after the verifier). Native review declined for the candidate (Stop hook).

Disk decision: the repo stays on `E:`; no move to `C:`. Defender exclusions were not requested.

Effect: M0 no longer waits for a manual run; S4 is confirmed; the stray sentence was removed from the template; commits carry no co-author or tool attribution. The user also pasted a `pnpm dev` run: Next reported "Slow filesystem detected. The benchmark took 425ms" for `E:\...\apps\web\.next\dev` while the server was ready in 3.2 s, which points at the E: drive, not at pnpm (see M1/M2 notes).

### L2 - 2026-10-15 - advisor review applied

Removed the Bun benchmark as a requirement; marked S2's layer list as interpretation and made analytics opt-in; added the Vercel project-settings check and config merge to M1; moved Tailwind v4 to the upgrade tool plus smoke check; split the old M5 and moved the `@supabase/ssr` upgrade (auth) ahead of the SEO/analytics layers; added the `trustedDependencies` check to M2.
