# Tasks — consolidate-nextjs-migration

Delivery strategy: `ask-on-risk` (session preflight). Strict TDD active (`pnpm test`, Vitest): every implementation task records RED → GREEN → TRIANGULATE → REFACTOR evidence.

## Phase 0 — Cutover and hygiene (platform)

- [x] 0.1 Remove transient artifacts (7 `*.tmp.44556.*` files, `nul`); add `*.tmp.*` and `.mcp.json` to `.gitignore` (also added `.codegraph/` and `.pi/`, beyond the original scope) - commits cbc9df6..0f89396
- [x] 0.2 Fix `apps/web/vitest.config.ts` stale alias to `apps/api/node_modules` (point at `apps/web` dependency); clean checkout builds/tests - alias removed; clean-checkout verified by an independent verifier: install --frozen-lockfile, lint (0 errors, 242 warnings), 94/94 tests, build and smoke test PASS (tsc needs packages/shared built first)
- [x] 0.3 Upgrade `next` past the critical RCE advisory; run `pnpm audit`, record decisions for remaining high advisories in `docs/` note - next 16.1.4 -> 16.4.1, jspdf, vitest; critical 4 -> 0, high 63 -> 42; `docs/security/dependency-audit-2026-10-15.md` - commits cbc9df6..0f89396
- [x] 0.4 Fix 2 typecheck errors in migrated tests (`admin.spec.ts:35`, `shopping-list.spec.ts:70`) - `tsc --noEmit` clean - commits cbc9df6..0f89396
- [ ] 0.5 PARTIAL. Done: archived `DEPLOYMENT_ARCHITECTURE.md`, `plans/2026-02-06-nextjs-nestjs-upgrade*.md`, `specs/PRD-Railway-MCP-Integration.md` to `docs/archive/`; removed `railway.toml`; README.md and README.es.md aligned. Still mention the old stack: `docs/architecture/{overview.md,overview.es.md,diet-engine-architecture.en.md,diet-engine-architecture.es.md,scaling-plan.md}`, `docs/adr/ADR-005-gemini-hybrid-engine.md`, `docs/architecture/adr/ADR-002-supabase.md`, `docs/runbooks/deploy.md`, `docs/guides/testing.md`, `docs/product/MVP_SCOPE.md`, `docs/CHANGELOG.md`, `docs/CONTRIBUTING*.md`, `docs/security/Security-Audit-Prompt.md`. README.es.md links to `overview.es.md` (still NestJS).
- [x] 0.6 Commit cutover baseline: stage replacement code + staged `apps/api` deletion together; message: `feat!: consolidate Next.js full-stack migration (cutover)` - 9 commits cbc9df6..0f89396 (local only, not pushed); original single commit kept at branch backup/cutover-87cd740

## Phase 1 — Shared contracts (contracts)

- [x] 1.1 Add Zod schemas to `packages/shared` for profile, allergens, plan, shopping-list contracts (RED first: schema validation tests) - profile, allergens, username availability, shopping-list toggle/add and the error envelope are in `packages/shared/src/schemas.ts` (12 tests, commit a2eece0). Plan contracts are DEFERRED to Phase 3/4 because the plan RPC reshapes them.
- [~] 1.2 Unify enum casing to lowercase; update `UpsertProfileSchema` to shared schemas; onboarding/settings submit shared values (RED→GREEN) - commit d61ae95. The onboarding/settings forms already used the shared enums; their form schemas stay local because they carry i18n error keys. PARTIAL against the "no competing profile definition" scenario: `ProfileRow` in `UserContext` (raw snake_case row) and the `profileData as any` in `generate-week` remain until the generated Database types (task 2.4).
- [~] 1.3 Align endpoint paths: move onboarding/settings calls `/api/me/*` → `/api/profile/*`; add response-shape fixes (`{ allergens }` destructuring) - commits 74630ab, b30be4d. PARTIAL: `AiDietGenerator` preview (`/api/diet-engine/generate-ai`) is a known unresolved path awaiting the keep/remove product decision; settings still checks username availability through the Supabase RPC `is_username_available` (task 2.2).
- [x] 1.4 Unify error envelope `{ error: string }` across routes; `apiClient` reads `error` - every handler already returned `{ error }`; the clients read `message`. Fixed in apiClient, onboarding, settings and plans (commit b30be4d). Validation 400s keep the additive `details` field.

