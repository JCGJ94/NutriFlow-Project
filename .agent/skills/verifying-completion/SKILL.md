---
name: verifying-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs. Requires running verification commands and confirming output.
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty. 
**Core principle: Evidence before claims, always.**

## The Iron Law

**NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**

## The Gate Function

1. **IDENTIFY**: What command proves this claim?
2. **RUN**: Execute the FULL command.
3. **READ**: Check exit code and failure count.
4. **VERIFY**: Does output confirm the claim?
5. **CLAIM**: State claim WITH evidence.

## Common Failures & Red Flags

- Using "should", "probably", "seems to".
- Expressing satisfaction ("Great!", "Done!") before verification.
- Trusting agent success reports without checks.
- Relying on partial or old verification.

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "Confidence check" | Confidence ≠ evidence |
| "I'm tired" | Not an excuse to skip logs |

## Verification Checklist

- [ ] Every new function has a test.
- [ ] Watched test fail before implementing (TDD).
- [ ] All tests pass.
- [ ] Output is pristine (no warnings/errors).
- [ ] Edge cases are covered.
