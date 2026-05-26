# 🎭 Playwright TypeScript — Testable Web Elements Guide

> **Who this is for:** Absolute beginners coming from manual/no-code automation.
> Every section has a plain-English explanation followed by a real code snippet.
> You don't need to memorize this — use it as a reference while you write tests.

---

## 🧭 How to Read This Guide

Each element follows this pattern:

```
What it is        → plain English explanation
Why you test it   → what can go wrong
Code snippet      → copy-paste ready TypeScript
```

**Key Playwright concepts you'll see everywhere:**

```typescript
// page       → represents the browser tab you're controlling
// locator    → a way to "point at" an element on the page
// expect     → the assertion — "I expect this to be true"
// await      → wait for something async to finish (network, animation, etc.)
```

---

## 📝 SECTION 1 — Form Inputs

---

### 1.1 Text Input

**What it is:** A single-line `<input type="text">` field.
**Why you test it:** To ensure the field accepts input, enforces limits, and passes values correctly to the server.

```typescript
import { test, expect } from "@playwright/test";

test("text input accepts and holds a value", async ({ page }) => {
  await page.goto("https://your-app.com/form");

  // Type into the field
  await page.fill('input[name="firstName"]', "Juan");

  // Assert the field now contains "Juan"
  await expect(page.locator('input[name="firstName"]')).toHaveValue("Juan");
});

test("text input can be cleared", async ({ page }) => {
  await page.goto("https://your-app.com/form");

  await page.fill('input[name="firstName"]', "Juan");
  await page.fill('input[name="firstName"]', ""); // clear it

  await expect(page.locator('input[name="firstName"]')).toHaveValue("");
});
```

---

### 1.2 Password Input

**What it is:** An `<input type="password">` that hides characters.
**Why you test it:** To confirm the field is masked by default and that a show/hide toggle works.

```typescript
test("password field is masked by default", async ({ page }) => {
  await page.goto("https://your-app.com/login");

  const passwordInput = page.locator('input[name="password"]');

  // The type attribute should be "password" (characters hidden)
  await expect(passwordInput).toHaveAttribute("type", "password");
});

test("show/hide toggle changes password visibility", async ({ page }) => {
  await page.goto("https://your-app.com/login");

  const passwordInput = page.locator('input[name="password"]');
  const toggleBtn = page.locator('[data-testid="toggle-password"]');

  // Default: hidden
  await expect(passwordInput).toHaveAttribute("type", "password");

  // After clicking toggle: visible
  await toggleBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "text");

  // Click again: hidden again
  await toggleBtn.click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});
```

---

### 1.3 Email / URL / Tel Input

**What it is:** Specialised input types that have built-in format validation.
**Why you test it:** The browser or server should reject badly formatted values.

```typescript
test("email field rejects invalid format", async ({ page }) => {
  await page.goto("https://your-app.com/register");

  await page.fill('input[name="email"]', "notanemail");
  await page.click('button[type="submit"]');

  // An error message should appear
  await expect(page.locator("text=Enter a valid email")).toBeVisible();
});

test("email field accepts a valid address", async ({ page }) => {
  await page.goto("https://your-app.com/register");

  await page.fill('input[name="email"]', "juan@example.com");
  await page.click('button[type="submit"]');

  // No email error should appear
  await expect(page.locator("text=Enter a valid email")).not.toBeVisible();
});
```

---

### 1.4 Textarea

**What it is:** A multi-line text box `<textarea>`.
**Why you test it:** Character counters, max-length enforcement, and line-break handling.

```typescript
test("textarea shows character counter", async ({ page }) => {
  await page.goto("https://your-app.com/contact");

  const textarea = page.locator('textarea[name="message"]');
  await textarea.fill("Hello!");

  // A live character counter should update
  await expect(page.locator('[data-testid="char-count"]')).toHaveText("6/500");
});

test("textarea blocks input over character limit", async ({ page }) => {
  await page.goto("https://your-app.com/contact");

  const overLimit = "A".repeat(501);
  await page.fill('textarea[name="message"]', overLimit);
  await page.click('button[type="submit"]');

  await expect(
    page.locator("text=Must be 500 characters or fewer"),
  ).toBeVisible();
});
```

---

### 1.5 Select (Dropdown)

**What it is:** A `<select>` element with a list of `<option>` items.
**Why you test it:** To confirm options render correctly and the selected value is what the server receives.

```typescript
test("dropdown selects an option by visible label", async ({ page }) => {
  await page.goto("https://your-app.com/form");

  // Select by the text the user sees
  await page.selectOption('select[name="country"]', { label: "Philippines" });

  await expect(page.locator('select[name="country"]')).toHaveValue("PH");
});

test("dropdown selects an option by underlying value", async ({ page }) => {
  await page.goto("https://your-app.com/form");

  // Select by the value attribute (what gets sent to the server)
  await page.selectOption('select[name="country"]', { value: "PH" });

  await expect(page.locator('select[name="country"]')).toHaveValue("PH");
});
```

