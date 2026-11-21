import { test, expect } from '../../src/fixtures/test';
import { scanSeriousViolations } from '../../src/a11y/axe';

/**
 * Twin of cypress-qa-showcase a11y.cy.ts: same titles. Fails on serious and critical
 * axe violations only. Known SauceDemo issues are listed by rule ID in
 * docs/test-strategy.md and passed in here, never switched off wholesale.
 *
 * Manual check replaced: a tester running an axe browser extension on the login,
 * inventory and checkout pages before each release.
 */
const KNOWN_ISSUES: Record<'login' | 'inventory' | 'checkout', string[]> = {
  login: [],
  inventory: [],
  checkout: [],
};

test.describe('Accessibility', () => {
  test('login page has no serious or critical axe violations', async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();
    await expect(loginPage.loginButton).toBeVisible();
    expect(await scanSeriousViolations(page, testInfo, KNOWN_ISSUES.login)).toEqual([]);
  });

  test('inventory page has no serious or critical axe violations', async ({ loggedIn, page }, testInfo) => {
    await expect(loggedIn.items).toHaveCount(6);
    expect(await scanSeriousViolations(page, testInfo, KNOWN_ISSUES.inventory)).toEqual([]);
  });

  test('checkout page has no serious or critical axe violations', async (
    { loggedIn, cartPage, checkoutPage, page },
    testInfo,
  ) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await cartPage.checkout();
    await expect(checkoutPage.firstName).toBeVisible();
    expect(await scanSeriousViolations(page, testInfo, KNOWN_ISSUES.checkout)).toEqual([]);
  });
});
