---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans. Creates isolated workspaces with safety verification.
---

# Using Git Worktrees

## Overview

Isolated workspaces allow working on multiple branches without switching.
**Core Principle: Systematic directory selection + safety verification.**

## Directory Selection Process

1. **Check Existing**: Look for `.worktrees/` (preferred) or `worktrees/`.
2. **Check CLAUDE.md**: Search for "worktree directory" preference.
3. **Ask User**: If none, ask where to create.

## Safety Verification

**MUST verify directory is ignored before creating worktree:**
```bash
git check-ignore -q .worktrees
```
If NOT ignored:
1. Add to `.gitignore`.
2. Commit the change.
3. Proceed.

## Creation Steps

1. Detect project name.
2. `git worktree add <path> -b <branch>`.
3. `cd <path>`.
4. Run project setup (npm install, pip install, etc.).
5. **Verify Clean Baseline**: Run tests to ensure worktree starts clean.

## Common Mistakes

- Skipping ignore verification (pollutes repo).
- Proceeding with failing tests in a fresh worktree.
- Hardcoding setup commands.
