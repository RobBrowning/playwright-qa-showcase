# ADR 0006: Agent output follows house conventions, and review Blockers block the merge

- **Status:** Accepted
- **Date:** 2026-11-25
- **Issue:** #11

## Context

ADR 0003 introduced Playwright Test Agents. On first use the generator wrote one spec file per scenario with locators inline, and the output had to be refactored by hand into page objects and a single spec (see ADR 0003, Observations). Repeating "use the page objects" in every prompt is easy to forget and does not scale.

Two facts shape the fix:

- The generator's tools let it read the repo and write a test file, but not create or edit other files. It can reuse page objects; it cannot add to them.
- `init-agents` regenerates the agent definitions on every Playwright upgrade, so any change to them must be reapplied.

The Claude PR reviewer (ADR 0004) already checks these conventions, but it only comments. It cannot block a merge by itself.

## Decision

1. **Generator conventions.** Add a "House conventions" section to `.claude/agents/playwright-test-generator.md`: import from `src/fixtures/test.ts`, start from the matching fixture, reuse existing page object methods, keep business assertions in specs, and mark any step a page object does not yet cover with `// TODO(page-object): <PageName>.<methodName>`.
2. **Consolidation step.** Generator output is a draft until Claude Code (not an agent) merges it into one spec per page or area, resolves every `TODO(page-object)` by extending or adding page objects, and removes duplicates. The steps live in `CLAUDE.md`.
3. **Reviewer rules.** The review prompt treats a leftover `TODO(page-object)`, a duplicated locator, or a spec importing from `@playwright/test` as a Blocker, and one-file-per-scenario output as a Major.
4. **Blockers block.** The `protect-main` ruleset already requires all conversations to be resolved before merging (set 20 Nov 2026 to match the Cypress twin). Every reviewer finding is an inline thread, so a Blocker must be fixed or answered and resolved before merge. This ADR relies on that rule: removing it from the ruleset reopens the gap.

## Consequences

- Page objects stay the single place locators live. A new page gets its page object during consolidation, not later.
- The reviewer catches anything the generator or consolidation missed, and the ruleset stops it merging unnoticed.
- Upgrade cost: one extra section to reapply after `init-agents`, listed in `CLAUDE.md` with the seed and `.mcp.json`.
- Resolving a thread is still a human decision. This gates on attention, not on the AI's verdict, which keeps a human as the final reviewer.
- Not chosen: giving the generator Edit and Write tools so it extends page objects itself. That widens what an agent can change unreviewed and adds a frontmatter change to reapply on every upgrade. Revisit if consolidation becomes the bottleneck.
