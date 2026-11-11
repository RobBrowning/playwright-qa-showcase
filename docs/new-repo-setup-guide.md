# Setting Up a New QA Automation Framework Repo

> **Note for human readers:** this guide is written as instructions for Claude Code, so an AI pair can bootstrap a new automation monorepo using patterns proven in a production, dual-platform (native app + web) E2E framework I worked on. It is anonymised and generic. It doubles as a record of how I structure automation repos, govern them, and work with AI tooling. This showcase repo is a deliberately small, single-platform application of the same ideas.

## 0. Read this first

You are Claude Code, about to bootstrap a new test automation monorepo. This document is written for you, not for the human who handed it to you. It distills the proven, working patterns from an existing repo (a dual platform E2E test automation monorepo) so you can set up a new one without rediscovering the same decisions by trial and error.

Follow this document as a playbook, in order. Where a value is project specific (a Jira project key, a Confluence space ID, a real API host), it is written as a placeholder in angle brackets, for example `<JIRA_PROJECT_KEY>`. Ask the user for these rather than inventing them. Where this document gives you a convention that worked well in the source repo (a hard rule, a naming pattern, a tiering model), adopt it unless the user tells you otherwise, it exists because it solved a real problem once.

Do not start writing code or config before Section 1 is settled with the user. Everything downstream depends on those answers.

---

## 1. Settle these with the user before touching the repo

Ask directly, do not guess:

