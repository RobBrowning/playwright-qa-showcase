import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

/** The impacts that fail the accessibility gate. Moderate and minor are reported, not gated. */
const GATED_IMPACTS = new Set(['serious', 'critical']);

export type GatedViolation = { id: string; impact: string; nodes: number; help: string };

/**
 * Runs axe-core on the current page and returns the serious and critical violations,
 * as plain data for the spec to assert on. Known third-party issues are passed in by
 * rule ID (see docs/test-strategy.md, "Accessibility gate") and only those rules are
 * skipped. The check is never switched off wholesale.
 *
 * The full axe result is attached to the test report so moderate and minor findings
 * stay visible for the manual accessibility review.
 */
export async function scanSeriousViolations(
  page: Page,
  testInfo: TestInfo,
  knownIssues: string[] = [],
): Promise<GatedViolation[]> {
  let builder = new AxeBuilder({ page });
  if (knownIssues.length > 0) builder = builder.disableRules(knownIssues);
  const results = await builder.analyze();

  await testInfo.attach('axe-results', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  return results.violations
    .filter((v) => GATED_IMPACTS.has(v.impact ?? ''))
    .map((v) => ({ id: v.id, impact: v.impact ?? 'unknown', nodes: v.nodes.length, help: v.help }));
}
