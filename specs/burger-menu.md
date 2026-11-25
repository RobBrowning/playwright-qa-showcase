# Sauce Demo Burger Menu Test Plan

## Application Overview

Test plan for the SauceDemo burger menu (the slide-out menu on every logged-in page), explored live on 2026-11-25 as standard_user only. problem_user and error_user are out of scope because their defects are seeded. Locators use getByTestId (attribute data-test) or getByRole only. Every scenario assumes a fresh session, logged in as standard_user on /inventory.html with an empty cart (seed: tests/ui/seed.spec.ts), unless the scenario says otherwise. Each scenario names the manual check it replaces in a "Manual check replaced" line under its header. Scenario 1.3 replaces no manual check: it is marked "not automated", is listed in the "Deliberately not automated" table in docs/test-strategy.md, and must not be generated. Suggested target spec: a single tests/ui/burger-menu.spec.ts with one describe per scenario group (not one file per scenario), plus one new page object src/pages/MenuPage.ts registered in src/fixtures/test.ts (open and close buttons, the item locators, and helpers open(), close(), logout() and resetAppState()). Reuse InventoryPage (cartBadge, addToCart, addToCartButton, removeButton, openCart, expectLoaded), CartPage (items, checkout, expectLoaded), ProductDetailPage (goto) and LoginPage (loginButton, username, password, error) from the fixtures. Not re-planned here because it already exists: login rules and the never-logged-in redirect (tests/ui/login.spec.ts, 'inventory is not reachable without logging in', which asserts loginPage.error with toContainText("You can only access '/inventory.html' when you are logged in")) and cart badge add and remove on the inventory page (tests/ui/inventory.spec.ts, 'cart badge tracks add and remove'). Out of scope on purpose: the fifth menu item "Dynamic Catalog" (see quirk 9). The menu tests have no Cypress twin yet; this is recorded in docs/test-strategy.md.

About leaves the app and navigates to saucelabs.com. Scenario 2.2 asserts the link only: the href https://saucelabs.com/ and the absence of a target attribute (same tab). This is on purpose. CI must not depend on saucelabs.com loading, and the href plus no target attribute covers the manual check of where About goes. About is never clicked and the external site's content is never asserted.

