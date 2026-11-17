## What and why

<!-- One or two sentences: what this PR changes and the reason for it. -->

**Acceptance criteria**
<!-- Numbered, testable. The Claude QA review checks each one has a test. -->
- AC1:

## Manual check replaced

<!-- New tests must name the manual check they replace. If none, add it to the "not automated" table in docs/test-strategy.md instead. -->

## Checklist

- [ ] `npm run typecheck` passes
- [ ] Relevant tests pass locally (`npm test`, `test:smoke`, `test:web` or `test:api`)
- [ ] Test titles match the Cypress twin, or the difference is in `docs/test-strategy.md`
- [ ] Locators use `getByTestId` or `getByRole`: no CSS chains, no XPath
- [ ] No `waitForTimeout`, no `test.only`, no unexplained `test.skip` or `test.fixme`
- [ ] New page objects are registered in `src/fixtures/test.ts`; business assertions live in specs
- [ ] Agent output (planner, generator, healer) reviewed: no changed expected values, assertions or skips
- [ ] No assertion weakened to make a test pass
- [ ] No tests for seeded defects (`problem_user`, `error_user`)
- [ ] Structural decisions recorded as a new ADR in `docs/adr/`
- [ ] No `.env`, reports or `test-results/` committed
- [ ] No em dashes or en dashes in any file
