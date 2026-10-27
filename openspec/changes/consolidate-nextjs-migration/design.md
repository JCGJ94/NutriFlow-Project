# Design — consolidate-nextjs-migration

Answers the proposal within the four delta specs. Decisions are ADR-level; each names the alternative rejected and why.

## D1. Architecture: Next.js modular monolith (confirmed)

**Decision:** all API logic lives in Next.js Route Handlers; Supabase (Postgres + auth + RLS + storage) is the backend platform; Vercel is the only application runtime.

- **Rejected — restore NestJS (HEAD):** would discard the ported-and-tested replacement, re-duplicate auth/CORS/types across two runtimes, and re-add a second deploy target to solve a problem (long jobs) the product does not have today.
- **Rejected — Python backend/rewrite:** no Python-shaped workload exists (deterministic arithmetic + HTTP LLM calls). Deferred behind explicit triggers (LP/ILP optimization, large-scale RAG ingestion, longitudinal modeling) as an isolated worker with a versioned JSON/queue contract.
- **Tradeoff accepted:** serverless function limits (~60s) constrain generation latency; handled by keeping generation synchronous for now and introducing async jobs only when a real workload exceeds the limit.

## D2. Contract authority: Zod in `packages/shared` + generated DB types

**Decision:** shared Zod schemas are the single executable contract; Supabase types are generated from migrations (`supabase gen types`) and imported everywhere.

- Route schemas compose shared schemas instead of redefining shapes; the four competing `Profile` definitions collapse into one.
- Typecheck becomes the drift detector: querying a nonexistent column fails CI.
- **Tradeoff:** codegen step added to the workflow (run after migrations; documented in CONTRIBUTING).

## D3. Allergen enforcement: fix the query path, prove it with an integration test

**Decision:** generation reads restrictions via `profile_allergens` (through the user's profile) and filters ingredients via the `ingredient_allergens` join table; a seeded integration test (Vitest, local/supabase-test or mocked Postgres per existing test conventions) proves exclusion before merge.

- **Alternative rejected — denormalize `allergen_ids` onto ingredients:** contradicts the normalized schema, invites drift again.
- **Tradeoff:** one extra join per generation run; negligible at catalog size.

## D4. Atomicity: Postgres RPC for plan creation

**Decision:** a single Postgres function (transaction) inserts plan → days → meals → items; the route calls it once. Application-level sequential inserts are removed.

- **Alternative rejected — app-level transaction across multiple clients:** Supabase server clients pool per-request; no cross-statement transaction without RPC.
- **Tradeoff:** business logic in SQL for this one path; acceptable because it is a bounded, testable write path.

## D5. Server data access: functions, not self-fetch

**Decision:** Server Components import server data functions (`lib/server/*.ts`) that create the request-scoped Supabase client from cookies; Route Handlers serve client components only. `apiClient` remains a client-only utility.

- Fixes the broken Bearer-header path and removes the internal HTTP hop.
- **Tradeoff:** two data-access idioms (server functions vs fetch) — documented boundary, enforced by lint convention (no `apiClient` imports from server components).

## D6. Feature honesty

- Regeneration: implement deterministic regeneration via the existing selector (`regenerateMeal`/`regenerateDay` call the engine with the current plan state, honoring `is_locked`). If the first slice overruns budget, hide the UI controls instead and record the follow-up.
- Exercise linkage: `generate-week` persists the exercise plan via the same RPC pattern (D4) in the same request.
- Active-plan limit: filter `status = active` in the count query.

## D7. Consolidation commit strategy

**Decision:** one labeled cutover commit (cleanup + `apps/api` deletion + untracked replacement + config/docs alignment), then small slices per contract group. The cutover commit is inherently large (pre-existing work); subsequent slices stay under the 400-line review budget, chaining per `ask-on-risk`.

## D8. Security posture at cutover

- Upgrade `next` past the critical advisory in the cutover commit.
- Run `pnpm audit`; record decisions for remaining high advisories in the change folder.
- Docs: single architecture story; archive Railway/NotebookLM-era documents under `docs/archive/`.

## Sequencing

Slice order maximizes safety per line changed:

1. Cutover + hygiene + `next` upgrade (platform spec)
2. Shared contracts + enum unification + endpoint alignment (contracts spec)
3. Migrations + generated types (contracts/platform)
4. Allergen enforcement + atomic plans + tolerance validation (nutrition-safety)
5. Exercise linkage + regeneration + plan limit (planning)
6. Server data layer + error boundaries + localStorage removal (contracts/platform follow-through)

Each slice: RED (failing test) → GREEN → typecheck/lint → commit.
