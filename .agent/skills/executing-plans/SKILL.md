---
name: executing-plans
description: Use to execute implementation plans in batches with checkpoints for architect review.
---

# Executing Plans

Execute implementation plans in batch sessions with checkpoints.

**Core Principle: Batch execution -> Checkpoint -> Review.**

## The 5 Phases

1. **Plan Review**: Read plan, identify concerns/questions. Raise with partner.
2. **Batch Execution**: Default batch size = 3 tasks.
   - For each: Mark `in_progress` -> Follow steps -> Verify -> Mark `completed`.
3. **Checkpoint Report**: Show implementation results and verification logs.
4. **Partner Feedback**: Apply changes if needed.
5. **Finalization**: Call `superpowers:finishing-a-development-branch` when all tasks are done.

## Rules

- Follow plan steps EXACTLY.
- Never skip verification.
- Stop and ask for help if blocked or instruction is unclear.
- Never start implementation on main/master without consent.
- Review plan critically BEFORE starting.
