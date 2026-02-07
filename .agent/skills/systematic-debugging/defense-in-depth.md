# Defense in Depth

Implement validation and checks at multiple layers to prevent the same bug from recurring and to catch similar issues early.

## Strategy

1.  **Input Validation**: Validate data at the entry point (API, UI Form).
2.  **Type Safety**: Use TypeScript interfaces and types to enforce data structure.
3.  **Domain Invariants**: Check business logic rules within the service layer.
4.  **Persistence Safety**: Use database constraints (Foreign keys, NOT NULL, Check constraints).
5.  **Logging**: Add tactical logging at boundaries to catch silent failures.

**Goal**: Even if one layer fails, the next one should catch the error before it causes corruption.