---

### 1.6 Multi-Select

**What it is:** A `<select multiple>` that lets you pick more than one option.
**Why you test it:** Multiple selections must all be captured and sent correctly.

```typescript
test("multi-select accepts multiple values", async ({ page }) => {
  await page.goto("https://your-app.com/preferences");

  // Pass an array of values to select multiple options at once
  await page.selectOption('select[name="skills"]', [
    "typescript",
    "playwright",
    "testing",
  ]);

  // Check that all three are selected
  const selected = await page
    .locator('select[name="skills"]')
    .evaluate((el: HTMLSelectElement) =>
      Array.from(el.selectedOptions).map((o) => o.value),
    );

  expect(selected).toEqual(["typescript", "playwright", "testing"]);
});
```

---

### 1.7 Checkbox

**What it is:** An `<input type="checkbox">` — on or off.
**Why you test it:** Checked state, indeterminate state, and that checking/unchecking is reflected in form data.

```typescript
test("checkbox can be checked and unchecked", async ({ page }) => {
  await page.goto("https://your-app.com/settings");

  const checkbox = page.locator('input[name="newsletter"]');

  // Check it
  await checkbox.check();
  await expect(checkbox).toBeChecked();

  // Uncheck it
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
});

test("terms checkbox must be checked before submit", async ({ page }) => {
  await page.goto("https://your-app.com/register");

  // Try submitting without checking terms
  await page.click('button[type="submit"]');

  await expect(page.locator("text=You must accept the terms")).toBeVisible();
});
```

---

### 1.8 Radio Buttons

**What it is:** A group of `<input type="radio">` where only one can be selected.
**Why you test it:** Selecting one should deselect the others (mutual exclusivity).

```typescript
test("selecting one radio deselects the others", async ({ page }) => {
  await page.goto("https://your-app.com/survey");

  const optionA = page.locator('input[value="option-a"]');
  const optionB = page.locator('input[value="option-b"]');

  await optionA.check();
  await expect(optionA).toBeChecked();
  await expect(optionB).not.toBeChecked();

  // Now switch to B — A should automatically uncheck
  await optionB.check();
  await expect(optionB).toBeChecked();
  await expect(optionA).not.toBeChecked();
});
```

---

### 1.9 Date / Time Picker

**What it is:** `<input type="date">` or `<input type="time">`.
**Why you test it:** Min/max date constraints, invalid date rejection, and correct format sent to the server.

```typescript
test("date picker respects the minimum date constraint", async ({ page }) => {
  await page.goto("https://your-app.com/booking");

  // Try to set a date in the past (assuming min is today)
  await page.fill('input[type="date"]', "2000-01-01");
  await page.click('button[type="submit"]');

  await expect(page.locator("text=Date cannot be in the past")).toBeVisible();
});

test("date picker accepts a valid future date", async ({ page }) => {
  await page.goto("https://your-app.com/booking");

  await page.fill('input[type="date"]', "2099-12-31");

  await expect(page.locator('input[type="date"]')).toHaveValue("2099-12-31");
});
```

---

### 1.10 Range Slider

**What it is:** `<input type="range">` — a draggable slider with min/max/step.
**Why you test it:** The displayed value should update live, and the submitted value should match.

```typescript
test("range slider updates the displayed value", async ({ page }) => {
  await page.goto("https://your-app.com/settings");

  // Set the slider value directly (dragging is unreliable in automation)
  await page.fill('input[type="range"]', "75");

  // A label showing the current value should update
  await expect(page.locator('[data-testid="slider-value"]')).toHaveText("75");
});
```

---

### 1.11 File Upload

**What it is:** `<input type="file">` — opens the OS file picker.
**Why you test it:** Allowed file types, file size limits, and upload success message.

```typescript
test("file input accepts a valid PDF", async ({ page }) => {
  await page.goto("https://your-app.com/upload");

  // setInputFiles bypasses the OS file picker dialog entirely
  await page.setInputFiles('input[type="file"]', {
    name: "resume.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("fake pdf content"),
  });

  await expect(page.locator("text=resume.pdf")).toBeVisible();
});

test("file input rejects a disallowed file type", async ({ page }) => {
  await page.goto("https://your-app.com/upload");

  await page.setInputFiles('input[type="file"]', {
    name: "virus.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("fake binary"),
  });

  await page.click('button[type="submit"]');
  await expect(
    page.locator("text=Only PDF, JPG, and PNG are allowed"),
  ).toBeVisible();
});
```

---

### 1.12 Submit & Reset Buttons

**What it is:** `<button type="submit">` sends the form; `<button type="reset">` clears it.
**Why you test it:** Submit should disable after click (prevent double-submit); reset should clear all fields.

