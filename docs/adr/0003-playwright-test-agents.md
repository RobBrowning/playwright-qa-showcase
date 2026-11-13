# ADR 0003: Playwright test agents with a fixture-based seed

- **Status:** Accepted
- **Date:** 2026-11-13
- **Issue:** #2

## Context

Playwright 1.65 ships three test agents (planner, generator, healer) driven by Claude Code through the `playwright-test` MCP server. `npx playwright init-agents --loop=claude` scaffolds them, plus a seed file the agents run to prepare the page before exploring or generating.

The scaffolded seed conflicted with this repo's conventions:

- It imported `test` from `@playwright/test`, so generated code would bypass the page objects and fixtures from ADR 0002.
- It was an empty test inside `tests/ui/`, so every normal run listed and passed it while it checked nothing and replaced no manual check.

The seed cannot simply move out of `tests/`: the agents run it through the Playwright config, so it must stay inside a project's `testDir`.

## Decision

- Use Playwright Test Agents (planner, generator, healer) to draft test plans, generate tests from them and repair failing tests.
- Commit the generated agent definitions (`.claude/agents/`), the MCP config (`.mcp.json`) and the plans folder (`specs/`) so anyone cloning the repo gets the same agents.
- The seed (`tests/ui/seed.spec.ts`) imports from `src/fixtures/test.ts` and starts from the `loggedIn` fixture. Agents begin as `standard_user` on the inventory page with page objects in scope.
- `playwright.config.ts` ignores `**/seed.spec.ts` unless `PLAYWRIGHT_AGENTS` is set. `.mcp.json` sets `PLAYWRIGHT_AGENTS=1` for the MCP server only.
- Agent output is a draft. Every agent change (plan, generated test or heal) goes through PR review and must meet the conventions in `CLAUDE.md`: `getByTestId` or `getByRole` locators, business assertions in specs, and a named manual check they replace.
- The healer may fix locators and timing. It must not change expected values, assertions or skips without asking first.

## Consequences

- `npm test`, `npm run test:list` and CI never see the seed. Test counts stay honest.
- Agents start from the same authenticated state as hand-written specs, so their output is closer to house style.
- Anyone running the seed by hand needs `PLAYWRIGHT_AGENTS=1`. This is noted in the seed's header comment.
- The agent definitions are generated files. Re-running `init-agents` after a Playwright upgrade will overwrite them and the seed, so the seed and `.mcp.json` changes must be reapplied and the diff reviewed.
- The healer can edit tests. Its changes are reviewed like any other, and the rule against weakening an assertion to pass a flaky test still applies.

## Observations from first use (2026-11-13, product detail page)

- **Planner.** It explored the live site as `standard_user` only and followed the `CLAUDE.md` rules it was given: no seeded-defect users, `data-test` or role locators, third-party quirks recorded as behaviour to assert rather than fix. It wrote 16 scenarios to `specs/product-detail.md` and flagged 3 (2.6, 3.2, 4.3) as replacing no manual check. Those were added to the "Deliberately not automated" table in `docs/test-strategy.md`. Two small corrections were needed by hand: it reported 17 scenarios instead of 16, and its save tool has no field for the manual-check note, so each note was written as a test step and later moved into the scenario description.
- **Generator.** It wrote one spec file per scenario (8 files) with the detail-page locators inline, because no page object existed for that page. Seven passed first time. One failed on a race: SauceDemo changes the URL before the detail view renders, so a name locator briefly matched all six inventory cards. The files were then refactored by hand: a `ProductDetailPage` whose `expectLoaded()` waits for exactly one product, new locator methods on `InventoryPage` and `CartPage`, and a single `tests/ui/product-detail.spec.ts` with a describe per plan group. No data-test ids remain inline in the spec.
- **Healer, round 1.** A page object locator had been changed to a data-test value the page does not have (`inventory-item-title`). The healer confirmed the real value (`inventory-item-name`) from the live page and fixed the one line in `ProductDetailPage`, the root cause. It did not touch the spec or any expected value.
- **Healer, round 2.** The spec's expected Backpack price had been changed to a value the app does not show ($39.99 against a live $29.99). The healer was told up front not to edit expected values, so it diagnosed the cause, confirmed the locators and timing were sound, and made no changes. The Claude Code session that dispatched it then asked the user which price was correct instead of changing it. The user confirmed $29.99, and the committed value was restored.

What this shows: the agents follow project rules well when the rules are passed to them explicitly. The healer stopped in round 2 because its instructions said to, not by default, and a healer that fixes tests by changing expected values would turn real defects green. That guard lives in `CLAUDE.md` ("Playwright agents") and must be restated whenever the healer is used.
