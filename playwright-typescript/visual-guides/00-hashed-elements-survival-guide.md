# Hashed Elements Survival Guide
## The entry point: open this first when you can't find an element

---

## 1. What "Hashed Elements" Means

Modern UI frameworks — React with CSS Modules, Material UI, styled-components, Tailwind's JIT engine, and others — generate class names and IDs at build time. The same button in your app looks like this across three consecutive builds:

```
Build 1:  <button id="btn_a3f9c2"  class="MuiButton-root btn_8x9k2z styles__primaryBtn___3Fk2">Submit Order</button>
Build 2:  <button id="btn_7d2e11"  class="MuiButton-root btn_4p1w9c styles__primaryBtn___9Qm7">Submit Order</button>
Build 3:  <button id="btn_bb04f8"  class="MuiButton-root btn_0r6j3a styles__primaryBtn___1Yx5">Submit Order</button>
                   ^^^^^^^^^^^            ^^^^^^^^^^^^^ ^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^
                   changes every build    lib class     hash changes  CSS Module hash changes
```

Frameworks do this because the hash encodes the content of the CSS rule — so two components can use `.container` without colliding, and the browser can bust stale caches automatically. The result: any test that targets `#btn_a3f9c2` or `.btn_8x9k2z` will pass today and fail tomorrow. CSS-selector-based locators are brittle by design in these stacks. You need a different approach.

---

## 2. The Master Decision Flowchart

Work through this top to bottom. Stop at the first YES branch.

```
START: I need to locate an element but can't use its class or ID
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Does the element have data-testid (or          │
│  data-test-id / data-test / data-cy)?           │
└─────────────────────────────────────────────────┘
         │
    YES ─┤─ NO
         │    │
         ▼    ▼
  getByTestId()    ┌──────────────────────────────────────────────┐
  ✅ DONE          │  Does it have a meaningful ARIA role AND a    │
                   │  readable accessible name?                    │
                   │  (button, link, checkbox, textbox, heading…)  │
                   └──────────────────────────────────────────────┘
                            │
                       YES ─┤─ NO
                            │    │
                            ▼    ▼
                    getByRole()    ┌──────────────────────────────────────┐
                    ✅ DONE        │  Is the element associated with a     │
                                   │  <label> element or aria-label attr?  │
                                   └──────────────────────────────────────┘
                                            │
                                       YES ─┤─ NO
                                            │    │
                                            ▼    ▼
                                    getByLabel()    ┌───────────────────────────────────┐
                                    ✅ DONE          │  Does it have unique visible text  │
                                                     │  that won't change often?          │
                                                     └───────────────────────────────────┘
                                                              │
                                                         YES ─┤─ NO
                                                              │    │
                                                              ▼    ▼
                                                     getByText()    ┌──────────────────────────────────┐
                                                     ✅ DONE        │  Does it have a placeholder,      │
                                                                    │  alt text, or title attribute?    │
                                                                    └──────────────────────────────────┘
                                                                             │
                                                                        YES ─┤─ NO
                                                                             │    │
                                                                             ▼    ▼
                                                              getByPlaceholder()   ┌────────────────────────────────┐
                                                              getByAltText()       │  Is it a React or Vue component │
                                                              getByTitle()         │  with a known component name?  │
                                                              ✅ DONE              └────────────────────────────────┘
                                                                                            │
                                                                                       YES ─┤─ NO
                                                                                            │    │
                                                                                            ▼    ▼
                                                                               _react= / _vue=    ┌──────────────────────────────────┐
                                                                               locator            │  Is the element spatially near a  │
                                                                               ✅ DONE            │  stable, uniquely-identified one? │
                                                                                                  └──────────────────────────────────┘
                                                                                                           │
                                                                                                      YES ─┤─ NO
                                                                                                           │    │
                                                                                                           ▼    ▼
                                                                                          :right-of()         ┌───────────────────────────────────┐
                                                                                          :left-of()          │  Is it in a list/table row where   │
                                                                                          :above()            │  another cell has unique text?     │
                                                                                          :below()            └───────────────────────────────────┘
                                                                                          :near()                      │
                                                                                          ✅ DONE               YES ─┤─ NO
                                                                                                                      │    │
                                                                                                                      ▼    ▼
                                                                                               .filter({ hasText })    Use codegen / Inspector:
                                                                                               + .getByRole()          npx playwright codegen
                                                                                               ✅ DONE                 npx playwright test --debug
                                                                                                                       page.evaluate() as last resort
                                                                                                                       → Then ask devs for data-testid
```

---

## 3. Strategy Quick-Reference Table