```typescript
test("submit button is disabled immediately after click", async ({ page }) => {
  await page.goto("https://your-app.com/contact");

  await page.fill('input[name="email"]', "juan@example.com");
  const submitBtn = page.locator('button[type="submit"]');

  await submitBtn.click();

  // Should be disabled before the response comes back
  await expect(submitBtn).toBeDisabled();
});

test("reset button clears all fields", async ({ page }) => {
  await page.goto("https://your-app.com/contact");

  await page.fill('input[name="firstName"]', "Juan");
  await page.fill('input[name="email"]', "juan@example.com");

  await page.click('button[type="reset"]');

  await expect(page.locator('input[name="firstName"]')).toHaveValue("");
  await expect(page.locator('input[name="email"]')).toHaveValue("");
});
```

---

## 🔗 SECTION 2 — Navigation & Links

---

### 2.1 Anchor Links

**What it is:** `<a href="...">` — the basic hyperlink.
**Why you test it:** Wrong `href`, broken routes, and `target="_blank"` opening correctly.

```typescript
test("nav link navigates to the correct page", async ({ page }) => {
  await page.goto("https://your-app.com");

  await page.click("text=About Us");

  await expect(page).toHaveURL(/.*about/);
  await expect(page).toHaveTitle(/About/);
});

test("external link opens in a new tab", async ({ page, context }) => {
  await page.goto("https://your-app.com");

  // Listen for a new page (tab) being opened
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    page.click("text=Visit Partner Site"),
  ]);

  await newPage.waitForLoadState();
  expect(newPage.url()).toContain("partner-site.com");
});
```

---

### 2.2 Hamburger Menu (Mobile)

**What it is:** A ☰ button that shows/hides the nav on small screens.
**Why you test it:** Mobile navigation is a separate code path that often breaks silently.

```typescript
test("hamburger menu opens and closes on mobile", async ({ page }) => {
  // Emulate a mobile screen (iPhone 12 size)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("https://your-app.com");

  const menu = page.locator('[data-testid="mobile-menu"]');
  const hamburger = page.locator('[data-testid="hamburger-btn"]');

  // Menu should be hidden initially
  await expect(menu).not.toBeVisible();

  // Open it
  await hamburger.click();
  await expect(menu).toBeVisible();

  // Close it
  await hamburger.click();
  await expect(menu).not.toBeVisible();
});
```

---

### 2.3 Breadcrumbs

**What it is:** A trail like `Home > Products > Shoes` showing where you are.
**Why you test it:** Each crumb should be clickable and show the correct level.

```typescript
test("breadcrumbs show correct hierarchy and are clickable", async ({
  page,
}) => {
  await page.goto("https://your-app.com/products/shoes/running");

  // Check all three levels exist
  await expect(page.locator("text=Home")).toBeVisible();
  await expect(page.locator("text=Products")).toBeVisible();
  await expect(page.locator("text=Shoes")).toBeVisible();

  // Clicking "Products" should go back to /products
  await page.click("text=Products");
  await expect(page).toHaveURL(/.*\/products$/);
});
```

---

### 2.4 Pagination

**What it is:** Numbered pages or Prev/Next buttons for large lists.
**Why you test it:** Edge cases: first page (no Prev), last page (no Next), correct content per page.

```typescript
test("previous button is disabled on the first page", async ({ page }) => {
  await page.goto("https://your-app.com/products?page=1");

  await expect(page.locator('[data-testid="prev-btn"]')).toBeDisabled();
});

test("clicking next loads the next page", async ({ page }) => {
  await page.goto("https://your-app.com/products?page=1");

  await page.click('[data-testid="next-btn"]');

  await expect(page).toHaveURL(/page=2/);
});

test("next button is disabled on the last page", async ({ page }) => {
  await page.goto("https://your-app.com/products?page=99"); // last page

  await expect(page.locator('[data-testid="next-btn"]')).toBeDisabled();
});
```

---

### 2.5 Tabs

**What it is:** A row of tabs where clicking each shows a different content panel.
**Why you test it:** Only one panel should be visible at a time; inactive panels should be hidden.

```typescript
test("clicking a tab shows its panel and hides others", async ({ page }) => {
  await page.goto("https://your-app.com/dashboard");

  // Click the "Reports" tab
  await page.click('[role="tab"][name="Reports"]');

  // Reports panel should be visible
  await expect(page.locator('[role="tabpanel"][name="Reports"]')).toBeVisible();

  // Overview panel should be hidden
  await expect(
    page.locator('[role="tabpanel"][name="Overview"]'),
  ).not.toBeVisible();
});
```

---

## ⚡ SECTION 3 — Interactive Components

---

### 3.1 Buttons (States)

**What it is:** Any `<button>` element.
**Why you test it:** Buttons have multiple states: default, hover, loading, and disabled. Each must behave correctly.

