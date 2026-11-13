# Sauce Demo Product Detail Page Test Plan

## Application Overview

Test plan for the SauceDemo product detail page (/inventory-item.html?id=N), explored live on 2026-11-13 as standard_user only. problem_user and error_user are out of scope because their defects are seeded. Locators use getByTestId (attribute data-test) or getByRole only. Every scenario assumes a fresh session, logged in as standard_user on /inventory.html with an empty cart (seed: tests/ui/seed.spec.ts), unless the scenario says otherwise. Each scenario names the manual check it replaces in a "Manual check replaced" line under its header. Scenarios 2.6, 3.2 and 4.3 replace no manual check: they are marked "not automated", are listed in the "Deliberately not automated" table in docs/test-strategy.md, and must not be generated.

Product id map observed: 0 Sauce Labs Bike Light ($9.99), 1 Sauce Labs Bolt T-Shirt ($15.99), 2 Sauce Labs Onesie ($7.99), 3 Test.allTheThings() T-Shirt (Red) ($15.99), 4 Sauce Labs Backpack ($29.99), 5 Sauce Labs Fleece Jacket ($49.99).

Key data-test values on the detail page: back-to-products (button, role button name "Back to products"), inventory-item (container), inventory-item-name, inventory-item-desc, inventory-item-price, item-<slug>-img (image, for example item-sauce-labs-backpack-img), add-to-cart (button, generic id, no product slug), remove (button, generic id, shown after adding), shopping-cart-link, shopping-cart-badge (only present when the cart is not empty). On the inventory page: item-N-title-link and item-N-img-link (N is the product id), add-to-cart-<slug> and remove-<slug>. In the cart: remove-<slug>, continue-shopping, checkout. Login error banner: error.

Observed quirks (third-party behaviour: assert it and leave a comment in the test, do not treat as a defect to fix):
1. Invalid id (6, 99, 99999, -1, abc), empty id (?id=) and a missing query string all render the same page: no redirect, no error banner, name "ITEM NOT FOUND", price "$√-1", a phone-call style apology as the description, image item-item-not-found-img, and a working back-to-products button.
2. The ITEM NOT FOUND page still offers add-to-cart. Clicking it switches to remove and raises shopping-cart-badge, but /cart.html does not list any extra line (badge 2, one cart line). Clicking remove lowers the badge again.
3. Lenient id parsing: ?id=01, ?id=1.5 and ?id=1&id=2 all show product 1 (Bolt T-Shirt).
4. On the detail page, the add and remove buttons use the generic data-test values add-to-cart and remove, whereas inventory and cart use add-to-cart-<slug> and remove-<slug>.
5. Logged-out access to /inventory-item.html (valid or invalid id) redirects to / with the banner "Epic sadface: You can only access '/inventory-item.html' when you are logged in."
6. Cart state survives full page loads and direct URL navigation within the same session.
7. The browser console logs a "Permissions policy violation: unload is not allowed" error on every page. This is third-party noise, so tests must not assert an empty console.

## Test Scenarios

### 1. Detail page content

**Seed:** `tests/ui/seed.spec.ts`

#### 1.1. Detail content matches the inventory card for each product

**File:** `tests/ui/product-detail/content.spec.ts`

**Manual check replaced:** eyeballing that name, description, price and image on the detail page match the inventory card for several products.

**Steps:**
  1. On /inventory.html, read the text of inventory-item-name, inventory-item-desc and inventory-item-price, and the src of the image, for the Sauce Labs Backpack card. Click its name link (getByTestId item-4-title-link).
    - expect: URL is /inventory-item.html?id=4
    - expect: inventory-item-name equals 'Sauce Labs Backpack'
    - expect: inventory-item-desc and inventory-item-price ($29.99) equal the card values
    - expect: image item-sauce-labs-backpack-img is visible and its src equals the card image src
  2. Click back-to-products. Repeat for Sauce Labs Bike Light (item-0-title-link, id 0, $9.99) and Sauce Labs Fleece Jacket (item-5-title-link, id 5, $49.99).
    - expect: Name, description, price and image src on each detail page match the corresponding inventory card
    - expect: Each page shows exactly one inventory-item container

#### 1.2. Product image link opens the same detail page as the name link

**File:** `tests/ui/product-detail/open-by-image.spec.ts`

**Manual check replaced:** clicking a product picture instead of its name to confirm both open the detail page.

**Steps:**
  1. On /inventory.html click the image link (getByTestId item-1-img-link) for Sauce Labs Bolt T-Shirt.
    - expect: URL is /inventory-item.html?id=1
    - expect: inventory-item-name is 'Sauce Labs Bolt T-Shirt' and inventory-item-price is $15.99
  2. Go back, then click item-1-title-link.
    - expect: Same URL and same content as the image link route

