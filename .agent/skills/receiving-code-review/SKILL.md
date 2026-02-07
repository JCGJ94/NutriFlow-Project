---
name: receiving-code-review
description: Use when receiving code review comments, before implementing suggestions. Ensure technical rigor and verification.
---

# Receiving Code Review

Review feedback requires technical evaluation, not emotional performance.

## The Response Pattern

1. **READ**: Complete the feedback without reacting.
2. **UNDERSTAND**: Rephrase the requirement or ask for clarification.
3. **VERIFY**: Check against the codebase reality.
4. **EVALUATE**: Is it technically sound for this project?
5. **IMPLEMENT**: Fix one item at a time and test each.

## Forbidden Responses

- **NO performative agreement**: "You're absolutely right!", "Great point!".
- **NO blind implementation**: Verify before changing code.

## Handling Conflict

If a suggestion seems incorrect or violates YAGNI:
- Reject with technical reasoning.
- Reference code or tests.
- Do not be defensive; be factual.

## Verification

If a reviewer suggests a "proper" feature:
- Check if it's actually used.
- If not: "This is not used; proposing removal (YAGNI)".
- If yes: Implement correctly.