1. **How many platforms/targets does this framework need to cover, and what are they?** The source repo covers two (a native app and a web app), each with a genuinely different automation runtime. If your new repo only has one target, most of the "platform parameterization" machinery in this guide collapses to a simpler single-platform setup, skip the dispatcher pattern in Section 7 and the platform resolution logic throughout.
2. **What test runner does each platform actually need?** Do not assume one runner fits all. The source repo kept native app on Appium + WebdriverIO + Cucumber (an explicit architecture decision, not a default) while migrating its web platform from WebdriverIO to Playwright + playwright-bdd (a second explicit decision). Record whichever choices are made here as lightweight ADRs (Architecture Decision Records) from day one, you will be glad later when someone asks why.
3. **Where does test management and reporting live?** Jira plus a test case manager (the source repo uses Zephyr Scale inside Jira), or something else (Xray, TestRail, a vendor's own Test Manager product). This determines which MCP server you configure in Section 5 and what your reporting adapter package needs to normalize.
4. **Where do regression plans and reports get published?** The source repo publishes to Confluence. Get the actual space key and parent page IDs before you need them, not after.
5. **What device/browser cloud, if any, will run tests at scale?** The source repo uses LambdaTest (three separately billed concurrency pools: native app, web real device, web desktop). If the new project uses a different vendor (BrowserStack, Sauce Labs) or none at all, the MCP server list in Section 5 changes accordingly.
6. **Does this framework need to create its own live test data, or does it only consume fixtures?** The source repo built a shared package that queries a real backend API for live domain data matching test conditions, because fixtures alone could not cover every edge case. Decide early whether your new repo needs an equivalent, it shapes one of your `packages/`.
7. **What is actually out of scope, deliberately?** The source repo's guiding principle is "less better, not more faster": every automated test must replace a named manual check, and it keeps an explicit "not automating, and why" ledger. Get the equivalent principle in the new user's own words, you will put it at the bottom of CLAUDE.md.

Do not proceed past this point until you have real answers, not placeholders, for items 1 to 4.

---

## 2. Repository shape

Use a single monorepo, not separate repos per platform, even if only one platform exists today. The source repo's own history is a cautionary example: it replaced two independently maintained sibling repos specifically because divergent tooling across them became a maintenance burden. One shared `.claude/` tooling layer, one CI pipeline definition, one set of conventions, parameterized by platform, beats two copies that quietly drift apart.

```
apps/
  <platform-a>-e2e/      # e.g. app-e2e: native app, Appium + WebdriverIO + Cucumber
    src/
      config/            # environment + execution-target config
      features/          # Gherkin feature files
      step-definitions/
      screens/           # or pages/ for web: Page-Object-Model layer
      support/
  <platform-b>-e2e/      # e.g. web-e2e: Playwright + playwright-bdd
    src/
      config/
      features/
      step-definitions/
      pages/
      tunnel/            # only if you need a cloud-device tunnel

packages/                # shared, platform-agnostic code ONLY. If a package needs
                          # platform-specific branching internally, that is a signal
                          # it should not be shared, split it instead.
  data-resolver/          # live test-data condition engine, if you decided you need one
  reporting-adapter/       # test-runner-output -> test-manager-format normalizer
  mock-data-resolver/      # shared stub/mock provisioning engine
  <cloud-tunnel>/          # shared tunnel lifecycle, if using a device cloud

docs/
  architecture.md          # the single source of truth for "what is real today"
  architecture/<platform>.md
  running-tests.md
  writing-tests.md
  environment-setup.md

jenkins/
  README.md
  DESIGN-DECISIONS.md
  <pipeline-name>/Jenkinsfile   # the one real, shared, parameterized pipeline

.claude/
  commands/                # slash commands, see Section 7
  agents/                  # subagents, see Section 7
  data/                    # reference data the commands read (mappings, criteria, standards)

.mcp.json                  # see Section 5
CLAUDE.md                  # see Section 4
SETUP.md                   # plain install steps + known environment gotchas
```

Root tooling baseline that worked well: a package manager with real workspace support (pnpm in the source repo), TypeScript with `strict: true` and `noUncheckedIndexedAccess: true` in a shared base tsconfig, one linter config, one test runner for unit tests (Vitest), and a pinned Node engine version enforced via `engines` in the root package.json plus a `.nvmrc`. Pin shared runtime library versions (like Playwright) across the whole workspace with a workspace level override, a real bug in the source repo (a cloud vendor rejecting mismatched Playwright versions between the root and a package) came from not doing this.

---

## 3. Governance conventions worth adopting as-is

These are not technical scaffolding, they are working rules that kept the source repo coherent as it grew. Write your own versions into CLAUDE.md (Section 4).

- **Never mix platforms in one action.** Any action that writes to the test manager, Jira, or Confluence must resolve which platform it is operating on explicitly (from a release name, a component, a folder, or by asking) and touch only that platform's artifacts. Never let a command assume "the only platform" or "the usual platform."
- **Documentation is written as you go, one task per feature, never a standalone documentation backlog.** If a package or command ships without its own short DESIGN-DECISIONS.md or README update in the same change, that is a defect in the change, not a future ticket.
- **Status labels (epic status, "Done" markers) are a weak signal, treated as such everywhere.** Every status claim in CLAUDE.md or docs should be checked against what the code and child tickets actually show, and the document should say so plainly rather than silently trusting a label.
- **Never estimate story points, bugs never carry them, missing values are shown as a placeholder and flagged as a risk**, not silently defaulted to zero or guessed.
- **A two layer test selection model** (Layer 1, what changed and its blast radius; Layer 2, how well-established the existing baseline coverage already is) kept regression planning from either over- or under-selecting tests. Borrow the shape even if you rename the layers.
- **A test classification model fixed at creation time** (the source repo uses three classes: Structural, meaning stable regardless of live data; Conditional-live, meaning it depends on a live data state that must be hunted for; State-specific, meaning it depends on account/session state) keeps the regression suite legible as it grows. Decide your own three or four classes early, retrofitting classification onto hundreds of existing tests later is painful.
- **A single hard style rule, stated once and applied everywhere, beats a dozen soft preferences.** The source repo's is "never use an em dash or en dash, anywhere, including existing files, ever." Whatever your user's equivalent is, write it as plainly and as absolutely, and actually mean it when you draft content yourself.

---

## 4. CLAUDE.md: template and explanation

This file is read automatically on every session in the new repo, it is the single most important file you will write. Keep it factual and current, update it in the same change as any status shifting work, and resist the urge to pad it.

```markdown
# <Product/Org> QA Automation - Claude Code Project Context

This is **<repo-name>**, the <one-line description: what it tests, which platform(s), what initiative it belongs to>.

**Status (updated <date>):** <One honest paragraph. Say what's actually Done, verified how, and what's
still open, per area. If a status claim and the code disagree, say so and say which one you trust and why.>

**First time here? Read `SETUP.md`** for install steps and known environment gotchas.

## Hard rule: <your one non-negotiable style/behavior rule>

## Platform(s)

| Platform | Test manager team/project | Test case folder | Docs/reports parent |
|----------|---------------------------|-------------------|----------------------|
| <platform-a> | <value> | <value> | <value> |

**Never mix platforms in one action.**

## Repo structure
## Available AI Workflows
## MCP Tools Available
## Key IDs
## Story Point Rules
## Test Selection Model
## Test Classification Model
## Guiding principle
```

---

## 5. MCP servers you will likely need

Configure these in `.mcp.json` at the repo root. Never hardcode credentials in that file, reference environment variables, and document in `SETUP.md` which variables must be set and where to get them.

| Category | Example server | What it is for | Notes |
|---|---|---|---|
| Test manager + issue tracker | `atlassian` (or your vendor's equivalent) | Jira/Confluence/test-case access for the whole `.claude/` tooling layer | If hosted, usually a single HTTPS MCP endpoint |
| Native app automation | `wdio-mcp`, `appium-mcp` | Drives a real device/emulator via Appium | Only if a platform actually uses Appium |
| Web browser automation (local) | `playwright-mcp`, plus `-mobile`/`-tablet` variants | Drives a local browser via Playwright | One entry per device profile you regularly test against |
| Web browser automation (device cloud) | a custom MCP server wrapping Playwright MCP against your cloud vendor's CDP endpoint | Only if the vendor's own MCP offering does not already cover it | Check if your vendor ships one first |
| Device/browser cloud platform | your vendor's own MCP server | Builds, sessions, analytics | Confirm how concurrency is billed before assuming |
| Release quality / analytics | e.g. a BI tool's MCP server | Pulls real metrics into a report command | Often ships as a Docker image |
| Narrow custom automations | a small bespoke MCP server exposing one or two tools | When a flow (multi-step signup, payment sandbox, cross-origin iframes) is clearer as its own tool | Pin each instance to one environment via an env var |

```json
{
  "mcpServers": {
    "atlassian": { "type": "http", "url": "https://mcp.<your-atlassian-host>/v1/mcp" },
    "playwright-mcp": { "command": "npx", "args": ["@playwright/mcp@latest"] },
    "playwright-mcp-mobile": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--device", "iPhone 15 Pro"]
    }
  }
}
```

Before you trust any entry in a new `.mcp.json` you did not just write yourself: confirm who the real caller is by grepping the actual source, not by trusting whatever comment or prior README claimed.

---

## 6. External integrations and APIs to wire up

Map out each real external system the framework touches, and whether it is called from shared `packages/` code or only from the AI tooling layer via MCP:

- **A live data source**, if needed: a backend API a shared package queries directly to find real test data matching a condition. Keep the base URL overridable via an environment variable from day one.
- **A mocking/stub layer** for local manual testing, such as WireMock in a local container, with a thin shared package wrapping its admin API.
- **A disposable identity/email provisioning mechanism**, if flows need fresh signups: a public disposable-inbox API is often enough.
- **A sandboxed payment/subscription flow**, if applicable: expect cross-origin iframes and handle them with the runner's native frame-locator mechanism.
- **Your test manager's real import mechanism**, and its real quirks. Expect a seam between your runner's output and the importer, and own it with a small shared package rather than patching around it in the pipeline.
- **CI.** One shared, parameterized pipeline, not one per platform. Be honest in its docs about what it proves versus what it does not yet do.

---

## 7. The `.claude/commands/` and `.claude/agents/` pattern

Most AI workflows should work across every platform without the person invoking them having to think about which platform they are on. A few cannot be unified, because the execution environment is genuinely different. Use three tiers:

**Tier 1, shared, platform resolved internally.** One command file that resolves platform from its input, then proceeds identically. Use this whenever the logic does not depend on platform, only the data does.

**Tier 2, shared, platform resolved via keyed config.** One command file reading a small per-platform config. Use this when the command manages ongoing state per platform side by side.

**Tier 3, dispatcher plus specialists.** A thin dispatcher that resolves platform and routes to a platform-specific specialist. Use this only when the execution mechanism truly differs (different driver, different session model).

When you retire a dispatcher, leave a one-line "superseded" note at its top rather than deleting it silently.

**Subagents** (`.claude/agents/`) are thin wrappers around the equivalent command's logic, for running long analyses in the background. Do not maintain two diverging copies of the same logic.

---

## 8. CI pipeline pattern

One parameterized pipeline (platform, suite type, component filter), not one per platform. Start with install, lint and typecheck, then a "suite selection proof" stage that lists selected tests without running them. Document precisely what each stage proves and does not prove. A stage that only typechecks is not a substitute for one that executes tests.

---

## 9. Step-by-step setup checklist

1. Confirm all of Section 1's answers with the user.
2. Scaffold the monorepo skeleton: workspace config, shared tsconfig, lint/prettier, pinned Node and shared library versions.
3. Create each platform's `apps/<platform>-e2e` with one real smoke test passing locally before building anything else.
4. Scaffold `packages/` only for what Section 1 decided you need.
5. Write `CLAUDE.md` with real values. A short honest section beats a padded speculative one.
6. Write `SETUP.md`, including gotchas as you hit them.
7. Configure `.mcp.json` one server at a time, confirming each connects.
8. Build the `.claude/commands/` layer starting with the single most valuable command, end to end.
9. Scaffold CI as a lint/typecheck-only proof first; add execution once local runs are reliable.
10. Write `docs/architecture.md` as the living source of truth, updated in the same change as status-changing work.
11. Do a full dry run from ticket to test manager result. Fix anything faked or assumed before calling setup done.

---

## 10. Pitfalls to avoid

- Attributing a tool or integration to the wrong platform in docs and never re-checking it against real call sites.
- Letting a ticket's "Done" status stand in for checking the code.
- Declaring a shared package "done" because it has unit tests when nothing actually calls it yet. "Built and unit tested" and "wired into a real call site" are different claims.
- Building Tier 3 dispatcher machinery for a command that did not need it.
- Leaving a retired dispatcher unmarked.
- A CI stage that looks green but proves only a fraction of what its name implies.
- Inventing platform names, test managers or vendors instead of asking.

---

If anything here conflicts with what the user actually wants for the new repo, their explicit instruction wins. This document encodes patterns that worked once, not rules that override a real decision made in front of you.
