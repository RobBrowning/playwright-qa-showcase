# ADR 0002: Page Objects exposed through fixtures

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

Specs that build their own page objects and log in by hand repeat setup and hide intent.

## Decision

- Page objects own locators and page-level actions only. Assertions about business behaviour stay in specs.
- Page objects and the API client are injected through custom fixtures (`src/fixtures/test.ts`).
- A `loggedIn` fixture provides an authenticated inventory page, so specs start where their behaviour starts.

## Consequences

- Specs read as behaviour. Setup changes happen in one place.
- Fixtures are lazy: a test only pays for what it asks for.
