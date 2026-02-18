# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation restructuring (this file).
- `docs/agent/rules.md` for AI agent operational rules.

### Changed
- Moved architecture documentation to `docs/architecture/`.
- Moved testing guides to `docs/guides/`.

## [1.0.0] - 2026-02-06

### Added
- **Frontend:** Next.js 16.1.4 (Turbopack) + React 19 support.
- **Backend:** NestJS 11.1.9 + Express 5 compatibility.
- **Architecture:** Monorepo structure managed with Turborepo.
- **AI Engine:** Hybrid diet generation engine using Gemini 2.0 Flash + NotebookLM (MCP).

### Changed
- Consolidated `apps/web` and `apps/api` into a unified monorepo.
- Updated authentication flow to use Supabase SSR with RLS.
- Refactored `ExerciseCards` to support bilingual (ES/EN) display.

### Fixed
- TypeScript strictness issues in `exercise-engine.service.ts`.
- CSS `@import` rules compatibility with Next.js 16.
- Fixed "Unauthorized" errors in frontend data fetching (UserContext).

## [0.9.0] - 2026-01-15

### Added
- Initial user profiling flow (BMR, TDEE, Macros).
- Basic connection with Supabase (Auth + DB).
- MVP deployment to Railway.
