# NutriFlow Testing Guide

# NutriFlow Testing Guide

This project follows a balanced testing strategy:
- **Unit Testing**: Vitest (Backend)
- **E2E Testing**: Playwright (Frontend + Backend Integration)

## 1. Backend Unit Tests (Vitest)

Unit tests for business logic, especially the `DietEngine`.

### Run tests
```bash
pnpm --filter @nutriflow/api test
```

### Location
- `apps/api/src/**/*.spec.ts`

### Example (BmrCalculator)
```typescript
it('should calculate BMR correctly', () => {
  const result = calculator.calculateBmr(profile);
  expect(result.bmr).toBe(1780);
});
```

## 2. E2E Tests (Playwright)

End-to-end tests simulating real user interactions in the browser.

### Install browsers (first time)
```bash
pnpm exec playwright install
```

### Run tests (Headless)
IMPORTANT: Ensure your app is NOT running on port 3000, Playwright will start it (or use `webServer` config).
Or if it's already running:
```bash
pnpm exec playwright test
```

### Run with UI (Recommended for development)
```bash
pnpm exec playwright test --ui
```

### Flow Coverage
1. **Auth Flow**: Registration and login (`e2e/auth.spec.ts`)
2. **Plan Flow**: Weekly plan generation (`e2e/plan-generation.spec.ts`)

## 3. Testing Subagent Instructions

To continue expanding the test suite, follow this pattern:

1. **Identify critical logic**: Prioritize complex business logic (e.g., algorithms) for Unit Tests.
2. **Identify critical flows**: Prioritize user flows (e.g., checkout, settings) for E2E.
3. **Create file**:
   - Unit: `servicename.spec.ts` alongside the source file.
   - E2E: `e2e/feature-name.spec.ts`.

### Recommended Upcoming Tests
- [ ] Unit: `MacrosCalculator` (verify 30/40/30 distribution)
- [ ] Unit: `AllergenRule` (verify correct filtering)
- [ ] E2E: `ShoppingList` (verify items and checked state)
