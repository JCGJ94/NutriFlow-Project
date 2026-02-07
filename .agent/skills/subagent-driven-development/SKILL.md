---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session. Dispatches agents for implementation and two-stage review.
---

# Subagent-Driven Development

Execute a plan by dispatching fresh subagents per task with a two-stage review: Spec Compliance first, then Code Quality.

## Workflow

1. **Extract Tasks**: Read plan and create a checklist of tasks.
2. **Dispatch Implementer**: Give the subagent the specific task text and context.
3. **Answer Questions**: If the subagent has doubts, clarify before they start.
4. **Implementer Completion**: Subagent implements, tests, and commits.
5. **Spec Review**: Dispatch a reviewer to confirm code matches the plan.
6. **Quality Review**: Dispatch a second reviewer to check architecture and quality.
7. **Fix & Repeat**: Implementer fixes any review issues before moving to the next task.

## Rules

- Fresh context per task (avoids context pollution).
- **MANDATORY**: Two-stage review after each task.
- Subagents MUST follow TDD.
- Don't move to the next task until the current one is approved.

## Advantages

- Faster iteration without context pollution.
- High quality through independent review loops.
- Catch errors early before they cascade.
