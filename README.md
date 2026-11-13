# Playwright QA Showcase

[![Playwright tests](https://github.com/RobBrowning/playwright-qa-showcase/actions/workflows/playwright.yml/badge.svg)](https://github.com/RobBrowning/playwright-qa-showcase/actions/workflows/playwright.yml)

A small, deliberately well-structured test automation project built with **Playwright + TypeScript**, run against two public demo apps:

| Target | Type | What it covers |
|---|---|---|
| [SauceDemo](https://www.saucedemo.com) | Web UI | Login rules, inventory sorting, cart state, end-to-end checkout |
| [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | REST API | CRUD, filtering, auth enforcement, documented API quirks |

It exists to show how I approach automation as a QA lead: **fewer, clearer tests that each earn their place**, with the reasoning written down.

## What to look at

- **[`.claude/agents/`](.claude/agents) and [`specs/`](specs)**: Playwright Test Agents (planner, generator, healer) wired into Claude Code. The planner wrote [`specs/product-detail.md`](specs/product-detail.md), the generator turned it into tests, and every agent change goes through PR review. Findings, including where the healer stopped rather than change a business assertion, are in [ADR 0003](docs/adr/0003-playwright-test-agents.md).
- **[`docs/test-strategy.md`](docs/test-strategy.md)**: scope, risk-based selection, what is deliberately *not* automated and why.
- **[`src/`](src)**: page objects, a typed API client and custom fixtures, so specs read as behaviour rather than plumbing.
- **[`tests/`](tests)**: UI and API specs. `@smoke` tags mark the fast, high-value subset.
- **[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)**: typecheck gate, then a parallel matrix (desktop, mobile, API), reports uploaded as artifacts, scheduled weekday run.
- **[`docs/adr/`](docs/adr)**: lightweight Architecture Decision Records.
- **[`CLAUDE.md`](CLAUDE.md)**: how this repo is set up for AI-assisted development with Claude Code.

## Quick start

```bash
git clone https://github.com/RobBrowning/playwright-qa-showcase.git
cd playwright-qa-showcase
nvm use               # Node 22
npm ci
npx playwright install chromium
npx playwright test --ui   # interactive UI mode: pick, watch and debug tests
```

Headless runs:

```bash
npm test              # everything
npm run test:smoke    # @smoke subset only
npm run test:web      # desktop web UI project only
npm run test:api      # API project only
npm run report        # open the last HTML report
```

Base URLs default to the public demo apps. Override with `UI_BASE_URL` / `API_BASE_URL` (see `.env.example`).

## Project layout

```
src/
  pages/      Page Object Model for SauceDemo
  api/        Typed Restful-Booker client + test data builder
  fixtures/   Custom Playwright fixtures (pages, logged-in state, API client)
  data/       Public demo accounts and customer data
tests/
  ui/         Login, inventory, checkout
  api/        Booking lifecycle
docs/
  test-strategy.md
  adr/
  new-repo-setup-guide.md
```

## Conventions

- Locators use `data-test` attributes (`getByTestId`) or accessible roles, never brittle CSS chains.
- One behaviour per test. Long journeys use `test.step` so reports read like a test case.
- Test data is generated per run, so API tests never depend on shared state.
- Known third-party quirks are asserted *and* commented, so they are not mistaken for bugs.
- Every automated test should replace a named manual check. If it does not, it does not get written.

## Roadmap

- [x] MVP: UI + API suites, POM, fixtures, CI matrix
- [x] Playwright Test Agents: planner, generator and healer, with PR review of every agent change (ADR 0003)
- [ ] Visual comparison for `visual_user` behaviour
- [ ] Accessibility checks with axe-core
- [ ] Contract-style schema validation on API responses
- [ ] AI verifier: a locally run agent that independently re-checks failures before they are reported

## About

Built by [Rob Browning](https://github.com/RobBrowning), QA lead with 18+ years in testing, using Claude Code as a pair. Demo apps are owned by their respective authors and used here only as public practice targets.
