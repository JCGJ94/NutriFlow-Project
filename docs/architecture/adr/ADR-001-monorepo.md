# ADR-001: Turborepo Monorepo Structure

**Status:** Accepted  
**Date:** 2026-01-15  
**Decision by:** Development Team

## Context

NutriFlow requires a full-stack architecture with:
- Frontend (Next.js)
- Backend API (Nest.js)
- Shared types and utilities

We needed to decide on the repository structure: monorepo vs multi-repo.

## Decision

Use **Turborepo** as the monorepo orchestration tool with **pnpm workspaces**.

### Rationale

1. **Code Sharing**: Shared types between frontend and backend eliminate drift
2. **Atomic Changes**: Cross-package changes are committed together
3. **Build Caching**: Turborepo's caching speeds up CI/CD
4. **Single Source of Truth**: One place for linting, formatting, TypeScript config

## Structure

```
nutriflow/
├── apps/
│   ├── api/      # Nest.js backend
│   └── web/      # Next.js frontend
├── packages/
│   └── shared/   # Types, enums, validators
└── turbo.json
```

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Multi-repo | Clear boundaries | Harder to share code |
| Nx | Feature-rich | Heavier setup |
| Lerna | Established | Less maintained |

## Consequences

### Positive
- Single `pnpm install` for all dependencies
- Shared TypeScript types with `@nutriflow/shared`
- Fast incremental builds

### Negative
- All developers need full codebase
- Initial learning curve for Turborepo

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
