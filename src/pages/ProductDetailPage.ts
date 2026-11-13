import { type Locator, type Page, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly container: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  // The detail page uses the generic data-test values add-to-cart and remove,
  // unlike the inventory and cart pages, which append a product slug.
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(private readonly page: Page) {
    this.container = page.getByTestId('inventory-item');
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backButton = page.getByRole('button', { name: 'Back to products' });
  }

  /** The product image. Its data-test is item-<slug>-img on this page. */
  image(slug: string): Locator {
    return this.page.getByTestId(`item-${slug}-img`);
  }

  async goto(id: number): Promise<void> {
    await this.page.goto(`/inventory-item.html?id=${id}`);
    await this.expectLoaded(id);
  }

  /**
   * SauceDemo is a single-page app: the URL changes before the detail view
   * renders, so name and price locators can briefly match all inventory cards.
   * Waiting for exactly one product container means the detail view is shown.
   */
  async expectLoaded(id?: number): Promise<void> {
    if (id !== undefined) {
      await expect(this.page).toHaveURL(`/inventory-item.html?id=${id}`);
    } else {
      await expect(this.page).toHaveURL(/inventory-item\.html/);
    }
    await expect(this.container).toHaveCount(1);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async remove(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
