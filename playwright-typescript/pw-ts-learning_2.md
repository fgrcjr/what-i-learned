# 🎯 Playwright TypeScript — Dynamic Locators & Element Targeting Guide

> **The problem this solves:** Some apps generate class names like `btn_a3f9c2` or
> IDs like `input_7x8k` that change every build. This guide shows every way to
> locate the same element — from most stable to least stable — so you always
> have a fallback.

---

## 🧠 The Golden Rule

```
data-testid  >  role  >  label/text  >  CSS  >  XPath  >  nth / index
most stable                                              least stable
```

Never rely on **auto-generated class names or IDs** as your first choice.
They are hashed at build time and will break your tests on every deployment.

---

## 📦 SCENARIO SETUP

Throughout this guide, we use **one real-world button** as the subject.
Every code block targets the exact same element, just a different way.

```html
<!-- The element we want to click in every example below -->
<button
  id="btn_a3f9c2"
  class="MuiButton-root btn_8x9k2z styles__primaryBtn___3Fk2"
  data-testid="submit-order-btn"
  aria-label="Submit your order"
  type="submit"
  name="submitOrder"
>
  Submit Order
</button>
```

Notice: the `id` and `class` are hashed/generated — they change every build.
The `data-testid`, `aria-label`, `name`, and visible text are stable.

---

## ✅ OPTION 1 — `data-testid` (Most Recommended)

**When to use:** Always, if your team adds these attributes.
**Why it's best:** It exists purely for testing. Designers won't touch it. Devs won't rename it.

```typescript
import { test, expect } from "@playwright/test";

test("locate by data-testid", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // cleanest and most readable
  const btn = page.locator('[data-testid="submit-order-btn"]');
  await btn.click();

  await expect(btn).toBeVisible();
});
```

**Shorthand version using `getByTestId`:**

```typescript
test("locate using getByTestId helper", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // getByTestId is identical to locator('[data-testid="..."]')
  const btn = page.getByTestId("submit-order-btn");
  await btn.click();
});
```

> 💬 **Tip for beginners:** Ask your dev team to add `data-testid` to every
> button, input, form, and key UI element. It is a one-line change for them
> and saves you hours of debugging broken selectors.

---

## ✅ OPTION 2 — `getByRole` (Best for Accessibility)

**When to use:** When `data-testid` isn't available and the element has a clear ARIA role.
**Why it's great:** It tests your app the same way a screen reader would experience it.

```typescript
test("locate by ARIA role + accessible name", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // role="button" + the visible label text
  const btn = page.getByRole("button", { name: "Submit Order" });
  await btn.click();
});
```

**Common roles you'll use:**

```typescript
page.getByRole("button", { name: "Save" }); // <button>
page.getByRole("link", { name: "About Us" }); // <a href>
page.getByRole("textbox", { name: "Email" }); // <input type="text">
page.getByRole("checkbox", { name: "Remember me" }); // <input type="checkbox">
page.getByRole("combobox", { name: "Country" }); // <select>
page.getByRole("dialog", { name: "Confirm Delete" }); // modal/dialog
page.getByRole("heading", { name: "Dashboard" }); // <h1> - <h6>
page.getByRole("tab", { name: "Reports" }); // tab component
page.getByRole("alert"); // error/success banners
page.getByRole("progressbar"); // progress bar
page.getByRole("img", { name: "Profile photo" }); // <img alt="...">
```

**Case-insensitive and partial match:**

```typescript
test("role with partial or regex name match", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // exact: false → partial match ("Submit" matches "Submit Order")
  const btn = page.getByRole("button", { name: "Submit", exact: false });

  // regex → matches any button whose name contains "Order"
  const btn2 = page.getByRole("button", { name: /order/i });

  await btn.click();
});
```

---

## ✅ OPTION 3 — `getByLabel` (Best for Form Inputs)

**When to use:** Input fields that have a `<label>` element linked to them.
**Why it's great:** Mirrors exactly how a sighted user identifies a field.

```html
<!-- The HTML this targets -->
<label for="user-email">Email Address</label>
<input id="user-email" type="email" name="email" />
```

```typescript
test("locate input by its visible label", async ({ page }) => {
  await page.goto("https://your-app.com/login");

  // Finds the INPUT linked to the "Email Address" label
  await page.getByLabel("Email Address").fill("juan@example.com");
  await page.getByLabel("Password").fill("Password123!");
});
```

