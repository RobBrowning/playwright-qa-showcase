import { test, expect } from '../../src/fixtures/test';
import type { Result } from 'axe-core';
import { scanSeriousViolations } from '../../src/a11y/axe';

/**
 * Checks the accessibility gate itself, on small local pages with known axe
 * findings, so the rules in ADR 0005 are proven rather than assumed. No Cypress
 * twin: see "Tests with no Cypress twin" in docs/test-strategy.md.
 *
 * Manual check replaced: a reviewer reading the helper to confirm that moderate
 * findings never fail the build and that a known issue skips only its own rule.
 */

/** Valid shell (lang, title, main, h1) so only the findings under test appear. */
const html = (body: string) =>
  `<!doctype html><html lang="en"><head><title>Gate check</title></head>` +
  `<body><main><h1>Gate check</h1>${body}</main></body></html>`;

test.describe('Accessibility gate', () => {
  test('moderate and minor findings are reported but do not fail the gate', async ({ page: p }, testInfo) => {
    // A heading level skip (h1 to h4) is a moderate finding (heading-order).
    await p.setContent(html('<h4>Skipped levels</h4><p>Text</p>'));

    const gated = await scanSeriousViolations(p, testInfo);
    expect(gated).toEqual([]);

    const attachment = testInfo.attachments.find((a) => a.name === 'axe-results');
    expect(attachment?.body).toBeDefined();
    const full = JSON.parse(attachment!.body!.toString()) as { violations: Result[] };
    const ungated = full.violations.filter((v) => v.impact === 'moderate' || v.impact === 'minor');
    // Guards against a vacuous pass: the page really has a non-gated finding, and it is in the report.
    expect(ungated.map((v) => v.id)).toContain('heading-order');
  });

  test('a known issue skips only its own rule', async ({ page: p }, testInfo) => {
    // Two critical findings: an image with no alt (image-alt) and a button with no name (button-name).
    await p.setContent(html('<img src="data:,"><button></button>'));

    const unskipped = (await scanSeriousViolations(p, testInfo)).map((v) => v.id);
    expect(unskipped).toEqual(expect.arrayContaining(['image-alt', 'button-name']));

    const skipped = (await scanSeriousViolations(p, testInfo, ['image-alt'])).map((v) => v.id);
    expect(skipped).not.toContain('image-alt');
    expect(skipped).toContain('button-name');
  });
});
