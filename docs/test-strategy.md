# Test Strategy

## Purpose

Show a realistic, maintainable approach to automating a web app and an API, not to maximise test count.

**Guiding principle: less better, not more faster.** Every automated test must replace a named manual check. If nobody would check it by hand, it is not worth automating.

## Scope

### In scope

| Area | Why | Level |
|---|---|---|
| Login rules (valid, locked out, missing fields, wrong password, direct URL access) | Gatekeeper to everything, cheap to break | UI |
| Inventory sorting | Pure client logic, easy to regress, easy to assert | UI |
| Cart state (badge add/remove) | Shared state across pages | UI |
| Checkout journey + subtotal maths | Highest business value path | UI (E2E) |
| Booking CRUD + filtering | Core API contract | API |
| Auth enforcement on update | Security-relevant behaviour | API |

### Deliberately not automated (and why)

| Item | Reason |
|---|---|
| `problem_user`, `error_user` broken behaviours | They are seeded defects in the demo app. Automating them would produce permanently red tests that teach nothing. Better covered as exploratory charters. |
| `performance_glitch_user` | A timing demo, not a functional check. Belongs in a performance tool, not an E2E suite. |
| Every sort option x every browser | Sort is browser-independent logic. Desktop Chromium covers it; mobile runs only the `@smoke` subset. |
| Restful-Booker PATCH | Same auth and payload rules as PUT. Adds runtime, not confidence. |
| Cart state surviving a reload or direct URL on the product detail page (`specs/product-detail.md` 2.6) | No manual check replaces it. It exercises the demo app's client-side storage rather than a user journey, and cross-page cart state is already covered by scenarios 2.3 to 2.5. |
| Browser back from the product detail page (`specs/product-detail.md` 3.2) | Browser history behaviour, not product logic. The app's own navigation is covered by "Back to products" (scenario 3.1). |
| Lenient product id parsing, for example `?id=01`, `?id=1.5`, `?id=1&id=2` (`specs/product-detail.md` 4.3) | A third-party parsing detail with no user-facing value. Asserting it would pin behaviour nobody checks by hand, and any change by the demo app would turn the suite red for no business reason. |

## Test selection

Two questions drive what runs where:

1. **What changed, and what can it break?** (blast radius)
2. **How well-established is existing coverage there?** (baseline confidence)

High blast radius + low baseline confidence = automate and run on every push. Low + high = leave for scheduled or exploratory runs.

## Levels and tags

- `@smoke`: fast, high-value checks. Run on the mobile project and suitable as a deploy gate.
- Untagged: full regression, desktop + API, on every push and a weekday schedule.

## Test classification

Fixed when a test is written, so the suite stays legible as it grows:

| Class | Meaning | Examples here |
|---|---|---|
| Structural | Stable regardless of data | Login errors, sorting |
| State-specific | Depends on account or session state | Locked-out user, cart badge |
| Data-generated | Creates its own data per run | All API tests |

## Environments and data

- Public demo apps only. No credentials beyond those the apps publish themselves.
- API data is unique per run (timestamp suffix), so tests are parallel-safe.

## Reporting

- HTML report + traces, screenshots and video retained on failure.
- CI uploads one report per project as an artifact; GitHub annotations surface failures inline on PRs.

## Risks and known limitations

- Third-party demo apps can change or go down. The weekday scheduled run exists to detect that drift early; a failure there is triaged as "app changed" vs "test wrong" before anything else.
- Restful-Booker resets its data periodically, so tests never rely on pre-existing bookings.