```typescript
test("button triggers the expected action on click", async ({ page }) => {
  await page.goto("https://your-app.com/dashboard");

  await page.click('[data-testid="delete-btn"]');

  // Confirm the action happened (e.g., a modal appeared)
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});

test("disabled button cannot be clicked", async ({ page }) => {
  await page.goto("https://your-app.com/form");

  const btn = page.locator('button[data-testid="save-btn"]');
  await expect(btn).toBeDisabled();

  // Playwright will throw if you try to click a disabled button,
  // so just asserting isDisabled is enough here
});
```

---

### 3.2 Modal / Dialog

**What it is:** A pop-up overlay that appears on top of the page.
**Why you test it:** Open/close triggers, backdrop click dismissal, and focus trap (Tab key stays inside).

```typescript
test("modal opens and closes correctly", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // Open the modal
  await page.click('[data-testid="add-user-btn"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Close via the X button
  await page.click('[data-testid="modal-close-btn"]');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});

test("modal closes when backdrop is clicked", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  await page.click('[data-testid="add-user-btn"]');

  // Click outside the modal (the backdrop overlay)
  await page.click('[data-testid="modal-backdrop"]');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});

test("Escape key closes the modal", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  await page.click('[data-testid="add-user-btn"]');
  await page.keyboard.press("Escape");

  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

---

### 3.3 Accordion

**What it is:** Collapsible sections — click a header to expand/collapse content.
**Why you test it:** Content visibility, and whether one-at-a-time mode is enforced.

```typescript
test("accordion expands and collapses on click", async ({ page }) => {
  await page.goto("https://your-app.com/faq");

  const panel = page.locator('[data-testid="faq-panel-1"]');
  const header = page.locator('[data-testid="faq-header-1"]');

  // Initially collapsed
  await expect(panel).not.toBeVisible();

  // Click to expand
  await header.click();
  await expect(panel).toBeVisible();

  // Click again to collapse
  await header.click();
  await expect(panel).not.toBeVisible();
});
```

---

### 3.4 Tooltip

**What it is:** A small text hint that appears when hovering over an element.
**Why you test it:** Tooltip must appear on hover and contain the right text.

```typescript
test("tooltip appears on hover with correct text", async ({ page }) => {
  await page.goto("https://your-app.com/dashboard");

  // Hover over the info icon
  await page.hover('[data-testid="info-icon"]');

  // The tooltip should appear
  await expect(page.locator('[role="tooltip"]')).toBeVisible();
  await expect(page.locator('[role="tooltip"]')).toContainText(
    "This is your total revenue",
  );
});
```

---

### 3.5 Toast / Snackbar Notifications

**What it is:** A temporary message that auto-dismisses (e.g., "Saved successfully!").
**Why you test it:** The message must appear after an action and disappear after a set time.

```typescript
test("success toast appears after saving", async ({ page }) => {
  await page.goto("https://your-app.com/settings");

  await page.fill('input[name="displayName"]', "Juan dela Cruz");
  await page.click('[data-testid="save-btn"]');

  const toast = page.locator('[data-testid="toast"]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText("Settings saved");

  // Toast should auto-disappear (wait up to 5 seconds)
  await expect(toast).not.toBeVisible({ timeout: 5000 });
});
```

---

### 3.6 Progress Bar

**What it is:** A visual indicator of how far along a process is.
**Why you test it:** The value should reflect the actual progress, and `aria-valuenow` should be correct for screen readers.

```typescript
test("progress bar updates its value during upload", async ({ page }) => {
  await page.goto("https://your-app.com/upload");

  await page.setInputFiles('input[type="file"]', "tests/fixtures/sample.pdf");
  await page.click('[data-testid="upload-btn"]');

  const progressBar = page.locator('[role="progressbar"]');

  // The aria-valuenow attribute should increase and eventually reach 100
  await expect(progressBar).toHaveAttribute("aria-valuenow", "100", {
    timeout: 10000,
  });
});
```

---

### 3.7 Drag and Drop

**What it is:** Moving an element from one location to another by dragging.
**Why you test it:** Order of items after a drag should reflect what the user did.

```typescript
test("dragging an item to a new position updates the order", async ({
  page,
}) => {
  await page.goto("https://your-app.com/kanban");

  const card = page.locator('[data-testid="card-1"]');
  const targetColumn = page.locator('[data-testid="column-done"]');

  // Drag the card into the Done column
  await card.dragTo(targetColumn);

  // The card should now be inside the Done column
  await expect(targetColumn.locator('[data-testid="card-1"]')).toBeVisible();
});
```

---

### 3.8 Infinite Scroll

**What it is:** More items load automatically as you scroll to the bottom.
**Why you test it:** Items must actually appear after scrolling — a common lazy-loading regression.

```typescript
test("more items load when scrolling to the bottom", async ({ page }) => {
  await page.goto("https://your-app.com/feed");

  // Count items before scrolling
  const initialCount = await page.locator('[data-testid="feed-item"]').count();

  // Scroll to the very bottom of the page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Wait for new items to appear
  await page.waitForTimeout(1500);

  const newCount = await page.locator('[data-testid="feed-item"]').count();
  expect(newCount).toBeGreaterThan(initialCount);
});
```

---

## 📊 SECTION 4 — Tables & Lists

---

### 4.1 Basic Table

**What it is:** An HTML `<table>` with rows and columns.
**Why you test it:** Row count, correct cell values, and header labels.

```typescript
test("table displays the correct number of rows", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // Count all data rows (not the header row)
  const rows = page.locator("table tbody tr");
  await expect(rows).toHaveCount(10);
});

