import { test, expect } from '../../src/fixtures/test';
import { DEMO_PASSWORD, users } from '../../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard, DEMO_PASSWORD);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('locked out user sees a clear error', async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut, DEMO_PASSWORD);
    await expect(loginPage.error).toContainText('this user has been locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  const invalid = [
    { name: 'empty username', user: '', pass: DEMO_PASSWORD, message: 'Username is required' },
    { name: 'empty password', user: users.standard, pass: '', message: 'Password is required' },
    {
      name: 'wrong password',
      user: users.standard,
      pass: 'not_the_password',
      message: 'Username and password do not match',
    },
  ];

  for (const { name, user, pass, message } of invalid) {
    test(`rejects ${name}`, async ({ loginPage }) => {
      await loginPage.login(user, pass);
      await expect(loginPage.error).toContainText(message);
    });
  }

  test('inventory is not reachable without logging in', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