## Phase 2 — Schema and types (contracts, platform)

- [ ] 2.1 Write migrations: `exercise_plans` table (+RLS), `profiles.username/language/health_conditions`, `ingredients.name_en`, `shopping_list_items.custom_name`
- [ ] 2.2 Write migrations/RPCs: `get_email_by_username`, `is_username_available`, `get_user_recommendations`
- [ ] 2.3 Defensive migration/read mapping for any uppercase enum data in hosted DB (verify hosted state first)
- [ ] 2.4 Generate Supabase `Database` types; remove `SupabaseClient<any>` casts in route handlers; typecheck green

## Phase 3 — Nutrition safety (nutrition-safety)

- [ ] 3.1 RED integration test: generation excludes ingredients linked via `ingredient_allergens` for restricted users
- [ ] 3.2 GREEN: fix `generate-week` to read `profile_allergens` (profile-joined) and filter via join table
- [ ] 3.3 Postgres RPC `create_weekly_plan` (atomic plan/days/meals/items insert); route calls RPC once; partial-failure test
- [ ] 3.4 Enforce `MACRO_TOLERANCE` at persistence; out-of-tolerance generation fails loudly

## Phase 4 — Planning honesty (planning)

- [ ] 4.1 Persist linked exercise plan in `generate-week` (same RPC or sibling transaction); `GET /api/exercise-plans/[dietPlanId]` returns it; test
- [ ] 4.2 Implement deterministic meal/day regeneration honoring `is_locked` (engine-driven); tests; OR hide UI controls if budget exceeded (record decision)
- [ ] 4.3 Fix active-plan limit: count only `status = active`; test archived-plan scenario
- [ ] 4.4 Harden `lock-meal`: verify meal belongs to the specified plan

## Phase 5 — Data layer and UX boundaries (contracts, platform)

- [ ] 5.1 Server data functions (`lib/server/`); dashboard and plan pages stop self-fetching; remove Bearer self-fetch path
- [ ] 5.2 Add `error.tsx` and `not-found.tsx` app boundaries
- [ ] 5.3 Remove plans/exercise/shopping localStorage caching from context providers; single server-derived source
- [ ] 5.4 Final verify: full suite + build + audit; update tasks/progress artifacts

## Review Workload Forecast

- Phase 0 cutover commit: large by nature (pre-existing migration work; not new authored lines beyond hygiene fixes)
- Phases 1–5: each slice estimated 150–400 changed lines including tests
- `Chained PRs recommended: Yes` if slices exceed budget → resolve `chain_strategy` at that point (`stacked-to-main` default)
- `Decision needed before apply: Yes` — user approval of this plan (interactive stop, per gate)

## Dependencies

- Phase 2 depends on Phase 0 (clean baseline)
- Phase 3 depends on Phase 1 (schemas) and Phase 2 (migrations/types)
- Phase 4 depends on Phase 3 (RPC pattern)
- Phase 5 is independent of 3–4 but sequenced last to minimize churn

## Phase 1 decisions (2026-10-15)