test("table cell contains the expected value", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // Get the first row's second cell (email column)
  const firstEmail = page.locator("table tbody tr:first-child td:nth-child(2)");
  await expect(firstEmail).toHaveText("juan@example.com");
});
```

---

### 4.2 Sortable Table

**What it is:** A table with clickable headers that sort the rows.
**Why you test it:** After sorting, the first row should reflect the correct sorted value.

```typescript
test("clicking Name header sorts rows alphabetically", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // Click the Name column header
  await page.click('th[data-column="name"]');

  // After ascending sort, the first name should be "Alice"
  const firstRow = page.locator("table tbody tr:first-child td:first-child");
  await expect(firstRow).toHaveText("Alice");
});
```

---

### 4.3 Filterable Table / Search

**What it is:** A search input that filters the table rows in real time.
**Why you test it:** Only matching rows should be visible; non-matching rows should disappear.

```typescript
test("search filters the table to matching rows only", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  await page.fill('[data-testid="table-search"]', "juan");

  // Only rows containing "juan" should be visible
  const rows = page.locator("table tbody tr");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("juan");
});

test("search shows empty state when no results match", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  await page.fill('[data-testid="table-search"]', "zzznomatch");

  await expect(page.locator("text=No results found")).toBeVisible();
  await expect(page.locator("table tbody tr")).toHaveCount(0);
});
```

---

## 🖼️ SECTION 5 — Media & Content

---

### 5.1 Images

**What it is:** `<img>` tags.
**Why you test it:** Broken images (404 src) silently hurt UX — catch them in tests.

```typescript
test("all images on the page load without errors", async ({ page }) => {
  await page.goto("https://your-app.com/gallery");

  // Find all img elements and check each one loaded (naturalWidth > 0)
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs.filter((img) => img.naturalWidth === 0).map((img) => img.src);
  });

  // Fail the test if any images are broken
  expect(brokenImages).toEqual([]);
});

test("product image has a descriptive alt attribute", async ({ page }) => {
  await page.goto("https://your-app.com/products/123");

  const img = page.locator('[data-testid="product-image"]');
  await expect(img).toHaveAttribute("alt", /running shoes/i);
});
```

---

### 5.2 Iframe

**What it is:** An embedded page inside `<iframe>`.
**Why you test it:** Content inside iframes requires `frameLocator()` — normal locators can't reach inside.

```typescript
test("embedded payment form inside iframe is functional", async ({ page }) => {
  await page.goto("https://your-app.com/checkout");

  // Use frameLocator to get a handle inside the iframe
  const frame = page.frameLocator('[data-testid="payment-iframe"]');

  // Now interact with elements INSIDE the iframe
  await frame.locator('input[name="cardNumber"]').fill("4111111111111111");
  await frame.locator('input[name="expiry"]').fill("12/30");

  await expect(frame.locator('input[name="cardNumber"]')).toHaveValue(
    "4111111111111111",
  );
});
```

---

### 5.3 Video

**What it is:** `<video>` element for embedded media.
**Why you test it:** Play/pause controls, mute, and that the video actually loads.

```typescript
test("video plays and pauses correctly", async ({ page }) => {
  await page.goto("https://your-app.com/tutorials/intro");

  // Use evaluate() to call the native video API
  const isPaused = await page.evaluate(() => {
    const video = document.querySelector("video") as HTMLVideoElement;
    return video.paused;
  });

  // Video should start paused (autoplay is often blocked by browsers)
  expect(isPaused).toBe(true);

  // Click the play button
  await page.click('[data-testid="play-btn"]');

  const isNowPlaying = await page.evaluate(() => {
    const video = document.querySelector("video") as HTMLVideoElement;
    return !video.paused;
  });

  expect(isNowPlaying).toBe(true);
});
```

---

## 🌐 SECTION 6 — Network & Async

---

### 6.1 Waiting for an API Response

**What it is:** Asserting that a network call was made after a user action.
**Why you test it:** Ensures the frontend actually talks to the backend — not just showing fake local data.

```typescript
test("submitting the form triggers the correct API call", async ({ page }) => {
  await page.goto("https://your-app.com/contact");

  await page.fill('input[name="email"]', "juan@example.com");
  await page.fill('textarea[name="message"]', "Hello!");

  // waitForResponse listens for the network call WHILE the button is clicked
  const [response] = await Promise.all([
    page.waitForResponse("**/api/contact"),
    page.click('button[type="submit"]'),
  ]);

  expect(response.status()).toBe(200);
});
```

---

### 6.2 Mocking an API Response

**What it is:** Intercepting a network call and returning fake data.
**Why you test it:** Test error states, empty states, or specific data without needing a real backend.

```typescript
test("shows error message when API returns 500", async ({ page }) => {
  // Intercept the /api/users call and return a fake 500 error
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    });
  });

  await page.goto("https://your-app.com/users");

  // The UI should handle the error gracefully
  await expect(page.locator("text=Something went wrong")).toBeVisible();
});

