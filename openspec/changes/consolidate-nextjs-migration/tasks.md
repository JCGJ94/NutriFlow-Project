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

- [ ] 1.1 Add Zod schemas to `packages/shared` for profile, allergens, plan, shopping-list contracts (RED first: schema validation tests)
- [ ] 1.2 Unify enum casing to lowercase; update `UpsertProfileSchema` to shared schemas; onboarding/settings submit shared values (RED→GREEN)
- [ ] 1.3 Align endpoint paths: move onboarding/settings calls `/api/me/*` → `/api/profile/*`; add response-shape fixes (`{ allergens }` destructuring)
- [ ] 1.4 Unify error envelope `{ error: string }` across routes; `apiClient` reads `error`

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