**Also works with `aria-label`:**

```html
<!-- No visible label, but has aria-label -->
<input type="search" aria-label="Search products" />
```

```typescript
test("locate by aria-label when no visible label exists", async ({ page }) => {
  await page.goto("https://your-app.com/shop");

  await page.getByLabel("Search products").fill("running shoes");
});
```

---

## ✅ OPTION 4 — `getByText` / `getByPlaceholder`

**When to use:** When visible text or placeholder is unique and stable.

```typescript
test("locate by visible text content", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // Matches the button whose text is exactly "Submit Order"
  await page.getByText("Submit Order").click();

  // Partial match — matches "Submit Order", "Submit Order Now", etc.
  await page.getByText("Submit", { exact: false }).click();

  // Regex match
  await page.getByText(/submit order/i).click();
});
```

```typescript
test("locate input by placeholder text", async ({ page }) => {
  await page.goto("https://your-app.com/contact");

  // <input placeholder="Enter your email address" />
  await page
    .getByPlaceholder("Enter your email address")
    .fill("juan@example.com");
});
```

> ⚠️ **Beginner warning:** `getByText` matches ANY element containing that text —
> including paragraphs, divs, spans. If the text appears multiple times, you'll
> get a "strict mode violation" error. Narrow it down with `.filter()` (see Section 9).

---

## ✅ OPTION 5 — `locator()` with Stable CSS Attributes

**When to use:** When hashed classes are unavoidable, target stable attributes instead.

```typescript
test("locate using stable HTML attributes", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // ✅ STABLE — name attribute doesn't change between builds
  const byName = page.locator('button[name="submitOrder"]');

  // ✅ STABLE — type attribute
  const byType = page.locator('button[type="submit"]');

  // ✅ STABLE — aria-label
  const byAriaLabel = page.locator('[aria-label="Submit your order"]');

  // ✅ STABLE — data attributes other than data-testid
  const byDataAttr = page.locator('[data-action="submit-order"]');

  // ❌ UNSTABLE — hashed class names, avoid these
  // const bad = page.locator('.btn_8x9k2z');       // changes every build
  // const bad2 = page.locator('#btn_a3f9c2');      // changes every build

  await byName.click();
});
```

---

## ✅ OPTION 6 — CSS Selectors (Partial Class Match)

**When to use:** When part of the class name is stable even if the full name is hashed.

```html
<!-- class="MuiButton-root btn_8x9k2z styles__primaryBtn___3Fk2" -->
<!-- "MuiButton-root" is stable (comes from Material UI library) -->
<!-- "styles__primaryBtn" is a stable prefix even though the hash changes -->
```

```typescript
test("partial class name match with CSS", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // ^= means "class attribute STARTS WITH"
  const byPrefix = page.locator('[class^="styles__primaryBtn"]');

  // *= means "class attribute CONTAINS"
  const byContains = page.locator('[class*="primaryBtn"]');

  // $= means "class attribute ENDS WITH"
  const byEnds = page.locator('[class$="primaryBtn___3Fk2"]');

  // Target by a stable library class (MuiButton-root never changes)
  const byLibraryClass = page.locator("button.MuiButton-root");

  await byContains.click();
});
```

**Multiple class conditions (AND logic):**

```typescript
test("element must have ALL of these classes", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // Element must have BOTH classes simultaneously
  const btn = page.locator("button.MuiButton-root.Mui-disabled");

  await expect(btn).toBeVisible();
});
```

---

## ✅ OPTION 7 — XPath

