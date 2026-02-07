---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code.
---

# Writing Plans

## Overview

Write comprehensive implementation plans. Document everything: which files to touch, code snippets, testing, and how to verify. Break the plan into bite-sized tasks.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Bite-Sized Task Granularity

Each step is one action (2-5 minutes):
1. Write the failing test.
2. Run it to verify failure.
3. Implement minimal code.
4. Run tests to verify pass.
5. Commit.

## Plan Document Header

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [Key technologies/libraries]
```

## Task Structure

Include:
- **Files**: Create/Modify/Test paths.
- **Steps**: Explicit TDD steps (Write test -> Run -> Implement -> Run -> Commit).
- **Code**: Provide the actual code or clear patterns.

## Execution Handoff

After saving, offer:
1. **Subagent-Driven**: Fast iteration in current session.
2. **Parallel Session**: Separate session for batch execution.
