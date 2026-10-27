# Explore — consolidate-nextjs-migration

Consolidated, evidence-based exploration of the interrupted NestJS → Next.js full-stack migration. Sources: repository archaeology, static architecture audit, and executable verification audit (2026-09-10, this working tree).

## 1. Current state

- `HEAD` (main and `feat/nextjs-full-stack-migration`, both at `24285a8`) contains the complete NestJS backend in `apps/api`.
- The working tree stages deletion of `apps/api` (86 files, 6,004 lines) and adds an untracked Next.js replacement: 26 Route Handlers under `apps/web/src/app/api/**` plus domain libraries under `apps/web/src/lib/{auth,diet-engine,exercise-engine,llm,plans}` and their tests (94 tests, all passing).
- The migration was executed in numbered slices (see `apps/web/src/lib/apiClient.ts` and `apps/web/next.config.js` comments): Slice 2 profiles/ingredients, Slice 3 plans/exercise, Slice 4 shopping/admin, Slice 5 RAG, Slice 6 Railway proxy removal.
- Work stopped between Slice 6 and final verification: 7 interrupted-write temp files (`*.tmp.44556.*`), an accidental `nul` file, `.mcp.json` untracked, stale `railway.toml`, stale Vitest alias into deleted `apps/api`, and documentation describing three incompatible architectures.
- Committing the current index as-is would delete the backend without including the replacement. Highest preservation risk.

## 2. Verified health

- `pnpm build` passes (2/2 tasks, 27 pages). `pnpm test` passes 94/94. Lint passes with 0 errors / 244 warnings (mostly `no-explicit-any`).
- Fails: web typecheck (2 TS6133 errors in migrated tests); Vitest alias breaks clean checkouts; `pnpm audit` reports 127 vulnerabilities (4 critical, incl. `next@16.1.4` unauthenticated RCE); 33 outdated dependencies.
- E2E suite (57 Playwright tests) is not isolated: real Supabase credentials, real account creation. Not a delivery gate.

## 3. Contract drift (release blockers)

1. UI calls `/api/me/*`; handlers exist at `/api/profile/*` → onboarding/settings persistence is structurally broken.
2. `UpsertProfileSchema` expects UPPERCASE enums; shared package and SQL constraints use lowercase → valid onboarding payloads rejected.
3. Generation queries `user_allergens`/`allergen_ids`; schema uses `profile_allergens` + `ingredient_allergens` join table → allergen filtering silently bypassed (food-safety blocker).
4. Missing migrations for `exercise_plans`, `profiles.username/language/health_conditions`, `ingredients.name_en`, `shopping_list_items.custom_name`, and RPCs (`get_email_by_username`, `is_username_available`, `get_user_recommendations`).
5. `packages/shared` has no Zod schemas; four incompatible `Profile` definitions exist (shared, diet-engine types, UserContext, route schema).

## 4. Feature honesty gaps

- `regenerate-meal` / `regenerate-day` are no-ops presented as working UI actions.
- `generate-week` calls `generateExercisePlan()` and discards the result; UI polls `/api/exercise-plans/[dietPlanId]` and finds nothing.
- Plan-limit counts archived plans; no `status = active` filter.
- Server Components self-fetch local Route Handlers with a Bearer header the cookie-based server client ignores → likely 401s; also an unnecessary internal HTTP hop.
- Plan creation performs sequential non-transactional inserts (partial-plan risk).
- RAG exists (embeddings, search, Drive sync) but is disconnected from any product flow; LLM translation lacks Zod validation and can corrupt plan data.

## 5. Architecture decision (confirmed with the user)

- Target: **modular monolith in Next.js + TypeScript with Supabase**. NestJS restoration and full Python migration rejected as targets.
- Python deferred behind explicit triggers (LP/ILP diet optimization, large-scale RAG ingestion, statistical personalization) as an isolated worker.
- Goal: fast, functional, scalable app.

## 6. Constraints and non-goals observed

- Keep Vercel + Supabase deployment (implied by current code: `vercel.json`, no Railway runtime).
- Keep the deterministic engine as the nutritional authority; LLM is presentation-only.
- Preserve RLS as the security boundary; app-level guards complement it.

## 7. Key Learnings

1. The repository holds an interrupted uncommitted migration where the staged backend deletion is not yet paired with its untracked Next.js replacement.
2. Unit tests and builds pass but contract drift makes onboarding persistence and allergen filtering structurally broken.
3. The all-Next.js TypeScript monolith with Supabase was explicitly confirmed as the target architecture.
