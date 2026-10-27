# Spec delta — planning (plans, exercise, regeneration honesty)

## ADDED Requirements

### Requirement: Linked exercise plan persistence

Generating a weekly diet plan SHALL persist a linked exercise plan in the same flow, and `GET /api/exercise-plans/[dietPlanId]` SHALL return it immediately after diet generation completes.

#### Scenario: Fresh plan has its exercise counterpart

- **WHEN** a user generates a weekly plan
- **THEN** an `exercise_plans` row linked to the diet plan exists
- **AND** the combined plan page renders both without user action

### Requirement: Regeneration is real or hidden

Meal/day regeneration SHALL either regenerate deterministically from the engines (respecting locked meals) or SHALL NOT be presented as an available action in the UI.

#### Scenario: No silent no-op

- **WHEN** a user triggers meal regeneration
- **THEN** the meal content changes deterministically, or the action was not offered
- **AND** locked meals are never modified by regeneration

## ADDED Requirements (exercise plan domain)

### Requirement: Exercise plan schema exists

The `exercise_plans` table (with user ownership, diet-plan linkage, plan data, and RLS policies) SHALL exist in checked-in migrations.

#### Scenario: Reproducible database

- **WHEN** migrations are applied to an empty database
- **THEN** exercise plan persistence works without untracked schema objects