- **Verified evidence.** The old NestJS DTO used the shared lowercase enums (`git show 24285a8:apps/api/src/modules/profiles/dto/index.ts`), so onboarding worked against NestJS; the NEW handler validated uppercase enums and would have rejected what the UI sends. Fixed by validating with the shared schema.
- **Diet patterns.** `KETO`, `MEDITERRANEAN`, `PALEO` and `EXTRA_ACTIVE` were accepted by the route but exist neither in the shared enums nor in the database CHECK constraints; the UI never offered them. Dropped.
- **List and availability responses stay wrapped** (`{ allergens }`, `{ available }`): extensible and covered by shared schemas. NestJS returned bare values, so the clients were fixed instead.
- **Shopping-list toggle.** NestJS and the UI used `{ itemId, isChecked }` (set state). The migrated handler flipped by `ingredientName`. Changed to the old contract: names can repeat, custom items have no ingredient, and setting state is idempotent.
- **Assumption.** The hosted database matches the migration CHECK constraints (lowercase enums). Not verified remotely; task 2.3 owns that.
- **Not covered by unit tests.** Persistence against the real Supabase (CHECK constraints, missing columns `username`, `language`, `custom_name`) needs a manual run of onboarding and settings. Phase 1 is NOT closed until that run passes.
- **Delivery hazard.** Do not merge to `main` before that run: `vercel.json` always builds, so `main` presumably deploys production.
- **Native review.** Skipped by the user for the Phase 0 cutover range and for Phase 1 (`review_due: high_risk`, `lens_context_budget_exceeded`). Slice 0a53b1c was approved; the routes slice 02872f2 was left unresolved. Phase 1 relies on an independent verifier instead.
- **Checked, no change needed.** `GET /api/shopping-list/[planId]` already returns `id`, `isChecked` and `isCustom` per item (now asserted in the spec), every client HTTP method is exported by its route, and the errors thrown by `lib/google-drive.ts` carry Google's message or the HTTP status, not the request URL.
- **Risk.** Item 3 (internal contract changes): shopping-list toggle body, `apiClient` error parsing and legacy-branch removal, and the shared `Profile`/`Allergen` type shapes (`createdAt` is a string, `description` is nullable).

## Log

### L2 - 2026-10-15 - requirement change from the user (verbatim, Spanish)

> si autorizo pero no compliquemos mas el funcionamiento objetivo final de esta aplicacion a donde va termiar es;
>
> Quiero que esta aplicación, su objetivo final sea la misma idea, pero diferente arquitectura.
> Quiero que el usuario se lo vea, se registre y llegue a todo el login como está, tal cual. ¿Qué quiero luego? Quiero que un agente sea quien genere este plan nutritivo según los datos del cliente.
>
> ¿Cómo va a recibir los datos? Los datos los va a recibir mediante input. Al agente le llegarán, mediante las pantallas de información que selecciona el cliente, una ficha de ese cliente.
>
> El agente cargará la ficha de cliente y, según sus datos, su peso, su alérgeno y su información, generará dietas según la selección de cliente. Generará plan nutritivo y plan de ejercicio. Esa es la idea, basándose en documentos oficiales.
>
> Entonces, ¿qué lleva esto? El agente tiene que tener un rack y debe tener una documentación fiable. El agente debe tener herramientas con las que pueda consultar en internet y en documentaciones oficiales. Debe hacer una búsqueda de información sobre APIs y sobre los mercados en España, porque le vamos a dar al cliente una nutrición basada en los productos vendidos en los mercados de España.

Effect on this plan: Phases 3-4 (deterministic engine work: allergen query, atomic plan RPC, regeneration) are PAUSED until the agent design is decided; Phase 2 (exercise_plans, generated types), Phase 5, the monorepo flatten and the redesign still apply. The AI preview question (generate-ai) is subsumed by the agent screen. Open question for the user: deterministic guardrails around the agent (recommended) or free generation.

### L3 - 2026-10-15 - hosted database (project rbsokakrtclnmralymna)

- Applied with the user's explicit authorization: migration 005 (drop the signup profile trigger). Verified: trigger and function gone, 3 users and 3 profiles unchanged.
- RLS check (read-only): profiles has INSERT/SELECT/UPDATE for own rows, so onboarding can create the profile. shopping_lists and shopping_list_items have RLS on and NO policies, so the whole shopping list is denied for user sessions. Fix prepared as 006_shopping_list_rls_policies.sql, NOT applied (awaiting authorization).
