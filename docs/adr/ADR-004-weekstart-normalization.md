# ADR-004: WeekStart Normalization

## Status
Accepted

## Context
NutriFlow generates weekly dietary and exercise plans. Different regions and user preferences vary regarding which day the week starts (Monday vs. Sunday). Inconsistent start days can lead to overlaps or gaps in plan tracking and automated shopping list generation.

## Decision
We will normalize all weekly plans to start on **Monday** (ISO-8601 standard) by default in the backend logic.
- The UI will allow users to *view* the plan starting from any day, but the underlying data structure in the database and the calculation engine will use Monday-indexed arrays (0=Monday, 6=Sunday).
- The `PlansService` will handle the normalization of incoming profile data to ensure that calculation windows are consistent.

## Consequences
- **Positive:** Simplified logic for shopping list aggregation (one clear boundary).
- **Positive:** Easier alignment with external fitness APIs that often use ISO-8601.
- **Negative:** Users who strictly prefer a Sunday start might find the underlying logic counter-intuitive if they inspect the raw data/API.
