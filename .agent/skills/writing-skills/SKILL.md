---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment.
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

## TDD Mapping for Skills

| TDD Concept | Skill Creation |
|-------------|----------------|
| **Test case** | Pressure scenario with subagent |
| **Production code** | Skill document (SKILL.md) |
| **Test fails (RED)** | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Agent complies with skill present |
| **Refactor** | Close loopholes while maintaining compliance |

## SKILL.md Structure

**Frontmatter (YAML):**
- **name**: letters, numbers, and hyphens only.
- **description**: Third-person, starts with "Use when...". Max 1024 characters.

## Claude Search Optimization (CSO)

1. **Rich Description Field**: Describe ONLY triggering conditions. Do NOT summarize workflow.
2. **Keyword Coverage**: Include error messages, symptoms, synonyms, and tools.
3. **Descriptive Naming**: Active voice, verb-first (e.g., `creating-skills`).
4. **Token Efficiency**: Keep it concise. Move details to tool help or cross-references.

## Verification Checklist

- [ ] Every new skill has a failing test baseline.
- [ ] Description focuses on "When to Use".
- [ ] Logic is concise and uses `/` for paths.
- [ ] Loopholes are explicitly closed.
