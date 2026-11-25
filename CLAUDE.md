# Playwright QA Showcase: Claude Code project context

This is **playwright-qa-showcase**, a Playwright + TypeScript portfolio suite testing SauceDemo (UI) and Restful-Booker (API).

**Status (updated 2026-11-17):** MVP. UI and API suites, page objects, fixtures, CI matrix and Playwright Test Agents exist. Every PR gets an automatic Claude QA review (ADR 0004).

## Hard rule

Never use an em dash or en dash in any file. Use a colon, comma or full stop instead. Ordinary hyphens in compound words are fine.

## Commands

- `npm run typecheck`: must pass before any commit
- `npm test`, `npm run test:smoke`, `npm run test:api`, `npm run test:a11y`
- `npm run test:list`: proves selection without running

## Conventions

- Locators: `getByTestId` (attribute is `data-test`) or `getByRole`. No CSS chains, no XPath.
- New page objects go in `src/pages/` and must be added to `src/fixtures/test.ts`.
- Business assertions live in specs, not page objects.
- New tests must name the manual check they replace. If none, propose adding it to the "not automated" table in `docs/test-strategy.md` instead.
- Third-party quirks get asserted and commented, never "fixed" in the test.
- Record any structural decision as a new ADR in `docs/adr/`.

## Playwright agents

See ADR 0003. Planner, generator and healer live in `.claude/agents/`, the seed is `tests/ui/seed.spec.ts`.

- Every agent change (plan, generated test or heal) goes through PR review. Agent output is a draft.
- The healer may fix locators and timing. It must never change expected values, assertions or skips (`test.skip`, `test.fixme`) without asking first. Pass this rule to the healer every time it runs.
- Re-run `npx playwright init-agents --loop=claude` on every Playwright upgrade, then reapply the seed, `.mcp.json` and the generator's "House conventions" section (ADR 0006) and review the diff.
- Generator output is not ready for a PR until it has been consolidated (ADR 0006). After the generator runs, ask Claude Code (not an agent) to:
  1. Merge the one-file-per-scenario output into one spec per page or area, with a `describe` per plan group, reusing an existing spec where there is one.
  2. Resolve every `// TODO(page-object)` by adding the method to the page object (or a new page object in `src/pages/`, registered in `src/fixtures/test.ts`), then using it from the spec.
  3. Remove any helper or locator that duplicates one that already exists.
  4. Run `npm run typecheck` and the affected tests.

## AI PR review

- Every non-draft PR gets an automatic review from `.github/workflows/claude-review.yml`, using the rules in `.github/claude-review-prompt.md`. It comments only; it never pushes, approves or merges.
- If you change a convention in this file, change the review prompt in the same PR so the reviewer checks the new rule.
- Fill in the PR template's Acceptance criteria: the reviewer checks each one has a test.
- Treat its Blockers like a human reviewer's: fix them or reply with a reason, then resolve the thread.
- `@claude` in a PR or issue comment asks Claude a follow-up question (`.github/workflows/claude.yml`).

## Do not

- Commit `.env`, reports or `test-results/`.
- Add tests for the demo app's seeded defects (`problem_user`, `error_user`).
- Weaken an assertion to make a flaky test pass. Find the cause first.
