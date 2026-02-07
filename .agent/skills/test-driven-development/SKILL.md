---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code.
---

# Test-Driven Development (TDD)

## The Iron Law

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**
If you wrote code first, delete it. Start over.

## The Cycle: Red-Green-Refactor

1. **RED**: Write one minimal failing test.
2. **Verify RED**: Run the test and confirm it fails for the right reason.
3. **GREEN**: Write the simplest code to make the test pass.
4. **Verify GREEN**: Confirm passing and ensure no regressions.
5. **REFACTOR**: Clean up code and names while keeping tests green.

## Why Order Matters

- Tests written after code often pass immediately, proving nothing.
- Test-first forces behavioral design and edge case discovery.
- Automated tests are systematic; manual tests are ad-hoc and brittle.

## Red Flags - STOP and Start Over

- Code before test.
- Test passes immediately.
- "I'll test after" or "Manually tested".
- "Too simple to test".

## Bug Fixes

Never fix a bug without first writing a test that reproduces it. The test proves the fix and prevents future regressions.