Key data-test values: open button is getByRole('button', {name: 'Open Menu'}) (the button has id react-burger-menu-btn and no data-test; data-test open-menu sits on the img inside it). Close button is getByRole('button', {name: 'Close Menu'}) (id react-burger-cross-btn, no data-test; data-test close-menu is on the img). Menu items (anchors): inventory-sidebar-link (All Items, href #), dynamic-catalog-sidebar-link (Dynamic Catalog, href #, not planned), about-sidebar-link (About, href https://saucelabs.com/), logout-sidebar-link (Logout, href #), reset-sidebar-link (Reset App State, href #). Other values used: shopping-cart-link, shopping-cart-badge (only present when the cart is not empty), add-to-cart-<slug> and remove-<slug> on inventory, continue-shopping and checkout in the cart, login-button, username, password and error on the login page. The menu panel is a wrapper that carries aria-hidden and a slide transform, so closed items report as hidden (use toBeHidden) and a 0.5 second slide means web-first assertions are required.

Observed quirks (third-party behaviour: assert it and leave a comment in the test, do not treat as a defect to fix):
1. The open and close data-test values are on images inside the buttons, not on the buttons, so the buttons must be located by role and name.
2. Reset App State clears the cart badge and the stored cart but does not refresh the current page. Without a reload the inventory cards still show Remove buttons (remove-<slug>) and the cart page still lists the old lines. After a reload cards show Add to cart and the cart is empty.
3. Escape closes the menu, but only once the menu has committed its open state, which is when the items drop tabindex="-1" (about 50 to 70 ms after the click). Escape pressed before that is ignored, and the items already count as visible by then, so toBeVisible is not a valid "open" signal (found during consolidation; MenuPage.open() waits for the tabindex). On desktop, clicking outside the panel did not close it. This is not asserted, because a coordinate click breaks on the ui-mobile project.
4. Keyboard and focus: opening with a mouse click puts focus on the close button, opening with Enter on the open button puts focus on All Items. Tab runs All Items, Dynamic Catalog, About, Logout, Reset App State, close button, then on into the page (not a focus trap). After Escape focus falls to body, not back to the open button.
5. Clicking All Items on /inventory.html, Reset App State, or Dynamic Catalog does not close the menu (All Items on /inventory.html is deliberately not asserted: low value). Navigating to a new page (All Items from cart, detail or checkout) renders the menu closed.
6. About is a plain link with href https://saucelabs.com/ and no target attribute, so it navigates in the same tab and leaves the app. Observed live, not clicked in the test.
7. After Logout the login page shows no error banner and empty fields. Browser back, or going directly to /inventory.html or /cart.html, redirects to / with the banner "Epic sadface: You can only access '/inventory.html' when you are logged in." (the path in the text matches the page requested, for example '/cart.html').
8. The menu button is present on the inventory, cart, product detail and checkout step one pages.
9. Dynamic Catalog, a fifth item not in the requested four, expands extra entries inline (Lazy Load, Spinner, Slider) and leaves the menu open. It is not planned.
10. The browser console logs errors on every page (third-party noise), so tests must not assert an empty console.

## Test Scenarios

### 1. Open and close

**Seed:** `tests/ui/seed.spec.ts`

#### 1.1. Menu opens with the expected items and closes with the X button

**File:** `tests/ui/burger-menu.spec.ts`

**Manual check replaced:** opening the burger menu, reading the four item labels, and closing it with the X.

**Steps:**
  1. On /inventory.html, before opening, look at the menu items (getByTestId inventory-sidebar-link, about-sidebar-link, logout-sidebar-link, reset-sidebar-link).
    - expect: All four items are hidden (toBeHidden)
  2. Click getByRole('button', {name: 'Open Menu'}).
    - expect: inventory-sidebar-link has text 'All Items'
    - expect: about-sidebar-link has text 'About'
    - expect: logout-sidebar-link has text 'Logout'
    - expect: reset-sidebar-link has text 'Reset App State'
    - expect: The Close Menu button is visible
  3. Click getByRole('button', {name: 'Close Menu'}).
    - expect: All four items are hidden again
    - expect: URL is still /inventory.html, six cards, no cart change
    - expect: Comment in the test that open-menu and close-menu are on images inside the buttons (quirk 1)

#### 1.2. Escape closes the menu

**File:** `tests/ui/burger-menu.spec.ts`

**Manual check replaced:** pressing Escape on the open menu to see whether it dismisses. Clicking outside is not asserted (quirk 3: a coordinate click breaks on ui-mobile).

**Steps:**
  1. Open the menu, press Escape.
    - expect: Menu items are hidden
    - expect: URL unchanged
    - expect: Comment that Escape closing is observed third-party behaviour

#### 1.3. Keyboard focus order inside the menu (not automated)

**File:** `tests/ui/burger-menu.spec.ts`

**Manual check replaced:** none. Status: not automated. Do not generate a test for this scenario. Kept here as a record of observed behaviour. Reason: nobody checks the Tab order of a third-party menu by hand in this suite, and focus differs between mouse and keyboard opening (quirk 4). Listed in the 'Deliberately not automated' table in docs/test-strategy.md.

**Steps:**
  1. Focus the open button and press Enter, then press Tab seven times.
    - expect: Focus is on All Items after Enter (after a mouse click it is on the close button)
    - expect: Tab order: Dynamic Catalog, About, Logout, Reset App State, close button, then the sort select and page content
    - expect: After Escape focus is on body

### 2. All Items and About

**Seed:** `tests/ui/seed.spec.ts`

#### 2.1. All Items returns to inventory from cart, product detail and checkout step one

**File:** `tests/ui/burger-menu.spec.ts`

**Manual check replaced:** from the cart, a product page and checkout, using the burger menu to get back to the product list and checking the cart is untouched.

**Steps:**
  1. Add Sauce Labs Backpack (inventoryPage.addToCart). Open the cart (inventoryPage.openCart()). Open the menu, click inventory-sidebar-link.
    - expect: URL is /inventory.html and six inventory-item cards are visible
    - expect: Badge shows 1 and the Backpack card shows remove-sauce-labs-backpack
    - expect: Menu is closed on the new page
  2. Go to /inventory-item.html?id=4 (productDetailPage.goto(4)), open the menu, click inventory-sidebar-link.
    - expect: URL is /inventory.html and six cards are visible
    - expect: Badge still shows 1
  3. Open the cart, click checkout (cartPage.checkout()) to reach /checkout-step-one.html, open the menu, click inventory-sidebar-link.
    - expect: URL is /inventory.html and six cards are visible
    - expect: Badge still shows 1
    - expect: Run the three origins as one test with three steps or one data-driven loop, not three files

#### 2.2. About links to saucelabs.com

**File:** `tests/ui/burger-menu.spec.ts`

**Manual check replaced:** opening the menu and checking where About points. Assert the href and the absence of a target attribute only, because CI must not depend on saucelabs.com loading. Do not click About and never assert the external site's content.

**Steps:**
  1. Open the menu and read about-sidebar-link.
    - expect: href attribute equals 'https://saucelabs.com/'
    - expect: No target attribute, so it opens in the same tab
    - expect: Comment that About leaves the app, in the same tab, to a third-party site (quirk 6), which is why it is not clicked

### 3. Logout

**Seed:** `tests/ui/seed.spec.ts`

#### 3.1. Logout returns to the login page and protected pages are no longer reachable

**File:** `tests/ui/burger-menu.spec.ts`

**Manual check replaced:** logging out through the menu, then pressing browser back and typing /inventory.html and /cart.html to confirm they are blocked. tests/ui/login.spec.ts 'inventory is not reachable without logging in' covers never having logged in. This covers a session ended by Logout. Login rules are not re-planned. Reuse the error assertion from login.spec.ts line 41: expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in"), and the same form with '/cart.html'.

**Steps:**
  1. Open the menu and click logout-sidebar-link.
    - expect: URL is / and loginPage.loginButton is visible
    - expect: username and password fields are empty
    - expect: getByTestId('error') is not present (quirk 7)
  2. Use browser back (page.goBack()).
    - expect: Redirected to / (login page), /inventory.html content not shown
    - expect: loginPage.error contains: You can only access '/inventory.html' when you are logged in (full banner observed: Epic sadface: You can only access '/inventory.html' when you are logged in.)
  3. Go directly to /inventory.html, then /cart.html.
    - expect: Each redirects to / with the banner naming its own path, for example: You can only access '/cart.html' when you are logged in
    - expect: Comment that the banner wording is third party

### 4. Reset App State

**Seed:** `tests/ui/seed.spec.ts`

#### 4.1. Reset App State: stale page until reload, then a clean cart

**File:** `tests/ui/burger-menu.spec.ts`

**Manual check replaced:** filling the cart, choosing Reset App State, checking the badge and button labels without refreshing, then refreshing and checking the cart page and buttons. Badge add and remove itself is covered by tests/ui/inventory.spec.ts and is not re-tested. Third-party quirk 2: assert the stale state and comment it, do not fix it.

**Steps:**
  1. On /inventory.html add Sauce Labs Backpack and Sauce Labs Bike Light. Open the menu, click reset-sidebar-link. Do not reload.
    - expect: Badge is gone (shopping-cart-badge not present)
    - expect: URL unchanged and the menu stays open (quirk 5)
    - expect: remove-sauce-labs-backpack and remove-sauce-labs-bike-light are still shown and add-to-cart-sauce-labs-backpack is absent (stale, quirk 2)
  2. Reload the page.
    - expect: add-to-cart-sauce-labs-backpack and add-to-cart-sauce-labs-bike-light are shown and the remove buttons are gone
    - expect: No shopping-cart-badge
  3. Open the cart.
    - expect: cartPage.items count is 0
  4. Optional second pass in the same test: add Backpack, open the cart, open the menu, click reset-sidebar-link without reloading.
    - expect: Badge is gone but the cart still lists Sauce Labs Backpack (stale)
    - expect: After page.reload() the cart lists no items