**When to use:** Last resort when CSS alone can't express the relationship you need.
**Why XPath is useful:** It can traverse UP the DOM tree (CSS can't), find by text content natively, and express complex parent-child relationships.

```typescript
test("locate by XPath — exact text match", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // Find a button whose text content is exactly "Submit Order"
  const btn = page.locator('//button[text()="Submit Order"]');
  await btn.click();
});

test("locate by XPath — contains text", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // contains() is like *=, matches partial text
  const btn = page.locator('//button[contains(text(),"Submit")]');
  await btn.click();
});

test("locate by XPath — find parent then child", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // Find the form with id="order-form", then find its submit button
  const btn = page.locator('//form[@id="order-form"]//button[@type="submit"]');
  await btn.click();
});

test("locate by XPath — sibling relationship", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // Find the row whose first cell says "Juan", then get the Delete button in that same row
  const deleteBtn = page.locator(
    '//tr[td[1][text()="Juan"]]//button[text()="Delete"]',
  );
  await deleteBtn.click();
});

test("locate by XPath — ancestor traversal (go UP the tree)", async ({
  page,
}) => {
  await page.goto("https://your-app.com/form");

  // Start from the error message, go up to find its parent form group,
  // then find the input inside that group
  // Useful when inputs have no unique identifier but their error messages do
  const input = page.locator(
    '//span[text()="Email is required"]/ancestor::div[@class="form-group"]//input',
  );
  await expect(input).toBeVisible();
});
```

**XPath cheat sheet:**

```typescript
// Text matching
'//button[text()="Save"]'; // exact text
'//button[contains(text(),"Save")]'; // partial text
'//button[normalize-space()="Save"]'; // ignores extra whitespace

// Attribute matching
'//input[@name="email"]'; // attribute equals
'//input[contains(@class,"primaryBtn")]'; // attribute contains
'//input[@type="text" and @required]'; // multiple conditions

// Relationships
"//form//button"; // descendant (any depth)
"//label/following-sibling::input"; // next sibling
"//input/preceding-sibling::label"; // previous sibling
"//span/parent::div"; // direct parent
"//span/ancestor::form"; // any ancestor
"//ul/child::li[1]"; // first direct child

// Indexing (1-based in XPath, unlike CSS which is 0-based)
'(//button[@type="submit"])[1]'; // first match
'(//button[@type="submit"])[last()]'; // last match
```

---

## ✅ OPTION 8 — `nth()` and Index-Based

**When to use:** When multiple identical elements exist and you need a specific one by position.
**Warning:** Position is fragile — adding a new row above breaks your test.

```typescript
test("target the third item in a list", async ({ page }) => {
  await page.goto("https://your-app.com/products");

  // nth() is 0-indexed: nth(0) = first, nth(2) = third
  const thirdProduct = page.locator('[data-testid="product-card"]').nth(2);

  await thirdProduct.click();
});

test("target the first and last items", async ({ page }) => {
  await page.goto("https://your-app.com/products");

  const items = page.locator('[data-testid="product-card"]');

  const first = items.first(); // same as .nth(0)
  const last = items.last(); // last item regardless of count

  await expect(first).toBeVisible();
  await expect(last).toBeVisible();
});
```

---

## ✅ OPTION 9 — `.filter()` to Narrow Down Multiple Matches

**When to use:** When a locator matches too many elements and you need to narrow by content or a child element.

```typescript
test("filter buttons by text when multiple buttons exist", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // This matches ALL buttons on the page
  const allButtons = page.locator("button");

  // Filter to only the one containing "Delete"
  const deleteBtn = allButtons.filter({ hasText: "Delete" });

  await deleteBtn.click();
});

test("filter list items by a child element", async ({ page }) => {
  await page.goto("https://your-app.com/notifications");

  // Filter list items that contain an unread badge inside them
  const unreadItems = page
    .locator('[data-testid="notification-item"]')
    .filter({ has: page.locator('[data-testid="unread-badge"]') });

  // How many unread notifications are there?
  const count = await unreadItems.count();
  console.log(`Unread: ${count}`);

  // Click the first unread one
  await unreadItems.first().click();
});

test("filter by NOT having a child element", async ({ page }) => {
  await page.goto("https://your-app.com/notifications");

  // Items that do NOT have the unread badge (= already read)
  const readItems = page
    .locator('[data-testid="notification-item"]')
    .filter({ hasNot: page.locator('[data-testid="unread-badge"]') });

  await expect(readItems.first()).toBeVisible();
});
```

---

## ✅ OPTION 10 — Chaining Locators (Parent → Child)

**When to use:** When you need to scope a search inside a specific container.
**Why it helps:** Prevents matching the wrong element when the same child appears in multiple containers.

```typescript
test("find a button inside a specific card", async ({ page }) => {
  await page.goto("https://your-app.com/dashboard");

  // Without chaining — might match the wrong "Edit" button
  // page.locator('button:has-text("Edit")')  ← too broad

  // With chaining — only the Edit button inside the "Profile" card
  const profileCard = page.locator('[data-testid="profile-card"]');
  const editBtn = profileCard.locator('button:has-text("Edit")');

  await editBtn.click();
});

test("find a row in a table then act on a cell inside it", async ({ page }) => {
  await page.goto("https://your-app.com/orders");

  // Find the table row for order #1042
  const orderRow = page.locator("tr").filter({ hasText: "#1042" });

  // Inside that row, find the Status cell (3rd column)
  const statusCell = orderRow.locator("td:nth-child(3)");
  await expect(statusCell).toHaveText("Shipped");

  // Inside that row, click the View button
  const viewBtn = orderRow.locator('button:has-text("View")');
  await viewBtn.click();
});
```

---

## ✅ OPTION 11 — Dynamic Text with Variables

**When to use:** The element's text includes a value you only know at runtime (e.g., a username from an API).

```typescript
test("find element with dynamic text from a variable", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // Imagine this comes from your test data or an API response
  const dynamicUsername = "Juan dela Cruz";

  // Template literal to build the selector dynamically
  const userRow = page.locator(`tr:has-text("${dynamicUsername}")`);
  await expect(userRow).toBeVisible();

  // Or using regex for partial/case-insensitive match
  const userRowRegex = page.locator("tr").filter({
    hasText: new RegExp(dynamicUsername, "i"),
  });
  await expect(userRowRegex).toBeVisible();
});

test("build a selector with a dynamic ID from an API", async ({ page }) => {
  await page.goto("https://your-app.com/products");

  // Say you fetched a product ID from an API response
  const productId = "prod_8821";

  // Inject it into the selector dynamically
  const productCard = page.locator(`[data-product-id="${productId}"]`);
  await expect(productCard).toBeVisible();
});
```

---

## ✅ OPTION 12 — `evaluate()` — Raw JavaScript Fallback

**When to use:** When no Playwright locator can reach the element, use the browser's native DOM API directly.

```typescript
test("find element using native DOM inside evaluate()", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // querySelector inside the browser — same as typing it in DevTools console
  const buttonText = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="submit-order-btn"]');
    return btn ? btn.textContent : null;
  });

  expect(buttonText?.trim()).toBe("Submit Order");
});

test("click an element using evaluate when locator fails", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // Force a click through JS — useful for elements hidden from Playwright
  await page.evaluate(() => {
    const btn = document.querySelector<HTMLButtonElement>(
      'button[name="submitOrder"]',
    );
    btn?.click();
  });
});

test("read a deeply nested shadow DOM value via evaluate", async ({ page }) => {
  await page.goto("https://your-app.com/widget");

  // Shadow DOM elements are invisible to normal locators
  const value = await page.evaluate(() => {
    const host = document.querySelector("#widget-host") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const inner = host?.shadowRoot?.querySelector("input");
    return inner?.value ?? null;
  });

  expect(value).not.toBeNull();
});
```

---

## ✅ OPTION 13 — Shadow DOM

**When to use:** Web components use Shadow DOM, which is isolated from the main DOM.

```typescript
test("interact with an element inside Shadow DOM", async ({ page }) => {
  await page.goto("https://your-app.com/widget");

  // Playwright has built-in Shadow DOM piercing with >>
  const shadowInput = page.locator("my-custom-element >> input[name='email']");
  await shadowInput.fill("juan@example.com");
});
```

---

## 📊 SECTION 14 — All Options Side by Side (Same Element)

This is the full comparison — every approach targeting the exact same button.

```typescript
import { test, expect } from "@playwright/test";

// The target element:
// <button data-testid="submit-order-btn" aria-label="Submit your order"
//   name="submitOrder" type="submit" class="MuiButton-root btn_8x9k2z">
//   Submit Order
// </button>

test("all ways to find the same element", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 1 — Most Stable (use these first)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  page.getByTestId("submit-order-btn"); // ✅ data-testid
  page.getByRole("button", { name: "Submit Order" }); // ✅ ARIA role
  page.getByRole("button", { name: /submit order/i }); // ✅ ARIA role + regex
  page.getByLabel("Submit your order"); // ✅ aria-label
  page.locator('[data-testid="submit-order-btn"]'); // ✅ data-testid attribute
  page.locator('[aria-label="Submit your order"]'); // ✅ aria-label attribute
  page.locator('button[name="submitOrder"]'); // ✅ name attribute
  page.locator('button[type="submit"]'); // ✅ type attribute

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 2 — Stable if Text is Consistent
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  page.getByText("Submit Order"); // visible text
  page.getByText(/submit order/i); // regex text
  page.locator("text=Submit Order"); // text pseudo-selector
  page.locator('button:has-text("Submit Order")'); // CSS + text combo
  page.locator('button:has-text("Submit")'); // partial text

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 3 — CSS Attribute Tricks
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  page.locator("button.MuiButton-root"); // stable library class
  page.locator('[class*="primaryBtn"]'); // partial class match
  page.locator('[class^="styles__"]'); // class prefix match
  page.locator('button.MuiButton-root[type="submit"]'); // combined CSS

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 4 — XPath
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  page.locator('//button[text()="Submit Order"]'); // exact text
  page.locator('//button[contains(text(),"Submit")]'); // partial text
  page.locator('//button[@name="submitOrder"]'); // by attribute
  page.locator('//button[@type="submit" and @name="submitOrder"]'); // multi-attr
  page.locator('//form//button[@type="submit"]'); // parent → child

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 5 — Position-Based (Fragile — avoid if possible)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  page.locator("button").nth(0); // first button on page
  page.locator("button").last(); // last button on page
  page.locator("button:nth-child(2)"); // 2nd button in parent
  page.locator("(//button[@type='submit'])[1]"); // first via XPath
});
```

---

## 🔥 SECTION 15 — Real-World Scenarios

---

### Scenario A: MUI / Tailwind / CSS Modules Hashed Classes

```typescript
// ❌ This breaks every build because the hash changes
page.locator(".MuiButton-root-a3f9c .btn-8x9k2z");

// ✅ Target the stable part of the MUI class
page.locator("button.MuiButton-root");
page.locator(".MuiButton-containedPrimary"); // MUI class, never hashed

// ✅ Or use the component's data-testid if your team adds them
page.locator('[data-testid="submit-btn"]');
```

---

### Scenario B: Dynamically Generated Table Rows

```typescript
test("click the Delete button for a specific user row", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  const targetName = "Juan dela Cruz"; // could come from test data

  // 1. Find the row containing the user's name
  const userRow = page.locator("tr").filter({ hasText: targetName });

  // 2. Inside that row, find the Delete button
  const deleteBtn = userRow.locator('button:has-text("Delete")');

  await deleteBtn.click();
});
```

---

### Scenario C: Same Component Repeated Multiple Times

```typescript
test("click the Add to Cart for a specific product", async ({ page }) => {
  await page.goto("https://your-app.com/shop");

  // Multiple product cards, each with an "Add to Cart" button
  // Without scoping, this would match the wrong card

  // Option A: scope by the card containing the product name
  const card = page
    .locator('[data-testid="product-card"]')
    .filter({ hasText: "Running Shoes Pro" });

  await card.getByRole("button", { name: "Add to Cart" }).click();

  // Option B: use the product's unique data attribute
  await page
    .locator('[data-product-id="prod_8821"] button:has-text("Add to Cart")')
    .click();
});
```

---

### Scenario D: List Items with No Unique Identifiers

```typescript
test("select the second option in a custom dropdown", async ({ page }) => {
  await page.goto("https://your-app.com/filters");

  // Open the dropdown
  await page.click('[data-testid="sort-dropdown"]');

  // The dropdown renders <li> items with no stable IDs
  const options = page.locator('[data-testid="sort-dropdown"] li');

  // Target by text (most reliable here)
  await options.filter({ hasText: "Price: Low to High" }).click();

  // Or by index if the order is guaranteed and fixed
  await options.nth(1).click();
});
```

---

### Scenario E: Element Loaded After an API Call (Dynamic Content)

```typescript
test("wait for a dynamically loaded element before interacting", async ({
  page,
}) => {
  await page.goto("https://your-app.com/dashboard");

  // Wait for the API to finish and the element to appear in the DOM
  // Playwright's locators auto-wait, but you can be explicit:
  const statsCard = page.locator('[data-testid="revenue-card"]');
  await statsCard.waitFor({ state: "visible", timeout: 10000 });

  await expect(statsCard).toContainText("₱");
});
```

---

### Scenario F: React/Vue Key-Based Elements

```typescript
test("find element by its React key-derived data attribute", async ({
  page,
}) => {
  await page.goto("https://your-app.com/orders");

  // Developers often set key-derived data attributes like data-order-id
  const order1042 = page.locator('[data-order-id="1042"]');
  await expect(order1042).toBeVisible();

  // If they don't, use the row text content
  const orderByText = page.locator("tr").filter({ hasText: "ORD-1042" });
  await expect(orderByText).toBeVisible();
});
```

---

## 💡 Quick Decision Tree

```
Is there a data-testid?
  ├─ YES → Use getByTestId("...") ✅ Stop here
  └─ NO ↓

Is there a clear ARIA role + label?
  ├─ YES → Use getByRole("button", { name: "..." }) ✅ Stop here
  └─ NO ↓

Is there a <label> or aria-label?
  ├─ YES → Use getByLabel("...") ✅ Stop here
  └─ NO ↓

Is the visible text unique on the page?
  ├─ YES → Use getByText("...") or :has-text("...") ✅ Stop here
  └─ NO ↓

Is there a stable HTML attribute (name, type, href, value)?
  ├─ YES → Use locator('[name="..."]') ✅ Stop here
  └─ NO ↓

Is part of the class name stable (library class, BEM prefix)?
  ├─ YES → Use locator('[class*="stablePart"]') ⚠️ Use with caution
  └─ NO ↓

Is the DOM structure consistent (parent → child relationship)?
  ├─ YES → Chain locators or use XPath ⚠️ Use with caution
  └─ NO ↓

Is the position fixed (always the 2nd button)?
  ├─ YES → Use .nth(1) ⚠️ Fragile, use only as last resort
  └─ NO → Use evaluate() with querySelector as final fallback
```

---

## ⚡ Cheat Sheet — Syntax at a Glance

```typescript
// ── BUILT-IN HELPERS (most readable) ──────────────────────────────
page.getByTestId("my-btn");
page.getByRole("button", { name: "Save" });
page.getByRole("button", { name: /save/i }); // regex
page.getByRole("button", { name: "Save", exact: false }); // partial
page.getByLabel("Email address");
page.getByText("Submit Order");
page.getByText(/submit/i);
page.getByPlaceholder("Enter your name");

// ── CSS ATTRIBUTE SELECTORS ───────────────────────────────────────
page.locator('[data-testid="btn"]'); // exact attribute
page.locator('[class*="primaryBtn"]'); // attribute CONTAINS *=
page.locator('[class^="styles__"]'); // attribute STARTS WITH ^=
page.locator('[class$="___3Fk2"]'); // attribute ENDS WITH $=
page.locator('[aria-label="Close"]'); // aria-label
page.locator('button[name="submit"]'); // tag + attribute
page.locator("button.MuiButton-root"); // tag + stable class

// ── TEXT PSEUDO-SELECTORS ─────────────────────────────────────────
page.locator("text=Submit Order"); // exact
page.locator("text=Submit"); // partial
page.locator('button:has-text("Submit")'); // tag + text

// ── XPATH ─────────────────────────────────────────────────────────
page.locator('//button[text()="Submit"]');
page.locator('//button[contains(text(),"Submit")]');
page.locator('//button[@name="submit"]');
page.locator('//tr[td="Juan"]//button'); // parent → child
page.locator("//span/ancestor::form//input"); // ancestor traversal

// ── CHAINING & FILTERING ──────────────────────────────────────────
parent.locator("child"); // scope to parent
locator.filter({ hasText: "Juan" }); // filter by text
locator.filter({ has: page.locator(".badge") }); // filter by child
locator.filter({ hasNot: page.locator(".badge") }); // filter by absence
locator.nth(0); // by index (0-based)
locator.first(); // first match
locator.last(); // last match

// ── DYNAMIC VALUES ────────────────────────────────────────────────
const id = "prod_8821";
page.locator(`[data-id="${id}"]`); // template literal
page.locator("tr").filter({ hasText: new RegExp(username, "i") }); // regex

// ── FALLBACK ──────────────────────────────────────────────────────
page.evaluate(() => document.querySelector("#my-id")?.textContent);
```
