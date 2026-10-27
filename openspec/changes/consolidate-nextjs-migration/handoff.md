# Handoff — consolidate-nextjs-migration (2026-09-10)

Session paused before `sdd-apply`. Planning chain is complete and approved-pending.

## Where we stopped

- SDD preflight resolved: `auto` execution, `openspec` store (Engram not injected that session), `ask-on-risk` delivery, 400-line budget, strict TDD active (`pnpm test`, Vitest).
- All planning artifacts written and gated: `explore.md`, `proposal.md`, 4 delta specs (`contracts`, `nutrition-safety`, `planning`, `platform`), `design.md` (8 ADRs), `tasks.md` (6 phases, 25 tasks).
- **Pending user decisions before apply:**
  1. Approve the plan (spec + design + phases) to start `sdd-apply`.
  2. Whether to run Phase 0 (cutover: commit baseline, clean transient files, fix Vitest alias, upgrade `next` past critical RCE CVE, archive Railway-era docs) alone first — recommended.
  3. Execution mode note: SDD subagents were blocked by provider usage quota that session; fallback was inline execution. Re-check quota before delegating phases.

## Key confirmed decisions

- Target architecture: Next.js modular monolith + TypeScript + Supabase (NestJS and Python migration rejected as targets; Python only as future isolated worker behind explicit triggers).
- Working tree holds the interrupted migration: staged `apps/api` deletion + untracked Next.js replacement. Do not commit partially; Phase 0 performs the labeled cutover commit.
- Release blockers: contract drift (`/api/me/*` paths, uppercase enums), broken allergen enforcement (`user_allergens`/`allergen_ids` vs `profile_allergens` + join table), missing migrations, no-op regeneration, discarded exercise plan.
- Verified health: build passes, 94/94 unit tests, but 2 typecheck errors, 127 vulnerabilities (4 critical), stale Vitest alias, non-isolated E2E.

## How to resume

Ask the orchestrator to continue change `consolidate-nextjs-migration` (e.g. "continúa el cambio consolidate-nextjs-migration"). It should: read this handoff + tasks.md, confirm the pending apply decisions with the user, then launch Phase 0.
