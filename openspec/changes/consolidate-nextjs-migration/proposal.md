# Proposal — consolidate-nextjs-migration

## Problem statement

NutriFlow is frozen mid-migration: the committed state contains a NestJS backend that the working tree deletes (staged), while its Next.js replacement (26 Route Handlers + domain engines + 94 tests) is entirely untracked. The migration is ~80% complete but was cut before final integration, and committing today would destroy the backend without shipping the replacement. Beyond the git state, the working tree contains contract drift that breaks core product flows (onboarding persistence, allergen filtering) despite a green build and green unit tests. The user needs to resume development on a **fast, functional, scalable** app with a confirmed target architecture: a modular monolith in Next.js + TypeScript with Supabase.

## Product outcome

A single coherent codebase where:

- All API logic lives in Next.js Route Handlers backed by shared, validated contracts.
- Onboarding, profile, plan generation, exercise plans, and shopping lists work end-to-end against the checked-in schema.
- Allergen filtering is enforced end-to-end (food-safety critical).
- Features shown in the UI are real (no no-op regeneration), and features that are prototypes are labeled or hidden.
- The repository is reproducible: migrations match code, clean checkouts build and test, documentation describes the actual architecture.

## Scope (first slice)

1. **Consolidate the working tree**: commit the migration state as the new baseline (after cleanup), remove interrupted-write artifacts, fix the stale Vitest alias, archive contradicted docs (Railway/NotebookLM era), upgrade `next` past the critical RCE advisory.
2. **Contract coherence**: unify enum casing, align endpoint paths (`/api/me/*` → `/api/profile/*` or documented aliases), add missing migrations, adopt Zod schemas in `packages/shared`, generate Supabase types.
3. **Safety-critical behavior**: restore allergen filtering end-to-end; make plan creation transactional; validate nutritional output at persistence.
4. **Feature honesty**: implement or disable meal/day regeneration; persist the linked exercise plan in `generate-week`; fix the active-plan limit.
5. **Data layer fixes**: Server Components read via server data functions (no self-fetch); add `error.tsx`/`not-found.tsx`; remove localStorage as app cache.

## Non-goals

- No Python migration and no Python worker (deferred behind explicit triggers: LP/ILP optimization, large-scale RAG ingestion, statistical personalization).
- No new features beyond closing the migration (no new RAG product integration, no AI-generated macros, no health-condition clinical rules — captured as follow-ups).
- No E2E isolation rework beyond wiring what exists into CI (dedicated change later).
- No UI redesign.

## Implications and impact

- `apps/api` is permanently deleted (recovered from git history if ever needed).
- Deployment story becomes Vercel (web) + Supabase only; `railway.toml` is removed.
- Dependency upgrades include a `next` security release; expect lockfile churn.
- Docs restructure: single English+Spanish architecture story.

## Edge cases considered

- Clean checkout must build/test without `apps/api` (Vitest alias fix).
- Username login RPCs missing from migrations: added before any consumer relies on them.
- Archived plans no longer count toward the active-plan limit.
- Translation/LLM output validated before touching plan data.

## Risks

- Large initial commit (the migration cutover) — mitigated by committing it as the baseline before further changes, keeping later slices reviewable under the 400-line budget.
- Enum unification may surface data written with the old casing in the hosted DB — requires a defensive migration/read mapping.
- Allergen fix touches the generation path — protected by new integration tests written first.

## Delivery strategy

`ask-on-risk` (session preflight). Expected: the cutover commit is large by nature (pre-existing work, not new authored lines); subsequent slices are sized to stay within the 400-line review budget, chaining if needed.
