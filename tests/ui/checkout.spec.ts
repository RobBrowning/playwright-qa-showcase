import { test, expect } from '../../src/fixtures/test';
import { defaultCustomer } from '../../src/data/checkout';

const products = ['Sauce Labs Backpack', 'Sauce Labs Onesie'];

test.describe('Checkout', () => {
  test('customer can buy two items end to end @smoke', async ({ loggedIn, cartPage, checkoutPage }) => {
    const expectedTotal = await test.step('add items and note their prices', async () => {
      let total = 0;
      for (const name of products) {
        const priceText = await loggedIn.item(name).getByTestId('inventory-item-price').textContent();
        total += Number((priceText ?? '').replace('$', ''));
        await loggedIn.addToCart(name);
      }
      return total;
    });

    await test.step('review cart', async () => {
      await loggedIn.openCart();
      await cartPage.expectLoaded();
      await expect(cartPage.itemNames).toHaveText(products);
      await cartPage.checkout();
    });

    await test.step('enter details and confirm subtotal', async () => {
      await checkoutPage.fillDetails(defaultCustomer);
      expect(await checkoutPage.subtotalValue()).toBeCloseTo(expectedTotal, 2);
    });

    await test.step('place order', async () => {
      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      await expect(loggedIn.cartBadge).toHaveCount(0);
    });
  });

  test('checkout requires a postal code', async ({ loggedIn, cartPage, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
    await cartPage.checkout();
    await checkoutPage.fillDetails({ ...defaultCustomer, postalCode: '' });
    await expect(checkoutPage.error).toContainText('Postal Code is required');
  });
});
