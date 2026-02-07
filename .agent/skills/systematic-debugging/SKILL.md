---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Follows a strict four-phase process to find root causes before attempting any code changes.
---

# Systematic Debugging

## Overview
Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle: ALWAYS find root cause before attempting fixes. Symptom fixes are failure.**

Violating the letter of this process is violating the spirit of debugging.

## The Iron Law
**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**
If you haven't completed Phase 1, you cannot propose fixes.

## Cuándo usar este skill
Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

## Flujo de Trabajo (The Four Phases)

1. [ ] **Phase 1: Root Cause Investigation**
   - Read error messages carefully (don't skip past errors).
   - Reproduce consistently.
   - Check recent changes (Git diff, commits).
   - Gather evidence in multi-component systems (instrument boundaries).
   - Trace data flow (backward tracing).
2. [ ] **Phase 2: Pattern Analysis**
   - Find working examples.
   - Compare against references.
   - Identify differences.
   - Understand dependencies.
3. [ ] **Phase 3: Hypothesis and Testing**
   - Form a single hypothesis ("I think X because Y").
   - Test minimally (smallest possible change).
   - Verify before continuing.
4. [ ] **Phase 4: Implementation**
   - Create a failing test case first.
   - Implement a single fix for the root cause.
   - Verify the fix.
   - If 3+ fixes fail: STOP and question the architecture.

## Instrucciones Detalladas

### Phase 1: Root Cause Investigation
BEFORE attempting ANY fix:
- **Read Error Messages Carefully**: Read stack traces completely, note line numbers, file paths.
- **Gather Evidence**: Add diagnostic instrumentation at each component boundary. Log data entry/exit and verify config propagation.

### Red Flags - STOP and Follow Process
If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)
**STOP. Return to Phase 1.**

## Recursos y Técnicas
- `root-cause-tracing.md`: Trace bugs backward through call stack.
- `defense-in-depth.md`: Add validation at multiple layers.
- `condition-based-waiting.md`: Replace arbitrary timeouts.

## Referencia Rápida
| Phase | Key Activities | Success Criteria |
| :--- | :--- | :--- |
| 1. Root Cause | Read errors, reproduce, gather evidence | Understand WHAT and WHY |
| 2. Pattern | Find working examples, compare | Identify differences |
| 3. Hypothesis | Form theory, test minimally | Confirmed hypothesis |
| 4. Implementation | Create test, fix, verify | Bug resolved, tests pass |