| # | Strategy | Method | Works when | Breaks when |
|---|----------|--------|------------|-------------|
| 1 | **Test ID** | `getByTestId("name")` | Dev added `data-testid` attribute | Attribute is renamed or removed |
| 2 | **ARIA role** | `getByRole("button", { name: "Save" })` | Element has semantic role + accessible name | Name changes (copy/i18n change), role is `generic` |
| 3 | **Label** | `getByLabel("Email")` | Form control has `<label>` or `aria-label` | Label text changes |
| 4 | **Visible text** | `getByText("Submit Order")` | Element contains unique, stable text | Copy changes, translations, duplicate text |
| 5 | **Placeholder** | `getByPlaceholder("Enter email")` | Input has `placeholder` attribute | Placeholder text changes |
| 6 | **Alt text** | `getByAltText("Company logo")` | Image has descriptive `alt` attribute | Alt text changes |
| 7 | **React component** | `locator("_react=MyComponent")` | React DevTools accessible; known component name | Non-React app; component is renamed |
| 8 | **Vue component** | `locator("_vue=my-component")` | Vue DevTools accessible; known component name | Non-Vue app; component is renamed |
| 9 | **Layout / proximity** | `:right-of()`, `:near()`, `:above()`, `:below()` | Element has no own identifiers but stable neighbor | Neighbor moves; layout changes |
| 10 | **Filter + chain** | `.filter({ hasText: "..." }).getByRole(...)` | List/table row — identify row by text, action by role | Row text changes; multiple rows with same text |

---

## 4. The "Last Resort" Toolkit

Reach for these only after all strategies above have failed.

### 4a. `page.evaluate()` — query the DOM directly

```typescript
// Find a button by its inner text when no stable locator exists
const button = page.locator('button').filter({
  has: page.locator(':text("Confirm deletion")')
});

// Or use evaluate() to search by attribute value
const handle = await page.evaluateHandle(() => {
  return Array.from(document.querySelectorAll('button')).find(
    (el) => el.textContent?.trim() === 'Confirm deletion'
  );
});
const locator = page.locator('button').filter({ hasText: 'Confirm deletion' });
await locator.click();
```

```typescript
// Find element by partial attribute value (when attr name is stable but value is dynamic)
const el = await page.evaluateHandle(() =>
  document.querySelector('[data-component="ActionButton"]')
);
```

### 4b. Screenshot + Inspector workflow

```bash
# Run with pause — opens a headed browser you can inspect manually
npx playwright test --debug

# Or generate a locator interactively from the live page
npx playwright codegen https://your-app.com

# The Inspector highlights and suggests locators as you hover elements
# Copy the suggested locator directly into your test
```

### 4c. Pause inside a test for manual inspection

```typescript
test('debug helper', async ({ page }) => {
  await page.goto('/checkout');
  await page.pause();  // opens Inspector — inspect the element, copy the locator
});
```

### 4d. Dump all attributes of a candidate element

```typescript
// When you can partially identify an element, log all its attributes to find a stable one
const attrs = await page.locator('button:near(text("Price"))').first().evaluate((el) => {
  const result: Record<string, string> = {};
  for (const attr of el.attributes) {
    result[attr.name] = attr.value;
  }
  return result;
});
console.log(attrs);
// Output might reveal: { 'data-action': 'confirm', 'aria-label': 'Confirm price' }
// Now you have a stable anchor
```

---

## 5. Proactive Solution: Ask for `data-testid`

The strategies above are workarounds. The real fix is a 30-second change by a developer.

### Why `data-testid` is the correct answer

- It is invisible to users and does not affect styling or behavior.
- It survives refactors, CSS changes, and copy rewrites.
- It communicates intent: "this element is tested."
- It is the approach recommended in the Playwright, Testing Library, and Cypress documentation.

### Template message to send to the developer

```
Hi [dev name],

Could you add a `data-testid` attribute to the following elements?
I need them for our Playwright end-to-end tests — the current class
names/IDs are generated at build time and change between builds,
which makes the tests unreliable.

Elements needed:
  1. The "Submit Order" button on the checkout page
     Suggested value: data-testid="submit-order-btn"

  2. The "Edit" action button in each row of the orders table
     Suggested value: data-testid="order-row-edit-btn"

  3. The email field in the registration form
     Suggested value: data-testid="register-email-input"

No behaviour changes needed — just the attribute. Takes about 1 minute.
Thanks!
```

### Naming convention to request

```
data-testid="[feature]-[element-type]-[variant?]"

Examples:
  data-testid="checkout-submit-btn"
  data-testid="nav-home-link"
  data-testid="profile-avatar-img"
  data-testid="order-row-edit-btn"
  data-testid="search-input"
```

---

## 6. Five Complete Worked Examples

