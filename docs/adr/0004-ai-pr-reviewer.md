# ADR 0004: AI PR reviewer with the official Claude GitHub Action

- **Status:** Accepted
- **Date:** 2026-11-17

## Context

The twin repo, [cypress-qa-showcase](https://github.com/RobBrowning/cypress-qa-showcase), runs a QA-focused Claude reviewer on every PR. It was tested there on [PR #10](https://github.com/RobBrowning/cypress-qa-showcase/pull/10) with four seeded defects: it caught all four plus three real issues nobody seeded, with no false positives, while Anthropic's generic code-review plugin missed the acceptance criterion with no test. This repo should get the same first pass.

This repo also uses Playwright Test Agents (ADR 0003). The healer edits tests, and CLAUDE.md says it must never change expected values, assertions or skips. That rule was only enforced by a human reading the diff.

## Decision

- Run `anthropics/claude-code-action@v1` on every non-draft PR (`.github/workflows/claude-review.yml`), authenticated with a Claude subscription OAuth token (`CLAUDE_CODE_OAUTH_TOKEN`).
- **Comments only.** The workflow token is read-only and Claude's tools are limited to reading the repo, `gh pr view/diff/comment` and inline comments, so it can't push, approve or merge.
- The review rules live in `.github/claude-review-prompt.md`, adapted to this repo: `getByTestId`/`getByRole` locators, fixtures, `@smoke` in titles, twin parity with Cypress, and no `waitForTimeout`.
- **Agent rule:** any change from the planner, generator or healer that alters an expected value, an assertion, or adds a skip or fixme is a Blocker.
- Add `.github/workflows/claude.yml` so `@claude` in a PR or issue comment asks Claude a follow-up. Unlike the reviewer, it can push commits to a PR branch when asked. Only people with write access can trigger it.
- Add a PR template with an Acceptance criteria section, because the reviewer reads ACs from the PR description.
- Use one automatic AI reviewer only, as decided in the twin repo's ADR 0005.

## Consequences

- Every PR gets a consistent QA review within about a minute, including an AC to test table.
- The healer rule from ADR 0003 is now checked automatically on every PR, not just by eye.
- Reviews use the owner's Claude plan limits. `--max-turns`, a 15-minute timeout and concurrency cancel-in-progress cap each run.
- PRs from forks get no repo secrets, so they aren't reviewed.
- `main` has no ruleset yet, so review threads and required checks are not enforced here as they are in the twin repo. Adding a matching `protect-main` ruleset is a follow-up.
