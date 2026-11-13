// Plan: specs/product-detail.md, groups 1 and 2. Scenario 2.6 is not automated
// (see docs/test-strategy.md). Generated from tests/ui/seed.spec.ts.
import { test, expect } from '../../src/fixtures/test';

const products = {
  bikeLight: { id: 0, slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: '$9.99' },
  boltTShirt: { id: 1, slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  onesie: { id: 2, slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: '$7.99' },
  // The slug is the lower-cased name with spaces replaced by hyphens, brackets and dots included.
  redTShirt: { id: 3, slug: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
  backpack: { id: 4, slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: '$29.99' },
  fleeceJacket: { id: 5, slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
};

test.describe('Product detail: content', () => {
  // Replaces manual check: eyeballing that name, description, price and image on the detail page match the inventory card for several products.
  test('Detail content matches the inventory card for each product', async ({ loggedIn, productDetailPage: detail }) => {
    for (const product of [products.backpack, products.bikeLight, products.fleeceJacket]) {
      // Read the card values on /inventory.html, then click the name link.
      const cardDesc = (await loggedIn.itemDescription(product.name).textContent()) ?? '';
      const cardPrice = (await loggedIn.itemPrice(product.name).textContent()) ?? '';
      const cardSrc = await loggedIn.itemImage(product.slug).getAttribute('src');
      expect(cardSrc).toBeTruthy();
      expect(cardPrice).toBe(product.price);

      await loggedIn.titleLink(product.id).click();
      await detail.expectLoaded(product.id);

      await expect(detail.name).toHaveText(product.name);
      await expect(detail.description).toHaveText(cardDesc);
      await expect(detail.price).toHaveText(cardPrice);
      // The detail page image uses data-test item-<slug>-img, unlike the card.
      await expect(detail.image(product.slug)).toBeVisible();
      await expect(detail.image(product.slug)).toHaveAttribute('src', cardSrc!);

      await detail.backToProducts();
      await loggedIn.expectLoaded();
    }
  });

  // Replaces manual check: clicking a product picture instead of its name to confirm both open the detail page.
  test('Product image link opens the same detail page as the name link', async ({ page, loggedIn, productDetailPage: detail }) => {
    const { id, name, price } = products.boltTShirt;

    await loggedIn.imageLink(id).click();
    await detail.expectLoaded(id);
    await expect(detail.name).toHaveText(name);
    await expect(detail.price).toHaveText(price);

    await page.goBack();
    await loggedIn.expectLoaded();
    await loggedIn.titleLink(id).click();
    await detail.expectLoaded(id);
    await expect(detail.name).toHaveText(name);
    await expect(detail.price).toHaveText(price);
  });

  // Replaces manual check: typing /inventory-item.html?id=0 to 5 into the address bar and checking each product loads.
  test('Opening detail pages directly by URL for all six valid ids', async ({ loggedIn, productDetailPage: detail }) => {
    for (const product of Object.values(products)) {
      await detail.goto(product.id);

      await expect(detail.name).toHaveText(product.name);
      await expect(detail.price).toHaveText(product.price);
      await expect(detail.image(product.slug)).toBeVisible();
      await expect(detail.addToCartButton).toBeVisible();
      // The badge is absent, rather than showing 0, when the cart is empty.
      await expect(loggedIn.cartBadge).toHaveCount(0);
    }
  });
});

test.describe('Product detail: cart state', () => {
  // Replaces manual check: adding a product from its detail page, watching the button flip to Remove and the badge appear, then removing it.
  test('Add to cart and Remove toggle on the detail page', async ({ loggedIn, productDetailPage: detail }) => {
    await detail.goto(products.backpack.id);
    // The badge is absent, rather than showing 0, when the cart is empty.
    await expect(loggedIn.cartBadge).toHaveCount(0);

    await detail.addToCart();
    await expect(detail.removeButton).toBeVisible();
    await expect(detail.addToCartButton).toHaveCount(0);
    await expect(loggedIn.cartBadge).toHaveText('1');

    await detail.remove();
    await expect(detail.addToCartButton).toBeVisible();
    await expect(detail.removeButton).toHaveCount(0);
    // The badge disappears rather than showing 0.
    await expect(loggedIn.cartBadge).toHaveCount(0);
  });

  // Replaces manual check: adding three different products from their detail pages and counting the cart badge by eye.
  test('Badge count increments across multiple products', async ({ loggedIn, productDetailPage: detail }) => {
    await detail.goto(products.backpack.id);
    await detail.addToCart();
    await expect(detail.removeButton).toBeVisible();
    await expect(loggedIn.cartBadge).toHaveText('1');

    await detail.backToProducts();
    await loggedIn.expectLoaded();
    await loggedIn.titleLink(products.bikeLight.id).click();
    await detail.expectLoaded(products.bikeLight.id);
    // The Backpack in the cart does not make this product show Remove.
    await expect(detail.addToCartButton).toBeVisible();
    await expect(detail.removeButton).toHaveCount(0);
    await detail.addToCart();
    await expect(detail.removeButton).toBeVisible();
    await expect(loggedIn.cartBadge).toHaveText('2');

    await detail.goto(products.fleeceJacket.id);
    await expect(detail.addToCartButton).toBeVisible();
    await expect(detail.removeButton).toHaveCount(0);
    await detail.addToCart();
    await expect(detail.removeButton).toBeVisible();
    await expect(loggedIn.cartBadge).toHaveText('3');

    await detail.remove();
    await expect(detail.addToCartButton).toBeVisible();
    await expect(loggedIn.cartBadge).toHaveText('2');
  });

  // Replaces manual check: adding on the detail page, returning to the list and checking the card button and badge are consistent.
  test('Detail page add is reflected on the inventory page', async ({ page, loggedIn, productDetailPage: detail }) => {
    await detail.goto(products.backpack.id);
    await detail.addToCart();
    await expect(detail.removeButton).toBeVisible();
    await detail.backToProducts();

    await loggedIn.expectLoaded();
    await expect(page).toHaveURL('/inventory.html');
    // On the inventory page the buttons use per-product data-test values.
    await expect(loggedIn.removeButton(products.backpack.slug)).toBeVisible();
    await expect(loggedIn.addToCartButton(products.backpack.slug)).toHaveCount(0);
    for (const other of Object.values(products).filter((p) => p !== products.backpack)) {
      await expect(loggedIn.addToCartButton(other.slug)).toBeVisible();
    }
    await expect(loggedIn.cartBadge).toHaveText('1');
  });

  // Replaces manual check: adding on the list page, opening the detail page and confirming it offers Remove.
  test('Inventory page add is reflected on the detail page and removable there', async ({ loggedIn, productDetailPage: detail }) => {
    const { id, slug } = products.bikeLight;

    await loggedIn.addToCartButton(slug).click();
    await loggedIn.titleLink(id).click();
    await detail.expectLoaded(id);
    await expect(detail.removeButton).toBeVisible();
    await expect(detail.addToCartButton).toHaveCount(0);
    await expect(loggedIn.cartBadge).toHaveText('1');

    await detail.remove();
    await detail.backToProducts();
    await loggedIn.expectLoaded();
    await expect(loggedIn.addToCartButton(slug)).toBeVisible();
    // The badge is absent, rather than showing 0, when the cart is empty.
    await expect(loggedIn.cartBadge).toHaveCount(0);
  });

  // Replaces manual check: adding two products on detail pages, opening the cart, jumping back to a detail page and removing from there.
  test('Detail page state carries into the cart and back', async ({ loggedIn, cartPage, productDetailPage: detail }) => {
    const { backpack, bikeLight } = products;

    await detail.goto(backpack.id);
    await detail.addToCart();
    await expect(detail.removeButton).toBeVisible();
    await detail.goto(bikeLight.id);
    await detail.addToCart();
    await expect(detail.removeButton).toBeVisible();
    await loggedIn.openCart();

    await cartPage.expectLoaded();
    await expect(cartPage.items).toHaveCount(2);
    await expect(cartPage.itemPrice(backpack.name)).toHaveText(backpack.price);
    await expect(cartPage.itemPrice(bikeLight.name)).toHaveText(bikeLight.price);
    await expect(loggedIn.cartBadge).toHaveText('2');

    await cartPage.titleLink(backpack.id).click();
    await detail.expectLoaded(backpack.id);
    await expect(detail.removeButton).toBeVisible();
    await expect(detail.addToCartButton).toHaveCount(0);
    await expect(loggedIn.cartBadge).toHaveText('2');

    await detail.remove();
    await expect(detail.addToCartButton).toBeVisible();
    await loggedIn.openCart();
    await cartPage.expectLoaded();
    await expect(cartPage.itemNames).toHaveText([bikeLight.name]);
    await expect(loggedIn.cartBadge).toHaveText('1');
  });
});