---

### Example 1: MUI DataGrid — Row Action Button

**Scenario:** A Material UI DataGrid renders an "Edit" icon button in each row. The button has class names like `MuiButtonBase-root MuiIconButton-root btn_9xk2z` — all hashed.

**HTML (simplified):**
```html
<div role="row" data-rowindex="3">
  <div role="gridcell">Juan Garcia</div>
  <div role="gridcell">juan@example.com</div>
  <div role="gridcell">
    <button class="MuiButtonBase-root MuiIconButton-root btn_9xk2z" aria-label="Edit row">
      <!-- SVG icon -->
    </button>
  </div>
</div>
```

**Strategy:** The row is identified by visible text (customer name). The button is identified by its `aria-label`. Chain `.filter()` to scope to the right row, then `getByRole()` to get the button.

```typescript
import { test, expect } from '@playwright/test';

test('edit order row for Juan Garcia', async ({ page }) => {
  await page.goto('/orders');

  // 1. Find the row that contains "Juan Garcia"
  const row = page.getByRole('row').filter({ hasText: 'Juan Garcia' });

  // 2. Within that row, find the Edit button by its accessible name
  const editButton = row.getByRole('button', { name: 'Edit row' });

  // 3. Confirm it exists and click
  await expect(editButton).toBeVisible();
  await editButton.click();

  await expect(page.getByRole('dialog', { name: 'Edit Order' })).toBeVisible();
});
```

**Why this works:** `getByRole('row').filter({ hasText: 'Juan Garcia' })` scopes to one row regardless of which index it sits at. The button's `aria-label` is stable because it is hand-written for accessibility, not generated by the build tool.

---

### Example 2: styled-components Form Field

**Scenario:** A registration form uses styled-components. The `<input>` has no `id`, no `data-testid`, and its class is `sc-bcXHqe hGriGX`. However, the field does have an associated `<label>`.

**HTML (simplified):**
```html
<div>
  <label for="sc-input-2">Email address</label>
  <input
    id="sc-input-2"
    class="sc-bcXHqe hGriGX"
    type="email"
    placeholder="you@example.com"
  />
</div>
```

**Strategy:** `getByLabel()` links the input to its label text. The generated `id` on the input and the `for` attribute on the label are paired by the framework — Playwright's `getByLabel()` follows that link automatically.

```typescript
import { test, expect } from '@playwright/test';

test('fill in email field', async ({ page }) => {
  await page.goto('/register');

  // getByLabel resolves the label→input association regardless of generated id
  const emailInput = page.getByLabel('Email address');

  await emailInput.fill('test@example.com');
  await expect(emailInput).toHaveValue('test@example.com');
});
```

**Fallback** if the `<label>` is missing or not properly associated:

```typescript
// Use placeholder as the fallback anchor
const emailInput = page.getByPlaceholder('you@example.com');
await emailInput.fill('test@example.com');
```

---

### Example 3: CSS Modules Navigation Link

**Scenario:** A Next.js app uses CSS Modules. The nav links have classes like `styles__navLink___2Bk9 styles__active___7pQr`. There is no `data-testid`.

**HTML (simplified):**
```html
<nav>
  <a href="/about" class="styles__navLink___2Bk9">About Us</a>
  <a href="/pricing" class="styles__navLink___2Bk9">Pricing</a>
  <a href="/contact" class="styles__navLink___2Bk9 styles__active___7pQr">Contact</a>
</nav>
```

**Strategy:** Links have an implicit ARIA role of `link`. Use `getByRole('link', { name: '...' })` — the visible text is the accessible name.

```typescript
import { test, expect } from '@playwright/test';

test('navigate to Pricing page', async ({ page }) => {
  await page.goto('/');

  // Role = 'link', accessible name = visible text. CSS classes are irrelevant.
  const pricingLink = page.getByRole('link', { name: 'Pricing' });

  await expect(pricingLink).toBeVisible();
  await pricingLink.click();

  await expect(page).toHaveURL('/pricing');
});

test('About link is present in nav', async ({ page }) => {
  await page.goto('/');

  // Scope to <nav> first to avoid matching links elsewhere on the page
  const nav = page.locator('nav');
  const aboutLink = nav.getByRole('link', { name: 'About Us' });

  await expect(aboutLink).toBeVisible();
});
```

---

### Example 4: React Component in a List

**Scenario:** A product listing renders `<ProductCard>` components. Each card has a hashed wrapper class. You need to click "Add to cart" on the card for a specific product.

