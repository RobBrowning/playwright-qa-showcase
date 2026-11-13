import { type Locator, type Page, expect } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  /** The product name link that opens the detail page. Same data-test as on the inventory page. */
  titleLink(id: number): Locator {
    return this.page.getByTestId(`item-${id}-title-link`);
  }

  itemPrice(name: string): Locator {
    return this.items.filter({ hasText: name }).getByTestId('inventory-item-price');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
