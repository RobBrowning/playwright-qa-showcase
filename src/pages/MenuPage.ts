import { type Locator, type Page, expect } from '@playwright/test';

/**
 * The burger menu, present on every logged-in page (inventory, cart, product
 * detail, checkout). Business assertions about what the menu does live in the
 * spec, not here.
 */
export class MenuPage {
  // SauceDemo puts the open-menu and close-menu data-test values on the images
  // inside the buttons, not on the buttons, so the buttons are found by role.
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetLink: Locator;

  constructor(page: Page) {
    this.openButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeButton = page.getByRole('button', { name: 'Close Menu' });
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetLink = page.getByTestId('reset-sidebar-link');
  }

  /** The four menu items this suite covers. Dynamic Catalog is out of scope (specs/burger-menu.md). */
  get items(): Locator[] {
    return [this.allItemsLink, this.aboutLink, this.logoutLink, this.resetLink];
  }

  /**
   * Opens the menu and waits until it is really open. The items count as
   * visible as soon as the panel starts to slide, but the menu ignores Escape
   * until its open state is committed, which is when the items drop
   * tabindex="-1". Waiting for visibility alone made Escape flaky.
   */
  async open(): Promise<void> {
    await this.openButton.click();
    await expect(this.allItemsLink).toBeVisible();
    await expect(this.allItemsLink).not.toHaveAttribute('tabindex', '-1');
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async allItems(): Promise<void> {
    await this.open();
    await this.allItemsLink.click();
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.open();
    await this.resetLink.click();
  }
}