#### 1.3. Opening detail pages directly by URL for all six valid ids

**File:** `tests/ui/product-detail/direct-url.spec.ts`

**Manual check replaced:** typing /inventory-item.html?id=0 to 5 into the address bar and checking each product loads. (Could be merged into scenario 1.1 as a data-driven loop.)

**Steps:**
  1. For each id 0 to 5, go to /inventory-item.html?id=N while logged in.
    - expect: Page renders without redirect
    - expect: Name, price and image match the id map in the overview
    - expect: The button shown is add-to-cart and no shopping-cart-badge is present

### 2. Cart state on the detail page

**Seed:** `tests/ui/seed.spec.ts`

#### 2.1. Add to cart and Remove toggle on the detail page

**File:** `tests/ui/product-detail/add-remove.spec.ts`

**Manual check replaced:** adding a product from its detail page, watching the button flip to Remove and the badge appear, then removing it.

**Steps:**
  1. Open /inventory-item.html?id=4. Confirm no shopping-cart-badge. Click add-to-cart.
    - expect: add-to-cart is replaced by remove
    - expect: shopping-cart-badge shows 1
  2. Click remove.
    - expect: remove is replaced by add-to-cart
    - expect: shopping-cart-badge is no longer present (badge disappears rather than showing 0)

#### 2.2. Badge count increments across multiple products

**File:** `tests/ui/product-detail/badge-count.spec.ts`

**Manual check replaced:** adding three different products from their detail pages and counting the cart badge by eye.

**Steps:**
  1. Open id=4 and click add-to-cart. Click back-to-products. Open id=0 via item-0-title-link and click add-to-cart. Open id=5 and click add-to-cart.
    - expect: Badge shows 1, then 2, then 3 after each add
    - expect: Each detail page shows remove for its own product only
  2. Click remove on the id=5 page.
    - expect: Badge shows 2

#### 2.3. Detail page add is reflected on the inventory page

**File:** `tests/ui/product-detail/state-to-inventory.spec.ts`

**Manual check replaced:** adding on the detail page, returning to the list and checking the card button and badge are consistent.

**Steps:**
  1. Open id=4, click add-to-cart, then click back-to-products.
    - expect: URL is /inventory.html
    - expect: The Backpack card shows remove-sauce-labs-backpack and no add-to-cart-sauce-labs-backpack
    - expect: Other cards still show their add-to-cart-<slug> buttons
    - expect: Badge shows 1

#### 2.4. Inventory page add is reflected on the detail page and removable there

**File:** `tests/ui/product-detail/state-from-inventory.spec.ts`

**Manual check replaced:** adding on the list page, opening the detail page and confirming it offers Remove.

**Steps:**
  1. On /inventory.html click add-to-cart-sauce-labs-bike-light, then open its detail page via item-0-title-link.
    - expect: Detail page shows remove (not add-to-cart)
    - expect: Badge shows 1
  2. Click remove, then click back-to-products.
    - expect: Bike Light card shows add-to-cart-sauce-labs-bike-light again
    - expect: shopping-cart-badge is absent

#### 2.5. Detail page state carries into the cart and back

**File:** `tests/ui/product-detail/state-to-cart.spec.ts`

**Manual check replaced:** adding two products on detail pages, opening the cart, jumping back to a detail page and removing from there.

**Steps:**
  1. Open id=4 and click add-to-cart. Open id=0 and click add-to-cart. Click shopping-cart-link.
    - expect: URL is /cart.html
    - expect: Cart lists Sauce Labs Backpack and Sauce Labs Bike Light with prices $29.99 and $9.99
    - expect: Badge shows 2
  2. In the cart click the Backpack name link (item-4-title-link).
    - expect: URL is /inventory-item.html?id=4
    - expect: Detail page shows remove
    - expect: Badge shows 2
  3. Click remove, then open shopping-cart-link.
    - expect: Cart lists only Sauce Labs Bike Light
    - expect: Badge shows 1

#### 2.6. Cart state persists across reload and direct URL navigation

**File:** `tests/ui/product-detail/persistence.spec.ts`

**Manual check replaced:** none.

**Status:** not automated. Listed in the "Deliberately not automated" table in docs/test-strategy.md. Do not generate a test for this scenario. Kept here as a record of observed behaviour. Reason: it exercises the demo app's client-side storage rather than a user journey, and cross-page cart state is already covered by 2.3 to 2.5.

**Steps:**
  1. Open id=4, click add-to-cart, then reload the page and also goto /inventory-item.html?id=4 afresh.
    - expect: remove is still shown and badge still shows 1 (state survives full page loads in the same session)

### 3. Navigation

**Seed:** `tests/ui/seed.spec.ts`

