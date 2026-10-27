# Spec delta — platform (repository, config, deployment coherence)

## ADDED Requirements

### Requirement: Clean-checkout reproducibility

A clean clone SHALL install, typecheck, lint, test, and build successfully using only checked-in configuration; no script or alias SHALL reference deleted workspaces (`apps/api`, `apps/mcp-railway`).

#### Scenario: Fresh environment

- **WHEN** a new environment runs `pnpm install && pnpm test && pnpm build`
- **THEN** all steps succeed without manual fixes

### Requirement: Single architecture documentation

Repository documentation SHALL describe exactly one architecture: Next.js full-stack + Supabase on Vercel; Railway-era, NotebookLM-era, and split-backend documentation SHALL be archived or removed.

#### Scenario: No contradicting deploy stories

- **WHEN** a contributor reads README and docs to deploy
- **THEN** there is one procedure and no `railway.toml` implying a second backend

### Requirement: Security patch currency at cutover

At the consolidation commit, the `next` package SHALL be upgraded past the known critical advisory affecting `16.1.4`, and the consolidation commit SHALL be accompanied by an audit run with critical/high production advisories triaged or fixed.

#### Scenario: Vulnerability posture recorded

- **WHEN** `pnpm audit` runs after the cutover
- **THEN** no unpatched critical production advisory remains without a recorded decision

### Requirement: Repository hygiene

Transient artifacts (interrupted-write `*.tmp.*` files, stray `nul` file, environment-specific `.mcp.json`) SHALL be removed or ignored via `.gitignore`, and the migration cutover SHALL be committed as a labeled baseline commit.

#### Scenario: Working tree is safe to build on

- **WHEN** the consolidation slice completes
- **THEN** `git status` shows no stale deletion/replacement asymmetry and no transient files
