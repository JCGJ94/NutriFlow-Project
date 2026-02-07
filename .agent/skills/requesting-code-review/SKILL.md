---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements.
---

# Requesting Code Review

Dispatch a reviewer to catch issues before they cascade.

## When to Request

- After each task in subagent-driven development.
- After implementing a major feature.
- Before merging to the main branch.

## How to Request

1. **Identify Commits**: Get the base and head git SHAs.
2. **Dispatch Reviewer**: Provide:
   - What was implemented.
   - Requirements/Plan source.
   - Commits range.
   - Brief description of changes.

## Feedback Evaluation

| Issue Level | Action |
|-------------|--------|
| **Critical** | Fix immediately. |
| **Important** | Fix before proceeding. |
| **Minor** | Note for later or fix if quick. |

## Red Flags

- Skipping review because "it's simple".
- Ignoring Critical/Important findings.
- Implementation doesn't match the committed plan.