#### 3.1. Back to products returns to inventory

**File:** `tests/ui/product-detail/back-to-products.spec.ts`

**Manual check replaced:** clicking Back to products from a detail page and checking the list page loads.

**Steps:**
  1. Open id=2 (Onesie). Click getByRole('button', {name: 'Back to products'}) (data-test back-to-products).
    - expect: URL is /inventory.html
    - expect: All six inventory-item cards are visible
  2. Repeat after opening a detail page by direct URL with no prior inventory visit in that page.
    - expect: Same result: lands on /inventory.html

#### 3.2. Browser back from detail page

**File:** `tests/ui/product-detail/browser-back.spec.ts`

**Manual check replaced:** none.

**Status:** not automated. Listed in the "Deliberately not automated" table in docs/test-strategy.md. Do not generate a test for this scenario. Kept here as a record of observed behaviour. Reason: browser history behaviour, not product logic. The app's own navigation is covered by 3.1.

**Steps:**
  1. From inventory click item-4-title-link, then use browser back.
    - expect: Returns to /inventory.html with six cards visible

### 4. Invalid ids and access control (observed behaviour)

**Seed:** `tests/ui/seed.spec.ts`

#### 4.1. Invalid numeric or text id shows ITEM NOT FOUND page

**File:** `tests/ui/product-detail/invalid-id.spec.ts`

**Manual check replaced:** hand-editing the id in the URL to a bad value and recording what the page shows. Observed quirk 1.

**Steps:**
  1. Go to /inventory-item.html?id=6, then ?id=99999, then ?id=-1, then ?id=abc.
    - expect: No redirect: URL keeps the query string
    - expect: inventory-item-name is 'ITEM NOT FOUND'
    - expect: inventory-item-price is '$√-1'
    - expect: inventory-item-desc starts with 'We're sorry, but your call could not be completed as dialled'
    - expect: Image is item-item-not-found-img
    - expect: back-to-products and add-to-cart buttons are present
    - expect: Comment in the test that this is an observed demo-app quirk

#### 4.2. Missing or empty id behaves like an invalid id

**File:** `tests/ui/product-detail/missing-id.spec.ts`

**Manual check replaced:** loading /inventory-item.html with no id and noting the result. Observed quirk 1.

**Steps:**
  1. Go to /inventory-item.html with no query, then /inventory-item.html?id=.
    - expect: Both render the same ITEM NOT FOUND page as an invalid id
    - expect: No error banner and no redirect

#### 4.3. Lenient id parsing resolves to a real product

**File:** `tests/ui/product-detail/id-parsing.spec.ts`

**Manual check replaced:** none.

**Status:** not automated. Listed in the "Deliberately not automated" table in docs/test-strategy.md. Do not generate a test for this scenario. Kept here as a record of observed behaviour. Reason: a third-party parsing detail with no user-facing value (observed quirk 3). Asserting it would pin behaviour nobody checks by hand.

**Steps:**
  1. Go to ?id=01, then ?id=1.5, then ?id=1&id=2.
    - expect: Each shows Sauce Labs Bolt T-Shirt ($15.99), the product with id 1

#### 4.4. Add to cart on ITEM NOT FOUND page inflates badge without a real cart line

**File:** `tests/ui/product-detail/invalid-id-cart.spec.ts`

**Manual check replaced:** adding from the not-found page and comparing the badge with the cart contents. Observed quirk 2.

**Steps:**
  1. Add Sauce Labs Bike Light from its detail page (badge 1). Go to ?id=99 and click add-to-cart.
    - expect: Button changes to remove and badge shows 2
  2. Open shopping-cart-link.
    - expect: Cart lists only Sauce Labs Bike Light (one line) while badge shows 2
    - expect: Comment in the test that badge and cart disagree because of the demo app
  3. Return to ?id=99 and click remove.
    - expect: Badge returns to 1

#### 4.5. Logged-out direct access to a detail page is blocked

**File:** `tests/ui/product-detail/logged-out.spec.ts`

**Manual check replaced:** pasting a detail page URL into a logged-out browser and confirming it is not shown.

**Known gap:** the planner did not verify where logging in lands after this redirect (back on /inventory-item.html?id=4, or on /inventory.html). Do not assert the post-login destination until that has been explored and added to this plan.

**Steps:**
  1. Start with a fresh context with no login. Go to /inventory-item.html?id=4.
    - expect: Redirected to /
    - expect: getByTestId('error') shows "Epic sadface: You can only access '/inventory-item.html' when you are logged in."
    - expect: Product content is not shown
  2. Repeat with ?id=99 (invalid id), and again after logging out via logout-sidebar-link from the inventory page.
    - expect: Same redirect and error message: the login check happens before the id is evaluated
