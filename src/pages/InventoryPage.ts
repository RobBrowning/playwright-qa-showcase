import { type Locator, type Page, expect } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  /** The product name link that opens the detail page. N is the product id. */
  titleLink(id: number): Locator {
    return this.page.getByTestId(`item-${id}-title-link`);
  }

  /** The product image link that opens the detail page. N is the product id. */
  imageLink(id: number): Locator {
    return this.page.getByTestId(`item-${id}-img-link`);
  }

  /** The card's Add to cart button. The inventory page appends the product slug to its data-test. */
  addToCartButton(slug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  /** The card's Remove button, shown once the product is in the cart. Also slug-suffixed. */
  removeButton(slug: string): Locator {
    return this.page.getByTestId(`remove-${slug}`);
  }

  itemDescription(name: string): Locator {
    return this.item(name).getByTestId('inventory-item-desc');
  }

  itemPrice(name: string): Locator {
    return this.item(name).getByTestId('inventory-item-price');
  }

  /** The card image. Its data-test is inventory-item-<slug>-img, unlike the detail page's item-<slug>-img. */
  itemImage(slug: string): Locator {
    return this.page.getByTestId(`inventory-item-${slug}-img`);
  }

  async addToCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async prices(): Promise<number[]> {
    const raw = await this.itemPrices.allTextContents();
    return raw.map((p) => Number(p.replace('$', '')));
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
