---
name: finishing-a-development-branch
description: Use when completing development work to verify tests, present integration options, and clean up the environment.
---

# Finishing a Development Branch

Guide the completion of work: Verify tests -> Present options -> Execute -> Clean.

## Steps

1. **Verify Tests**: Run the full test suite. Stop if anything fails.
2. **Determine Base Branch**: Usually `main` or `master`.
3. **Present 4 Options**:
   - Merge locally to base.
   - Push and create a Pull Request (PR).
   - Keep branch as is (handle later).
   - Discard (permanent deletion).
4. **Execute Choice**:
   - Merge: Pull base -> Merge branch -> Verify -> Delete branch.
   - PR: Push -> Create PR (`gh pr create`) -> Clean worktree.
   - Discard: Confirm 'discard' -> Delete branch.
5. **Clean Worktree**: If finished/discarded, `git worktree remove <path>`.

## Rules

- Never proceed with failing tests.
- Always offer exactly 4 options.
- No force-push without explicit request.
- Merge only after final test verification.
