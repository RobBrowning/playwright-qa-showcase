# ADR 0005: Accessibility gate with axe-core

- **Status:** Accepted
- **Date:** 2026-11-21

## Context

The twin repo, [cypress-qa-showcase](https://github.com/RobBrowning/cypress-qa-showcase), already checks the login, inventory and checkout pages with axe-core (`a11y.cy.ts`, 3 tests). Its test strategy lists those tests as having no Playwright twin yet, and this repo's README roadmap has "Accessibility checks with axe-core" as an open item.

## Decision

- Use `@axe-core/playwright`, pinned to 4.14.0 so it runs the same axe-core rules as the Cypress twin.
- Scan the same three pages with the same three test titles, in `tests/ui/a11y.spec.ts`. The tests run in the `ui-chromium` project only (they are not `@smoke`).
- Gate on **serious** and **critical** violations only. Moderate and minor findings are attached to the test report as JSON, not gated.
- `src/a11y/axe.ts` runs the scan and returns the gated violations as plain data. The spec asserts the list is empty, so the business assertion stays in the spec (ADR 0002).
- A known SauceDemo issue is skipped by axe rule ID for one page only, and recorded in `docs/test-strategy.md`. The check is never switched off wholesale.

## Consequences

- Both repos cover accessibility with the same scope, gate and titles, so their results compare directly.
- The gate can go red if SauceDemo changes its markup. That is triaged like any third-party drift: record the rule ID and reason, never weaken the gate to get green.
- Moderate and minor issues are visible in the report but need a manual accessibility review to act on.
