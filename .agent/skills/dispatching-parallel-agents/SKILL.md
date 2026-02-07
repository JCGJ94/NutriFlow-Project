---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies.
---

# Dispatching Parallel Agents

Investigate multiple independent failures or tasks concurrently to save time.

## When to Use

- 3+ failing test files with different root causes.
- Multiple independent broken subsystems.
- No shared state between investigations.
- No sequential dependencies.

## The Pattern

1. **Identify Domains**: Group failures by independence (e.g., Auth tests vs List tests).
2. **Create Focused Tasks**: One agent per domain with specific scope and expected output.
3. **Dispatch**: Run `Task(...)` for each concurrently.
4. **Review & Integrate**: Verify fixes don't conflict and the full suite passes.

## Rules

- Don't use if fixes might overlap.
- Don't use for exploratory debugging (when you don't know what's wrong).
- Avoid if agents would edit same files simultaneously.

## Success Criteria

- All domains identified.
- Context provided for each subagent.
- Safe integration of all changes.