test("shows empty state when API returns no data", async ({ page }) => {
  await page.route("**/api/users", (route) => {
    route.fulfill({ status: 200, body: JSON.stringify([]) });
  });

  await page.goto("https://your-app.com/users");

  await expect(page.locator("text=No users found")).toBeVisible();
});
```

---

### 6.3 Loading State

**What it is:** A spinner or skeleton screen shown while data fetches.
**Why you test it:** The sequence matters — loader appears, then disappears when data arrives.

```typescript
test("loading spinner appears then disappears after data loads", async ({
  page,
}) => {
  await page.goto("https://your-app.com/dashboard");

  const spinner = page.locator('[data-testid="loading-spinner"]');

  // Spinner should appear first
  await expect(spinner).toBeVisible();

  // Then disappear once data is loaded
  await expect(spinner).not.toBeVisible({ timeout: 5000 });

  // And the actual content should be there
  await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
});
```

---

### 6.4 File Download

**What it is:** Clicking a button that triggers a file download.
**Why you test it:** That the download actually starts and the filename/type is correct.

```typescript
test("export button downloads a CSV file", async ({ page }) => {
  await page.goto("https://your-app.com/reports");

  // waitForDownload captures the download event
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click('[data-testid="export-csv-btn"]'),
  ]);

  // Check the filename
  expect(download.suggestedFilename()).toMatch(/.*\.csv$/);

  // Optionally save and read the file
  const path = await download.path();
  expect(path).not.toBeNull();
});
```

---

## 🧭 SECTION 7 — Browser & Session

---

### 7.1 Page Title & Meta Tags (SEO)

**What it is:** The `<title>` tag and `<meta>` tags in `<head>`.
**Why you test it:** Critical for SEO — wrong title or missing description hurts search ranking.

```typescript
test("page has the correct title", async ({ page }) => {
  await page.goto("https://your-app.com/about");

  await expect(page).toHaveTitle("About Us | Your App");
});

test("page has a meta description", async ({ page }) => {
  await page.goto("https://your-app.com");

  const metaDescription = page.locator('meta[name="description"]');
  await expect(metaDescription).toHaveAttribute("content", /.{10,}/); // at least 10 chars
});
```

---

### 7.2 Cookies

**What it is:** Small pieces of data stored in the browser by the server.
**Why you test it:** Auth cookies, consent cookies, and session persistence.

```typescript
test("login sets an auth cookie", async ({ page, context }) => {
  await page.goto("https://your-app.com/login");
  await page.fill('input[name="email"]', "juan@example.com");
  await page.fill('input[name="password"]', "Password123!");
  await page.click('button[type="submit"]');

  // Inspect all cookies after login
  const cookies = await context.cookies();
  const authCookie = cookies.find((c) => c.name === "auth_token");

  expect(authCookie).toBeDefined();
  expect(authCookie?.httpOnly).toBe(true); // Secure flag check
});

test("logout clears the auth cookie", async ({ page, context }) => {
  // Pre-seed a cookie to simulate being logged in
  await context.addCookies([
    {
      name: "auth_token",
      value: "fake-token-123",
      domain: "your-app.com",
      path: "/",
    },
  ]);

  await page.goto("https://your-app.com/dashboard");
  await page.click('[data-testid="logout-btn"]');

  const cookies = await context.cookies();
  const authCookie = cookies.find((c) => c.name === "auth_token");

  // Cookie should be gone after logout
  expect(authCookie).toBeUndefined();
});
```

---

### 7.3 LocalStorage

**What it is:** Key-value storage in the browser that persists across page refreshes.
**Why you test it:** User preferences, cached tokens, and draft form data stored locally.

```typescript
test("theme preference is saved to localStorage", async ({ page }) => {
  await page.goto("https://your-app.com/settings");

  await page.click('[data-testid="dark-mode-toggle"]');

  // Read directly from localStorage via evaluate()
  const theme = await page.evaluate(() => localStorage.getItem("theme"));
  expect(theme).toBe("dark");
});

