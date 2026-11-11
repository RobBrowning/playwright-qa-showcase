# Playwright QA Showcase: Claude Code project context

This is **playwright-qa-showcase**, a Playwright + TypeScript portfolio suite testing SauceDemo (UI) and Restful-Booker (API).

**Status (updated 2026-11-11):** MVP. UI and API suites, page objects, fixtures and CI matrix exist. Roadmap items in README are not started.

## Hard rule

Never use an em dash or en dash in any file. Use a colon, comma or full stop instead. Ordinary hyphens in compound words are fine.

## Commands

- `npm run typecheck`: must pass before any commit
- `npm test`, `npm run test:smoke`, `npm run test:api`
- `npm run test:list`: proves selection without running

## Conventions

- Locators: `getByTestId` (attribute is `data-test`) or `getByRole`. No CSS chains, no XPath.
- New page objects go in `src/pages/` and must be added to `src/fixtures/test.ts`.
- Business assertions live in specs, not page objects.
- New tests must name the manual check they replace. If none, propose adding it to the "not automated" table in `docs/test-strategy.md` instead.
- Third-party quirks get asserted and commented, never "fixed" in the test.
- Record any structural decision as a new ADR in `docs/adr/`.

## Do not

- Commit `.env`, reports or `test-results/`.
- Add tests for the demo app's seeded defects (`problem_user`, `error_user`).
- Weaken an assertion to make a flaky test pass. Find the cause first.
