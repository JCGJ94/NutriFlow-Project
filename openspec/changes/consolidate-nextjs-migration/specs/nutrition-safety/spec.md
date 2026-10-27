# Spec delta — nutrition-safety (allergens and plan generation integrity)

## ADDED Requirements

### Requirement: Allergen exclusion enforced end-to-end

Weekly plan generation SHALL read the user's allergen restrictions from the canonical `profile_allergens` table (joined through the user's profile) and SHALL exclude ingredients linked through the `ingredient_allergens` join table before meal assembly.

#### Scenario: Restricted ingredient never selected

- **WHEN** a user with a saved allergen generates a weekly plan
- **THEN** no meal item contains an ingredient linked to that allergen
- **AND** an integration test with seeded allergen data proves exclusion against a migrated database

#### Scenario: No restrictions is a valid state

- **WHEN** a user has no allergen restrictions
- **THEN** generation proceeds with the full ingredient catalog

### Requirement: Atomic plan creation

Persisting a weekly plan (plan, days, meals, items) SHALL be atomic: either the complete plan is stored or nothing is stored.

#### Scenario: Partial failure leaves no partial plan

- **WHEN** any insert during plan persistence fails
- **THEN** no plan, day, meal, or item rows from that attempt remain
- **AND** the API returns an error and the client can retry safely

### Requirement: Nutritional output validation at persistence

The generated weekly plan SHALL satisfy declared calorie and macro targets within a configured tolerance before it is persisted; an out-of-tolerance result fails generation instead of silently storing an invalid plan.

#### Scenario: Tolerance check on generation

- **WHEN** `generateWeeklyPlan()` completes
- **THEN** each day's totals are verified against targets within `MACRO_TOLERANCE`
- **AND** violations surface as a generation error, not a persisted plan

## MODIFIED Requirements

### Requirement: Active-plan limit

The plan limit (3) SHALL count only plans with `status = active`; archived plans SHALL NOT trigger archival of newer plans.

#### Scenario: Archived plans do not consume the limit

- **WHEN** a user has 2 active and 5 archived plans and generates a new one
- **THEN** no plan is archived and the new plan is created