test("app reads theme from localStorage on load", async ({ page }) => {
  // Set localStorage BEFORE navigating to the page
  await page.goto("https://your-app.com");
  await page.evaluate(() => localStorage.setItem("theme", "dark"));

  // Reload so the app picks up the stored value
  await page.reload();

  await expect(page.locator("body")).toHaveClass(/dark-theme/);
});
```

---

### 7.4 Browser Dialogs (alert / confirm)

**What it is:** Native browser `alert()`, `confirm()`, and `prompt()` pop-ups.
**Why you test it:** These block the page — you must handle them or the test hangs forever.

```typescript
test("delete button shows a confirmation dialog", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  // Register the handler BEFORE clicking (it fires synchronously)
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Are you sure?");
    await dialog.accept(); // Click OK
  });

  await page.click('[data-testid="delete-user-btn"]');

  // After accepting, the user should be removed
  await expect(page.locator('[data-testid="user-row-1"]')).not.toBeVisible();
});

test("cancelling the confirm dialog keeps the record", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  page.once("dialog", async (dialog) => {
    await dialog.dismiss(); // Click Cancel
  });

  await page.click('[data-testid="delete-user-btn"]');

  // Record should still be there after cancelling
  await expect(page.locator('[data-testid="user-row-1"]')).toBeVisible();
});
```

---

### 7.5 Keyboard Navigation

**What it is:** Interacting with the page using only the keyboard.
**Why you test it:** Required for accessibility (WCAG); also catches focus order bugs.

```typescript
test("Tab key moves focus through form fields in order", async ({ page }) => {
  await page.goto("https://your-app.com/contact");

  // Start at the first field
  await page.focus('input[name="firstName"]');

  // Tab to the next field
  await page.keyboard.press("Tab");
  await expect(page.locator('input[name="lastName"]')).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.locator('input[name="email"]')).toBeFocused();
});

