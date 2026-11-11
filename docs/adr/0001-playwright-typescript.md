# ADR 0001: Playwright + TypeScript

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

I need one framework that covers web UI and HTTP APIs, runs fast in CI, and is easy for others to read. I have prior production experience with Cypress, WebdriverIO and Jest/Puppeteer, and recently led a migration of a web suite from WebdriverIO to Playwright.

## Decision

Use `@playwright/test` with TypeScript (`strict`, `noUncheckedIndexedAccess`).

## Consequences

- One runner for UI and API, with shared fixtures and reporting.
- Built-in parallelism, retries, traces and device emulation remove the need for extra plugins.
- Strict typing catches locator and payload mistakes before runtime.
- No BDD layer for now. Specs use `test.step` for readable reports. Gherkin can be added with `playwright-bdd` if a non-technical audience needs it (see ADR 0002 when written).
