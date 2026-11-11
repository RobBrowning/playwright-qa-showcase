import { test, expect } from '../../src/fixtures/test';

test.describe('Inventory', () => {
  test('sorts by price, low to high', async ({ loggedIn }) => {
    await loggedIn.sortBy('lohi');
    const prices = await loggedIn.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts by price, high to low', async ({ loggedIn }) => {
    await loggedIn.sortBy('hilo');
    const prices = await loggedIn.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('sorts by name, Z to A', async ({ loggedIn }) => {
    await loggedIn.sortBy('za');
    const names = await loggedIn.itemNames.allTextContents();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('cart badge tracks add and remove @smoke', async ({ loggedIn }) => {
    await expect(loggedIn.cartBadge).toHaveCount(0);
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.addToCart('Sauce Labs Bike Light');
    await expect(loggedIn.cartBadge).toHaveText('2');
    await loggedIn.removeFromCart('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
  });
});