**HTML (simplified, rendered output):**
```html
<div class="sc-aXZVg eQYiom">   <!-- ProductCard wrapper, hashed -->
  <h3>Wireless Headphones</h3>
  <p>$79.99</p>
  <button class="sc-gEvEer kLmNpQ">Add to cart</button>
</div>
<div class="sc-aXZVg eQYiom">
  <h3>Mechanical Keyboard</h3>
  <p>$129.99</p>
  <button class="sc-gEvEer kLmNpQ">Add to cart</button>
</div>
```

**Strategy A — filter by card text, then get button by role (recommended):**

```typescript
import { test, expect } from '@playwright/test';

test('add Wireless Headphones to cart', async ({ page }) => {
  await page.goto('/products');

  // Identify the card that contains the product name
  const headphonesCard = page.locator('div').filter({ hasText: 'Wireless Headphones' })
    .filter({ hasText: '$79.99' }); // narrow further if needed

  // Get the button inside that specific card
  const addToCartBtn = headphonesCard.getByRole('button', { name: 'Add to cart' });

  await addToCartBtn.click();
  await expect(page.getByText('1 item in cart')).toBeVisible();
});
```

**Strategy B — React locator (if devtools accessible, e.g. dev/staging build):**

```typescript
test('add to cart via React component locator', async ({ page }) => {
  await page.goto('/products');

  // Target the ProductCard component that contains a specific heading
  const card = page.locator('_react=ProductCard').filter({ hasText: 'Wireless Headphones' });
  await card.getByRole('button', { name: 'Add to cart' }).click();
});
```

---

### Example 5: Element Identified Only by Proximity to a Label

**Scenario:** A settings page has a toggle switch with no accessible name, no `data-testid`, and no visible text. The only stable nearby element is a `<span>` with the label text "Enable notifications".

**HTML (simplified):**
```html
<div class="styles__settingRow___4Gk9">
  <span class="styles__label___1Qj2">Enable notifications</span>
  <div class="styles__toggleWrapper___8Rp1">
    <input type="checkbox" class="styles__toggle___2Xz7" />
    <div class="styles__toggleThumb___9Bq4"></div>
  </div>
</div>
```

**Strategy:** Use `:right-of()` or `.near()` CSS layout pseudo-classes to anchor on the label, or chain `.filter()` on the row wrapper.

```typescript
import { test, expect } from '@playwright/test';

test('enable notifications toggle', async ({ page }) => {
  await page.goto('/settings');

  // Option A: filter the row by its label text, then find the checkbox inside
  const row = page.locator('div').filter({ hasText: /^Enable notifications$/ });
  const toggle = row.locator('input[type="checkbox"]');

  await expect(toggle).not.toBeChecked();
  await toggle.click();
  await expect(toggle).toBeChecked();
});

test('enable notifications toggle — proximity approach', async ({ page }) => {
  await page.goto('/settings');

  // Option B: use :right-of() to find the checkbox to the right of the label text
  const toggle = page.locator('input[type="checkbox"]:right-of(:text("Enable notifications"))');

  await toggle.click();
  await expect(toggle).toBeChecked();
});
```

**Note on Option B:** Layout locators like `:right-of()` compute position at the time the locator resolves. They are more brittle than `filter()` if the layout shifts. Prefer Option A (row filter) unless the DOM structure makes row-scoping impossible.

---

## Appendix: At-a-Glance Reference Card

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                  HASHED ELEMENT QUICK-PICK CARD                              │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ I can see...         │ Use this                                               │
├──────────────────────┼───────────────────────────────────────────────────────┤
│ data-testid attr     │ page.getByTestId("name")                              │
│ Button / link text   │ page.getByRole("button", { name: "Save" })            │
│ A <label> nearby     │ page.getByLabel("Email address")                      │
│ Placeholder text     │ page.getByPlaceholder("Enter email")                  │
│ Any visible text     │ page.getByText("Submit Order")                        │
│ Image alt text       │ page.getByAltText("Company logo")                     │
│ Title attribute      │ page.getByTitle("Delete item")                        │
│ React component name │ page.locator("_react=MyComponent")                    │
│ Vue component name   │ page.locator("_vue=my-component")                     │
│ Unique row text      │ page.locator("tr").filter({ hasText: "Juan" })        │
│ Spatial position     │ page.locator('button:right-of(:text("Price"))')       │
│ Nothing at all       │ npx playwright codegen / page.pause() / ask for testid│
└──────────────────────┴───────────────────────────────────────────────────────┘
```

---

## Related guides in this folder

- `02-locator-strategies.md` — stability spectrum, 7 ways to write the same locator, quick-pick cheat sheet
- Playwright docs: `pw_docs/locators.mdx` — full reference for all recommended locators
- Playwright docs: `pw_docs/other-locators.mdx` — CSS layout pseudo-classes, React/Vue locators, XPath
