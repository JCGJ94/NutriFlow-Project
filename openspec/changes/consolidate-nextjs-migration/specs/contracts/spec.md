# Spec delta — contracts (shared validation and API coherence)

## ADDED Requirements

### Requirement: Single source of truth for domain contracts

`packages/shared` SHALL export Zod schemas as the executable definition of every API request/response contract, and the app SHALL NOT define duplicate structural types for the same contract.

#### Scenario: Profile contract unification

- **WHEN** any layer (route handler, client form, engine) needs the profile shape
- **THEN** it imports the shared Zod schema (or its inferred type) from `@nutriflow/shared`
- **AND** no second structurally competing `Profile`/`UserProfile` definition exists in `apps/web/src`

#### Scenario: Enum casing is lowercase everywhere

- **WHEN** a profile is created or updated through the API with shared enum values (`male`, `moderately_active`, `omnivore`, …)
- **THEN** the payload validates and persists
- **AND** values rejected by the database constraints are rejected identically by the route schema

### Requirement: Generated database types

The project SHALL generate Supabase `Database` types from the checked-in migrations and use them for all `sb.from(...)` calls, eliminating untyped `SupabaseClient<any>` access in route handlers.

#### Scenario: Typed database access

- **WHEN** a route handler queries a table or column that does not exist in migrations
- **THEN** typecheck fails, preventing schema drift from shipping silently

### Requirement: Endpoint path coherence

Every client-side fetch path SHALL resolve to an existing Route Handler, and no handler shall exist without a consumer or a documented public API reason.

#### Scenario: Onboarding persistence path

- **WHEN** onboarding or settings submit profile/allergen/username-availability requests
- **THEN** they call the same canonical paths the handlers implement
- **AND** persistence succeeds with a valid payload

### Requirement: Consistent error envelope

API routes SHALL return errors as `{ error: string }` with an appropriate HTTP status, and the client API layer SHALL surface that message to the user.

#### Scenario: Meaningful failure surfaced

- **WHEN** a route rejects a request (validation, auth, not-found)
- **THEN** the client displays the route's `error` message instead of a generic failure