test("Enter key submits the form", async ({ page }) => {
  await page.goto("https://your-app.com/login");

  await page.fill('input[name="email"]', "juan@example.com");
  await page.fill('input[name="password"]', "Password123!");

  // Press Enter instead of clicking the button
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

### 7.6 Responsive / Viewport

**What it is:** How the page looks at different screen sizes.
**Why you test it:** Mobile and tablet layouts are separate code paths that often break independently.

```typescript
test("mobile layout shows hamburger menu, not desktop nav", async ({
  page,
}) => {
  // Set to iPhone 13 size
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("https://your-app.com");

  await expect(page.locator('[data-testid="hamburger-btn"]')).toBeVisible();
  await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
});

test("desktop layout shows full navigation bar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://your-app.com");

  await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
  await expect(page.locator('[data-testid="hamburger-btn"]')).not.toBeVisible();
});
```

---

### 7.7 Clipboard

**What it is:** Copy/paste functionality triggered by a button.
**Why you test it:** "Copy to clipboard" buttons are common in code editors, invite links, etc.

```typescript
test("copy button copies the invite link to clipboard", async ({
  page,
  context,
}) => {
  // Grant clipboard read permission
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("https://your-app.com/invite");

  await page.click('[data-testid="copy-link-btn"]');

  // Read what was copied
  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );

  expect(clipboardText).toMatch(/https:\/\/your-app\.com\/invite\/.+/);
});
```

---

## ♿ SECTION 8 — Accessibility (a11y)

---

### 8.1 ARIA Roles & Labels

**What it is:** Hidden metadata that screen readers use to describe elements.
**Why you test it:** Without correct ARIA, visually impaired users can't use your app.

```typescript
test("buttons have accessible labels", async ({ page }) => {
  await page.goto("https://your-app.com/dashboard");

  // getByRole is the most accessible-friendly way to find elements
  const deleteBtn = page.getByRole("button", { name: "Delete user" });
  await expect(deleteBtn).toBeVisible();
});

test("image has an alt attribute for screen readers", async ({ page }) => {
  await page.goto("https://your-app.com/about");

  const logo = page.locator('img[data-testid="company-logo"]');
  // Alt should not be empty
  const alt = await logo.getAttribute("alt");
  expect(alt).not.toBe("");
  expect(alt).not.toBeNull();
});
```

---

### 8.2 Focus Trap in Modals

**What it is:** When a modal is open, Tab should cycle through only the modal's elements.
**Why you test it:** Without a focus trap, Tab moves to hidden background elements — confusing for keyboard and screen reader users.

```typescript
test("focus is trapped inside modal while it is open", async ({ page }) => {
  await page.goto("https://your-app.com/users");

  await page.click('[data-testid="add-user-btn"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Tab through all focusable elements in the modal
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  // Focus should still be inside the modal, not on a background element
  const focusedElement = await page.evaluate(
    () => document.activeElement?.closest('[role="dialog"]') !== null,
  );

  expect(focusedElement).toBe(true);
});
```

---

### 8.3 Reduced Motion

**What it is:** A browser/OS preference to reduce animations for users with vestibular disorders.
**Why you test it:** Animations that ignore this preference can cause nausea or seizures.

```typescript
test("animations are disabled when reduced motion is preferred", async ({
  browser,
}) => {
  // Create a new context with reduced motion preference
  const context = await browser.newContext({
    reducedMotion: "reduce",
  });

  const page = await context.newPage();
  await page.goto("https://your-app.com");

  // Check that animated elements have their animation disabled
  const animationDuration = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="hero-animation"]');
    return el ? getComputedStyle(el).animationDuration : null;
  });

  // 0s means animation is turned off
  expect(animationDuration).toBe("0s");

  await context.close();
});
```

---

## 🔒 SECTION 9 — Security Edge Cases

---

### 9.1 XSS (Cross-Site Scripting)

**What it is:** Injecting `<script>` tags into form fields.
**Why you test it:** If the app renders user input back without escaping, an attacker can run malicious JS.

```typescript
test("XSS payload in input is escaped, not executed", async ({ page }) => {
  await page.goto("https://your-app.com/profile");

  // If an alert() fires, the XSS worked — auto-fail the test
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
    throw new Error(`XSS succeeded: ${dialog.message()}`);
  });

  await page.fill('input[name="username"]', '<script>alert("xss")</script>');
  await page.click('button[type="submit"]');

  // Page should still be intact
  await expect(page).not.toHaveURL(/.*error/);
});
```

---

### 9.2 SQL Injection

**What it is:** Injecting SQL syntax into form fields.
**Why you test it:** A poorly coded backend might expose database errors or grant unintended access.

```typescript
test("SQL injection string does not crash the server", async ({ page }) => {
  await page.goto("https://your-app.com/login");

  await page.fill('input[name="email"]', "' OR '1'='1'; DROP TABLE users; --");
  await page.fill('input[name="password"]', "anything");
  await page.click('button[type="submit"]');

  // Should NOT log in or show a database error
  await expect(page).not.toHaveURL(/.*dashboard/);
  await expect(page.locator("text=SQL")).not.toBeVisible();
  await expect(page.locator("text=syntax error")).not.toBeVisible();
});
```

---

## 💡 Quick Reference Cheat Sheet

```typescript
// ── LOCATING ELEMENTS ─────────────────────────────────────────────
page.locator('input[name="email"]'); // by attribute
page.locator("text=Submit"); // by visible text
page.locator('[data-testid="btn"]'); // by test ID (most stable)
page.getByRole("button", { name: "Save" }); // by ARIA role (best for a11y)
page.getByLabel("Email address"); // by label text
page.getByPlaceholder("Enter email"); // by placeholder text

// ── ACTIONS ───────────────────────────────────────────────────────
await page.fill('input[name="q"]', "text"); // clear and type
await page.type('input[name="q"]', "text"); // type character by character
await page.click("button"); // click
await page.dblclick("button"); // double click
await page.hover('[data-testid="icon"]'); // hover
await page.check('input[type="checkbox"]'); // check a checkbox
await page.uncheck('input[type="checkbox"]'); // uncheck
await page.selectOption("select", "value"); // select dropdown option
await page.focus("input"); // focus an element
await page.keyboard.press("Enter"); // keyboard press
await page.keyboard.press("Control+A"); // key combo

// ── ASSERTIONS ────────────────────────────────────────────────────
await expect(locator).toBeVisible(); // is shown on screen
await expect(locator).not.toBeVisible(); // is hidden
await expect(locator).toBeEnabled(); // is not disabled
await expect(locator).toBeDisabled(); // is disabled
await expect(locator).toBeChecked(); // checkbox is checked
await expect(locator).toHaveValue("text"); // input has value
await expect(locator).toHaveText("text"); // element text matches
await expect(locator).toContainText("partial"); // text contains substring
await expect(locator).toHaveAttribute("href", "/about"); // attr value
await expect(locator).toHaveCount(5); // n elements found
await expect(locator).toBeFocused(); // element has focus
await expect(page).toHaveURL(/.*dashboard/); // URL matches
await expect(page).toHaveTitle("My App"); // page title matches

// ── WAITING ───────────────────────────────────────────────────────
await page.waitForURL("**/dashboard"); // wait for navigation
await page.waitForSelector('[data-testid="x"]'); // wait for element
await page.waitForResponse("**/api/users"); // wait for network call
await page.waitForEvent("download"); // wait for download
await page.waitForTimeout(1000); // wait 1 second (use sparingly)
```
