# 🎭 Playwright TypeScript — Complete Test Case Demonstrations

> **What this file is:** Full, runnable test files showing complete test suites for every
> major web element type. Uses everything from Guide 1 (element interactions) and Guide 2
> (stable locator strategies). Copy any block as a starting point for your own tests.
>
> **Prerequisites:** Read `pw-ts-learning_1.md` (elements) and `pw-ts-learning_2.md` (locators) first.

---

## 📁 Recommended Project Structure

```
tests/
  form/
    text-inputs.spec.ts
    select-and-checkbox.spec.ts
    file-upload.spec.ts
  navigation/
    links-and-tabs.spec.ts
    pagination.spec.ts
  components/
    modal.spec.ts
    table.spec.ts
    toast.spec.ts
  network/
    api-mock.spec.ts
  session/
    cookies-and-storage.spec.ts
  accessibility/
    a11y.spec.ts
fixtures/
  auth.fixture.ts
playwright.config.ts
```

---

## 🧩 PART 1 — Form Inputs: Full Test Suite

> Covers: text, password, email, textarea, select, multi-select, checkbox, radio,
> date, range slider, file upload, submit/reset buttons.

```typescript
// tests/form/text-inputs.spec.ts
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────
// TEXT INPUT
// ─────────────────────────────────────────────

test.describe("Text Input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/register");
  });

  test("accepts typed value and holds it", async ({ page }) => {
    const firstNameInput = page.getByLabel("First Name");

    await firstNameInput.fill("Juan");

    await expect(firstNameInput).toHaveValue("Juan");
  });

  test("can be cleared after typing", async ({ page }) => {
    const firstNameInput = page.getByLabel("First Name");

    await firstNameInput.fill("Juan");
    await firstNameInput.fill(""); // overwrite with empty = clear

    await expect(firstNameInput).toHaveValue("");
  });

  test("shows validation error when submitted empty", async ({ page }) => {
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("First name is required")).toBeVisible();
  });

  test("respects maxlength attribute", async ({ page }) => {
    const input = page.getByLabel("Username");

    await input.fill("a".repeat(100)); // try to overfill

    // Playwright fills up to maxlength — assert the actual stored length
    const value = await input.inputValue();
    expect(value.length).toBeLessThanOrEqual(20); // assuming maxlength="20"
  });
});

// ─────────────────────────────────────────────
// PASSWORD INPUT
// ─────────────────────────────────────────────

test.describe("Password Input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/login");
  });

  test("is masked (type=password) by default", async ({ page }) => {
    const passwordInput = page.getByLabel("Password");

    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("toggle reveals then re-hides password", async ({ page }) => {
    const passwordInput = page.getByLabel("Password");
    const toggleBtn = page.getByRole("button", { name: /show password/i });

    await expect(passwordInput).toHaveAttribute("type", "password");

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("does not autocomplete on login form", async ({ page }) => {
    const passwordInput = page.getByLabel("Password");

    await expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });
});

// ─────────────────────────────────────────────
// EMAIL INPUT
// ─────────────────────────────────────────────

test.describe("Email Input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/register");
  });

  test("accepts a valid email address", async ({ page }) => {
    await page.getByLabel("Email").fill("juan@example.com");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("Enter a valid email")).not.toBeVisible();
  });

  test("rejects an invalid email format", async ({ page }) => {
    await page.getByLabel("Email").fill("notanemail");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("Enter a valid email")).toBeVisible();
  });

  test("rejects email without domain", async ({ page }) => {
    await page.getByLabel("Email").fill("user@");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("Enter a valid email")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────

test.describe("Textarea", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/contact");
  });

  test("accepts multi-line input", async ({ page }) => {
    const textarea = page.getByLabel("Message");

    await textarea.fill("Line one\nLine two\nLine three");

    const value = await textarea.inputValue();
    expect(value).toContain("\n");
  });

  test("character counter updates in real time", async ({ page }) => {
    const textarea = page.getByLabel("Message");

    await textarea.fill("Hello!");

    await expect(page.getByTestId("char-count")).toHaveText("6/500");
  });

  test("shows error when over character limit", async ({ page }) => {
    await page.getByLabel("Message").fill("A".repeat(501));
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Must be 500 characters or fewer")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// SELECT (DROPDOWN)
// ─────────────────────────────────────────────

test.describe("Select Dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/address-form");
  });

  test("selects an option by its visible label", async ({ page }) => {
    await page.selectOption(page.getByLabel("Country"), { label: "Philippines" });

    await expect(page.getByLabel("Country")).toHaveValue("PH");
  });

  test("selects an option by its underlying value", async ({ page }) => {
    await page.selectOption(page.getByLabel("Country"), { value: "PH" });

    await expect(page.getByLabel("Country")).toHaveValue("PH");
  });

  test("shows a default placeholder option initially", async ({ page }) => {
    const select = page.getByLabel("Country");

    await expect(select).toHaveValue(""); // empty = placeholder selected
  });

  test("shows/hides dependent field based on country selection", async ({
    page,
  }) => {
    await page.selectOption(page.getByLabel("Country"), { value: "US" });

    // US should show a State dropdown
    await expect(page.getByLabel("State")).toBeVisible();

    await page.selectOption(page.getByLabel("Country"), { value: "PH" });

    // Philippines does not have that dropdown
    await expect(page.getByLabel("State")).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────
// MULTI-SELECT
// ─────────────────────────────────────────────

test.describe("Multi-Select", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/preferences");
  });

  test("selects multiple options simultaneously", async ({ page }) => {
    await page.selectOption('select[name="skills"]', [
      "typescript",
      "playwright",
      "testing",
    ]);

    const selected = await page
      .locator('select[name="skills"]')
      .evaluate((el: HTMLSelectElement) =>
        Array.from(el.selectedOptions).map((o) => o.value),
      );

    expect(selected).toEqual(["typescript", "playwright", "testing"]);
  });

  test("deselects all options when passed an empty array", async ({ page }) => {
    await page.selectOption('select[name="skills"]', ["typescript"]);
    await page.selectOption('select[name="skills"]', []); // clear

    const selected = await page
      .locator('select[name="skills"]')
      .evaluate((el: HTMLSelectElement) => Array.from(el.selectedOptions));

    expect(selected).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────
// CHECKBOX
// ─────────────────────────────────────────────

test.describe("Checkbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/settings");
  });

  test("can be checked", async ({ page }) => {
    const checkbox = page.getByLabel("Subscribe to newsletter");

    await checkbox.check();

    await expect(checkbox).toBeChecked();
  });

  test("can be unchecked after being checked", async ({ page }) => {
    const checkbox = page.getByLabel("Subscribe to newsletter");

    await checkbox.check();
    await checkbox.uncheck();

    await expect(checkbox).not.toBeChecked();
  });

  test("blocks form submission when required checkbox is unchecked", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/register");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("You must accept the terms")).toBeVisible();
  });

  test("checking all items checks the 'Select All' master checkbox", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/users");

    const checkboxes = page.locator('input[type="checkbox"][data-row]');
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    await expect(page.getByTestId("select-all-checkbox")).toBeChecked();
  });
});

// ─────────────────────────────────────────────
// RADIO BUTTONS
// ─────────────────────────────────────────────

test.describe("Radio Buttons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/survey");
  });

  test("only one radio button can be selected at a time", async ({ page }) => {
    const optionA = page.getByRole("radio", { name: "Option A" });
    const optionB = page.getByRole("radio", { name: "Option B" });
    const optionC = page.getByRole("radio", { name: "Option C" });

    await optionA.check();
    await expect(optionA).toBeChecked();
    await expect(optionB).not.toBeChecked();
    await expect(optionC).not.toBeChecked();

    await optionB.check();
    await expect(optionB).toBeChecked();
    await expect(optionA).not.toBeChecked(); // auto-deselected
    await expect(optionC).not.toBeChecked();
  });

  test("shows relevant content when each option is selected", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "Credit Card" }).check();
    await expect(page.getByTestId("credit-card-fields")).toBeVisible();
    await expect(page.getByTestId("gcash-fields")).not.toBeVisible();

    await page.getByRole("radio", { name: "GCash" }).check();
    await expect(page.getByTestId("gcash-fields")).toBeVisible();
    await expect(page.getByTestId("credit-card-fields")).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────
// DATE PICKER
// ─────────────────────────────────────────────

test.describe("Date Picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/booking");
  });

  test("accepts a valid future date", async ({ page }) => {
    await page.fill('input[type="date"]', "2099-12-31");

    await expect(page.locator('input[type="date"]')).toHaveValue("2099-12-31");
  });

  test("rejects a past date", async ({ page }) => {
    await page.fill('input[type="date"]', "2000-01-01");
    await page.getByRole("button", { name: "Book Now" }).click();

    await expect(page.getByText("Date cannot be in the past")).toBeVisible();
  });

  test("check-out date cannot be before check-in date", async ({ page }) => {
    await page.fill('input[name="checkIn"]', "2099-06-15");
    await page.fill('input[name="checkOut"]', "2099-06-10"); // before check-in
    await page.getByRole("button", { name: "Book Now" }).click();

    await expect(
      page.getByText("Check-out must be after check-in"),
    ).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// RANGE SLIDER
// ─────────────────────────────────────────────

test.describe("Range Slider", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/filters");
  });

  test("setting slider value updates the displayed label", async ({ page }) => {
    await page.fill('input[type="range"][name="maxPrice"]', "750");

    await expect(page.getByTestId("slider-value")).toHaveText("₱750");
  });

  test("slider cannot exceed its maximum value", async ({ page }) => {
    await page.fill('input[type="range"][name="maxPrice"]', "99999");

    const value = await page
      .locator('input[type="range"][name="maxPrice"]')
      .inputValue();

    // Browser clamps to max
    expect(Number(value)).toBeLessThanOrEqual(1000);
  });
});

// ─────────────────────────────────────────────
// FILE UPLOAD
// ─────────────────────────────────────────────

test.describe("File Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/upload");
  });

  test("accepts a valid PDF file", async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
      name: "resume.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 fake content"),
    });

    await expect(page.getByText("resume.pdf")).toBeVisible();
  });

  test("rejects a disallowed file type", async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
      name: "malware.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("fake binary"),
    });

    await page.getByRole("button", { name: "Upload" }).click();

    await expect(
      page.getByText("Only PDF, JPG, and PNG are allowed"),
    ).toBeVisible();
  });

  test("shows upload progress during file transfer", async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
      name: "large.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(1024 * 500), // 500 KB
    });

    await page.getByRole("button", { name: "Upload" }).click();

    const progressBar = page.getByRole("progressbar");
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveAttribute("aria-valuenow", "100", {
      timeout: 15000,
    });
  });

  test("shows success message after upload completes", async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
      name: "photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake jpg"),
    });

    await page.getByRole("button", { name: "Upload" }).click();

    await expect(page.getByText("Upload successful")).toBeVisible({
      timeout: 10000,
    });
  });
});

// ─────────────────────────────────────────────
// SUBMIT & RESET BUTTONS
// ─────────────────────────────────────────────

test.describe("Submit and Reset Buttons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/contact");
  });

  test("submit button is disabled after first click (prevents double submit)", async ({
    page,
  }) => {
    await page.getByLabel("Email").fill("juan@example.com");
    await page.getByLabel("Message").fill("Hello!");

    const submitBtn = page.getByRole("button", { name: "Send Message" });
    await submitBtn.click();

    await expect(submitBtn).toBeDisabled();
  });

  test("reset button clears all form fields", async ({ page }) => {
    await page.getByLabel("Name").fill("Juan");
    await page.getByLabel("Email").fill("juan@example.com");
    await page.getByLabel("Message").fill("Hello!");

    await page.getByRole("button", { name: "Reset" }).click();

    await expect(page.getByLabel("Name")).toHaveValue("");
    await expect(page.getByLabel("Email")).toHaveValue("");
    await expect(page.getByLabel("Message")).toHaveValue("");
  });
});
```

---

## 🔗 PART 2 — Navigation & Links: Full Test Suite

```typescript
// tests/navigation/links-and-tabs.spec.ts
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────
// ANCHOR LINKS
// ─────────────────────────────────────────────

test.describe("Anchor Links", () => {
  test("main nav link navigates to the correct route", async ({ page }) => {
    await page.goto("https://your-app.com");

    await page.getByRole("link", { name: "About Us" }).click();

    await expect(page).toHaveURL(/.*\/about/);
    await expect(page).toHaveTitle(/About/);
  });

  test("external link has target=_blank and opens new tab", async ({
    page,
    context,
  }) => {
    await page.goto("https://your-app.com");

    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("link", { name: "Visit Partner Site" }).click(),
    ]);

    await newPage.waitForLoadState();
    expect(newPage.url()).toContain("partner-site.com");
    await newPage.close();
  });

  test("broken link shows 404 page", async ({ page }) => {
    const response = await page.goto("https://your-app.com/does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────

test.describe("Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/dashboard");
  });

  test("first tab is active by default", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
  });

  test("clicking a tab activates it and hides others", async ({ page }) => {
    await page.getByRole("tab", { name: "Reports" }).click();

    // Active tab
    await expect(page.getByRole("tab", { name: "Reports" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tabpanel", { name: "Reports" })).toBeVisible();

    // Previous tab hidden
    await expect(
      page.getByRole("tabpanel", { name: "Overview" }),
    ).not.toBeVisible();
  });

  test("arrow keys navigate between tabs", async ({ page }) => {
    await page.getByRole("tab", { name: "Overview" }).focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByRole("tab", { name: "Reports" })).toBeFocused();
  });
});

// ─────────────────────────────────────────────
// BREADCRUMBS
// ─────────────────────────────────────────────

test.describe("Breadcrumbs", () => {
  test("displays the correct hierarchy for a deep page", async ({ page }) => {
    await page.goto("https://your-app.com/categories/shoes/running");

    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(
      breadcrumb.getByRole("link", { name: "Shoes" }),
    ).toBeVisible();
    await expect(breadcrumb.getByText("Running")).toBeVisible(); // current page, no link
  });

  test("clicking a breadcrumb navigates back up", async ({ page }) => {
    await page.goto("https://your-app.com/categories/shoes/running");

    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Shoes" })
      .click();

    await expect(page).toHaveURL(/.*\/shoes$/);
  });
});

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────

test.describe("Pagination", () => {
  test("Previous button is disabled on page 1", async ({ page }) => {
    await page.goto("https://your-app.com/products?page=1");

    await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  test("clicking Next advances to page 2", async ({ page }) => {
    await page.goto("https://your-app.com/products?page=1");

    await page.getByRole("button", { name: "Next" }).click();

    await expect(page).toHaveURL(/page=2/);
  });

  test("Next button is disabled on the last page", async ({ page }) => {
    await page.goto("https://your-app.com/products?page=99");

    await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  test("clicking a page number navigates to that page", async ({ page }) => {
    await page.goto("https://your-app.com/products?page=1");

    await page.getByRole("button", { name: "5" }).click();

    await expect(page).toHaveURL(/page=5/);
  });
});

// ─────────────────────────────────────────────
// HAMBURGER MENU (MOBILE)
// ─────────────────────────────────────────────

test.describe("Hamburger Menu", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 size

  test("hamburger opens mobile nav and closes it again", async ({ page }) => {
    await page.goto("https://your-app.com");

    const mobileNav = page.getByTestId("mobile-nav");
    const hamburger = page.getByRole("button", { name: "Open menu" });

    await expect(mobileNav).not.toBeVisible();

    await hamburger.click();
    await expect(mobileNav).toBeVisible();

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(mobileNav).not.toBeVisible();
  });

  test("nav links inside mobile menu work correctly", async ({ page }) => {
    await page.goto("https://your-app.com");

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("link", { name: "Products" }).click();

    await expect(page).toHaveURL(/.*\/products/);
  });
});
```

---

## ⚡ PART 3 — Interactive Components: Full Test Suite

```typescript
// tests/components/modal.spec.ts
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────
// MODAL / DIALOG
// ─────────────────────────────────────────────

test.describe("Modal / Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/users");
  });

  test("modal opens when trigger button is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "Add User" }).click();

    await expect(page.getByRole("dialog", { name: "Add User" })).toBeVisible();
  });

  test("modal closes via the Close button", async ({ page }) => {
    await page.getByRole("button", { name: "Add User" }).click();
    await page.getByRole("button", { name: "Close" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("Escape key closes the modal", async ({ page }) => {
    await page.getByRole("button", { name: "Add User" }).click();
    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking the backdrop closes the modal", async ({ page }) => {
    await page.getByRole("button", { name: "Add User" }).click();
    await page.getByTestId("modal-backdrop").click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("focus is trapped inside the modal while open", async ({ page }) => {
    await page.getByRole("button", { name: "Add User" }).click();

    // Tab through all elements — focus should stay inside the dialog
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const focusedInsideDialog = await page.evaluate(
      () => document.activeElement?.closest('[role="dialog"]') !== null,
    );
    expect(focusedInsideDialog).toBe(true);
  });

  test("confirm modal: accepting fires the action, cancelling does not", async ({
    page,
  }) => {
    // --- Cancel flow ---
    await page.getByTestId("delete-user-btn").click();
    await expect(page.getByRole("dialog", { name: "Confirm Delete" })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByTestId("user-row-juan")).toBeVisible(); // still there

    // --- Confirm flow ---
    await page.getByTestId("delete-user-btn").click();
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByTestId("user-row-juan")).not.toBeVisible();
  });

  test("modal has correct ARIA attributes for screen readers", async ({ page }) => {
    await page.getByRole("button", { name: "Add User" }).click();

    const dialog = page.getByRole("dialog", { name: "Add User" });

    // aria-modal tells screen readers the rest of the page is inert
    await expect(dialog).toHaveAttribute("aria-modal", "true");

    // aria-labelledby must point to the visible heading inside the modal
    const labelledBy = await dialog.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    await expect(page.locator(`#${labelledBy}`)).toHaveText("Add User");
  });

  test("page background is non-interactive while modal is open", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add User" }).click();

    // Background content should have inert or aria-hidden applied
    const mainContent = page.getByRole("main");
    const ariaHidden = await mainContent.getAttribute("aria-hidden");
    const inert = await mainContent.getAttribute("inert");

    expect(ariaHidden === "true" || inert !== null).toBe(true);
  });

  test("form inside modal validates before submitting", async ({ page }) => {
    await page.getByRole("button", { name: "Add User" }).click();

    // Submit without filling required fields
    await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();

    // Errors appear inside the modal, modal stays open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("submit button shows loading state during async save", async ({ page }) => {
    // Delay the API response so the loading state is observable
    await page.route("**/api/users", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.continue();
    });

    await page.getByRole("button", { name: "Add User" }).click();
    await page.getByRole("dialog").getByLabel("Name").fill("Maria Santos");
    await page.getByRole("dialog").getByLabel("Email").fill("maria@example.com");

    const saveBtn = page.getByRole("dialog").getByRole("button", { name: "Save" });
    await saveBtn.click();

    // Button should be disabled and show a loading indicator
    await expect(saveBtn).toBeDisabled();
    await expect(page.getByRole("dialog").getByTestId("btn-spinner")).toBeVisible();
  });

  test("modal with long content scrolls internally, not the page", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "View Terms" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Record page scroll position before scrolling inside modal
    const pageScrollBefore = await page.evaluate(() => window.scrollY);

    // Scroll inside the modal
    await dialog.evaluate((el) => (el.scrollTop = 500));

    const pageScrollAfter = await page.evaluate(() => window.scrollY);

    // Page should NOT have scrolled
    expect(pageScrollAfter).toBe(pageScrollBefore);

    // Modal should have scrolled
    const dialogScrollTop = await dialog.evaluate((el) => el.scrollTop);
    expect(dialogScrollTop).toBeGreaterThan(0);
  });

  test("opening a second modal from inside the first stacks correctly", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add User" }).click();
    await expect(page.getByRole("dialog", { name: "Add User" })).toBeVisible();

    // Trigger a nested confirmation modal from within the first modal
    await page
      .getByRole("dialog", { name: "Add User" })
      .getByRole("button", { name: "Import CSV" })
      .click();

    // Both modals should be visible
    await expect(page.getByRole("dialog", { name: "Add User" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Import CSV" })).toBeVisible();

    // Closing the nested one should leave the first open
    await page
      .getByRole("dialog", { name: "Import CSV" })
      .getByRole("button", { name: "Cancel" })
      .click();

    await expect(page.getByRole("dialog", { name: "Import CSV" })).not.toBeVisible();
    await expect(page.getByRole("dialog", { name: "Add User" })).toBeVisible();
  });

  test("modal can be opened, closed, and re-opened without errors", async ({
    page,
  }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Add User" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────
// ACCORDION
// ─────────────────────────────────────────────

test.describe("Accordion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/faq");
  });

  test("all panels are collapsed by default", async ({ page }) => {
    const panels = page.locator('[data-testid^="faq-panel-"]');
    const count = await panels.count();

    for (let i = 0; i < count; i++) {
      await expect(panels.nth(i)).not.toBeVisible();
    }
  });

  test("clicking a header expands its panel", async ({ page }) => {
    await page.getByRole("button", { name: "What is your return policy?" }).click();

    await expect(page.getByTestId("faq-panel-1")).toBeVisible();
  });

  test("clicking an open header collapses it", async ({ page }) => {
    const header = page.getByRole("button", { name: "What is your return policy?" });

    await header.click();
    await expect(page.getByTestId("faq-panel-1")).toBeVisible();

    await header.click();
    await expect(page.getByTestId("faq-panel-1")).not.toBeVisible();
  });

  test("only one panel is open at a time (exclusive mode)", async ({ page }) => {
    await page.getByRole("button", { name: "What is your return policy?" }).click();
    await page.getByRole("button", { name: "How long does shipping take?" }).click();

    await expect(page.getByTestId("faq-panel-1")).not.toBeVisible();
    await expect(page.getByTestId("faq-panel-2")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────

test.describe("Tooltip", () => {
  test("appears on hover and contains the correct text", async ({ page }) => {
    await page.goto("https://your-app.com/dashboard");

    await page.getByTestId("revenue-info-icon").hover();

    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Total revenue for this month");
  });

  test("disappears when mouse moves away", async ({ page }) => {
    await page.goto("https://your-app.com/dashboard");

    await page.getByTestId("revenue-info-icon").hover();
    await expect(page.getByRole("tooltip")).toBeVisible();

    await page.mouse.move(0, 0); // move to corner

    await expect(page.getByRole("tooltip")).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────
// TOAST / SNACKBAR
// ─────────────────────────────────────────────

test.describe("Toast Notifications", () => {
  test("success toast appears after saving settings", async ({ page }) => {
    await page.goto("https://your-app.com/settings");

    await page.getByLabel("Display Name").fill("Juan dela Cruz");
    await page.getByRole("button", { name: "Save Changes" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Settings saved successfully");
  });

  test("error toast appears when save fails", async ({ page }) => {
    // Simulate server error
    await page.route("**/api/settings", (route) =>
      route.fulfill({ status: 500 }),
    );

    await page.goto("https://your-app.com/settings");
    await page.getByRole("button", { name: "Save Changes" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Failed to save");
  });

  test("toast auto-dismisses after a few seconds", async ({ page }) => {
    await page.goto("https://your-app.com/settings");

    await page.getByRole("button", { name: "Save Changes" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();
    await expect(toast).not.toBeVisible({ timeout: 6000 }); // auto-dismiss
  });

  test("warning toast appears when leaving a form with unsaved changes", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/settings");

    await page.getByLabel("Display Name").fill("Changed Name");

    // Navigate away without saving
    await page.getByRole("link", { name: "Dashboard" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("You have unsaved changes");
    await expect(toast).toHaveAttribute("data-type", "warning");
  });

  test("info toast appears for non-critical notices", async ({ page }) => {
    await page.goto("https://your-app.com/dashboard");

    await page.getByRole("button", { name: "Sync Data" }).click();

    const toast = page.getByRole("status"); // info toasts use role="status", not "alert"
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Syncing");
    await expect(toast).toHaveAttribute("data-type", "info");
  });

  test("each toast type renders the correct icon", async ({ page }) => {
    await page.goto("https://your-app.com/toast-demo"); // a dev-only demo page

    // Trigger all four types and check icons
    const types: Array<{ trigger: string; icon: string; role: string }> = [
      { trigger: "Trigger Success", icon: "icon-check", role: "alert" },
      { trigger: "Trigger Error",   icon: "icon-x",     role: "alert" },
      { trigger: "Trigger Warning", icon: "icon-warn",  role: "alert" },
      { trigger: "Trigger Info",    icon: "icon-info",  role: "status" },
    ];

    for (const { trigger, icon, role } of types) {
      await page.getByRole("button", { name: trigger }).click();

      const toast = page.getByRole(role as "alert" | "status").last();
      await expect(toast).toBeVisible();
      await expect(toast.getByTestId(icon)).toBeVisible();

      // Dismiss before next iteration
      await toast.getByRole("button", { name: "Dismiss" }).click();
      await expect(toast).not.toBeVisible({ timeout: 3000 });
    }
  });

  test("toast can be manually dismissed via its close button", async ({ page }) => {
    await page.goto("https://your-app.com/settings");

    await page.getByRole("button", { name: "Save Changes" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();

    // Dismiss before the auto-timer fires
    await toast.getByRole("button", { name: "Dismiss" }).click();

    await expect(toast).not.toBeVisible();
  });

  test("toast with Undo action: clicking Undo reverses the operation", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/users");

    await page.locator("tr").filter({ hasText: "Juan dela Cruz" }).getByRole("button", { name: "Delete" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("User deleted");

    // Click Undo inside the toast
    await toast.getByRole("button", { name: "Undo" }).click();

    // The deleted row should reappear
    await expect(
      page.locator("tr").filter({ hasText: "Juan dela Cruz" }),
    ).toBeVisible();
  });

  test("multiple toasts stack and each dismisses independently", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/toast-demo");

    // Fire three toasts in quick succession
    await page.getByRole("button", { name: "Trigger Success" }).click();
    await page.getByRole("button", { name: "Trigger Error" }).click();
    await page.getByRole("button", { name: "Trigger Info" }).click();

    const toasts = page.getByRole("alert");
    await expect(toasts).toHaveCount(3);

    // Dismiss the first one — other two should remain
    await toasts.first().getByRole("button", { name: "Dismiss" }).click();
    await expect(toasts).toHaveCount(2);
  });

  test("toasts appear in the correct screen region (bottom-right)", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/settings");

    await page.getByRole("button", { name: "Save Changes" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();

    const box = await toast.boundingBox();
    const viewport = page.viewportSize()!;

    // Toast should be in the bottom-right quadrant
    expect(box!.x).toBeGreaterThan(viewport.width / 2);
    expect(box!.y).toBeGreaterThan(viewport.height / 2);
  });

  test("persistent toast does not auto-dismiss (no timeout set)", async ({
    page,
  }) => {
    // Simulate a critical error that should stay until manually dismissed
    await page.route("**/api/sync", (route) =>
      route.fulfill({ status: 503, body: JSON.stringify({ error: "Service unavailable" }) }),
    );

    await page.goto("https://your-app.com/dashboard");
    await page.getByRole("button", { name: "Sync Data" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();

    // Wait longer than normal auto-dismiss window
    await page.waitForTimeout(7000);

    // Should still be visible because it's persistent
    await expect(toast).toBeVisible();
  });

  test("toast is announced to screen readers via a live region", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/settings");

    // The toast container must have aria-live so screen readers announce it
    const toastContainer = page.getByTestId("toast-container");
    await expect(toastContainer).toHaveAttribute("aria-live", /(polite|assertive)/);

    await page.getByRole("button", { name: "Save Changes" }).click();

    const toast = page.getByRole("alert");
    await expect(toast).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// DRAG AND DROP
// ─────────────────────────────────────────────

test.describe("Drag and Drop", () => {
  test("dragging a card to a new column updates its position", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/kanban");

    const card = page.getByTestId("card-1");
    const doneColumn = page.getByTestId("column-done");

    await card.dragTo(doneColumn);

    // Card should now exist inside the Done column
    await expect(doneColumn.getByTestId("card-1")).toBeVisible();
  });
});
```

---

## 📊 PART 4 — Tables: Full Test Suite

```typescript
// tests/components/table.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Data Table", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://your-app.com/users");
  });

  // ── RENDERING ──────────────────────────────

  test("renders the correct number of rows", async ({ page }) => {
    const rows = page.locator("table tbody tr");

    await expect(rows).toHaveCount(10);
  });

  test("renders the correct column headers", async ({ page }) => {
    const headers = page.locator("table thead th");

    await expect(headers.nth(0)).toHaveText("Name");
    await expect(headers.nth(1)).toHaveText("Email");
    await expect(headers.nth(2)).toHaveText("Role");
    await expect(headers.nth(3)).toHaveText("Status");
    await expect(headers.nth(4)).toHaveText("Actions");
  });

  test("first row contains expected data", async ({ page }) => {
    const firstRow = page.locator("table tbody tr:first-child");

    await expect(firstRow.locator("td:nth-child(1)")).toHaveText("Juan dela Cruz");
    await expect(firstRow.locator("td:nth-child(2)")).toHaveText("juan@example.com");
    await expect(firstRow.locator("td:nth-child(3)")).toHaveText("Admin");
  });

  // ── SORTING ────────────────────────────────

  test("clicking Name header sorts rows A→Z", async ({ page }) => {
    await page.getByRole("columnheader", { name: "Name" }).click();

    const firstCell = page.locator("table tbody tr:first-child td:nth-child(1)");
    await expect(firstCell).toHaveText("Alice");
  });

  test("clicking Name header twice sorts rows Z→A", async ({ page }) => {
    await page.getByRole("columnheader", { name: "Name" }).click();
    await page.getByRole("columnheader", { name: "Name" }).click();

    const firstCell = page.locator("table tbody tr:first-child td:nth-child(1)");
    await expect(firstCell).toHaveText("Zelda");
  });

  test("sort icon shows correct direction after click", async ({ page }) => {
    await page.getByRole("columnheader", { name: "Name" }).click();

    await expect(
      page.getByRole("columnheader", { name: "Name" }).getByTestId("sort-asc-icon"),
    ).toBeVisible();

    await page.getByRole("columnheader", { name: "Name" }).click();

    await expect(
      page.getByRole("columnheader", { name: "Name" }).getByTestId("sort-desc-icon"),
    ).toBeVisible();
  });

  // ── FILTERING / SEARCH ─────────────────────

  test("search input filters rows to matching results", async ({ page }) => {
    await page.getByPlaceholder("Search users...").fill("juan");

    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("juan");
  });

  test("search is case-insensitive", async ({ page }) => {
    await page.getByPlaceholder("Search users...").fill("JUAN");

    await expect(page.locator("table tbody tr")).toHaveCount(1);
  });

  test("empty state message appears when no rows match", async ({ page }) => {
    await page.getByPlaceholder("Search users...").fill("zzznomatch");

    await expect(page.getByText("No users found")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(0);
  });

  test("clearing search restores all rows", async ({ page }) => {
    const search = page.getByPlaceholder("Search users...");
    await search.fill("juan");
    await search.fill(""); // clear

    await expect(page.locator("table tbody tr")).toHaveCount(10);
  });

  // ── ROW ACTIONS ────────────────────────────

  test("clicking View navigates to the user detail page", async ({ page }) => {
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.getByRole("button", { name: "View" }).click();

    await expect(page).toHaveURL(/.*\/users\/\d+/);
  });

  test("clicking Delete for a specific user removes that row", async ({
    page,
  }) => {
    const targetRow = page.locator("tr").filter({ hasText: "Juan dela Cruz" });

    await targetRow.getByRole("button", { name: "Delete" }).click();

    // Confirm in the dialog
    await page.getByRole("button", { name: "Confirm Delete" }).click();

    await expect(
      page.locator("tr").filter({ hasText: "Juan dela Cruz" }),
    ).toHaveCount(0);
  });
});
```

---

## 🌐 PART 5 — Network & Async: Full Test Suite

```typescript
// tests/network/api-mock.spec.ts
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────
// WAITING FOR REAL API RESPONSES
// ─────────────────────────────────────────────

test.describe("Real API Interactions", () => {
  test("form submission triggers the correct API endpoint", async ({ page }) => {
    await page.goto("https://your-app.com/contact");

    await page.getByLabel("Email").fill("juan@example.com");
    await page.getByLabel("Message").fill("Hello from Playwright!");

    const [response] = await Promise.all([
      page.waitForResponse("**/api/contact"),
      page.getByRole("button", { name: "Send" }).click(),
    ]);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("data table loads users from the API on page load", async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse("**/api/users"),
      page.goto("https://your-app.com/users"),
    ]);

    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(users.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// MOCKING API RESPONSES
// ─────────────────────────────────────────────

test.describe("Mocked API States", () => {
  test("shows empty state when API returns an empty array", async ({ page }) => {
    await page.route("**/api/users", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify([]) }),
    );

    await page.goto("https://your-app.com/users");

    await expect(page.getByText("No users found")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(0);
  });

  test("shows error banner when API returns 500", async ({ page }) => {
    await page.route("**/api/users", (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      }),
    );

    await page.goto("https://your-app.com/users");

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toContainText("Something went wrong");
  });

  test("shows offline banner when network is unavailable", async ({ page }) => {
    await page.route("**/api/**", (route) => route.abort("failed"));

    await page.goto("https://your-app.com/users");

    await expect(page.getByText("Unable to connect")).toBeVisible();
  });

  test("mocked product data renders correctly in the UI", async ({ page }) => {
    const mockProducts = [
      { id: 1, name: "Running Shoes Pro", price: 2999 },
      { id: 2, name: "Trail Sneakers", price: 1999 },
    ];

    await page.route("**/api/products", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProducts),
      }),
    );

    await page.goto("https://your-app.com/shop");

    await expect(page.getByText("Running Shoes Pro")).toBeVisible();
    await expect(page.getByText("Trail Sneakers")).toBeVisible();
    await expect(page.getByText("₱2,999")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// LOADING STATES
// ─────────────────────────────────────────────

test.describe("Loading States", () => {
  test("spinner appears while data loads, then disappears", async ({ page }) => {
    // Delay the API response to make the spinner visible
    await page.route("**/api/dashboard", async (route) => {
      await new Promise((r) => setTimeout(r, 800)); // 800ms delay
      await route.continue();
    });

    await page.goto("https://your-app.com/dashboard");

    const spinner = page.getByTestId("loading-spinner");
    await expect(spinner).toBeVisible();
    await expect(spinner).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("dashboard-content")).toBeVisible();
  });

  test("skeleton screens show while content loads", async ({ page }) => {
    await page.route("**/api/articles", async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.continue();
    });

    await page.goto("https://your-app.com/blog");

    // Skeletons appear first
    await expect(page.getByTestId("article-skeleton")).toBeVisible();

    // Then real content
    await expect(page.getByTestId("article-skeleton")).not.toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('[data-testid="article-card"]').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// FILE DOWNLOAD
// ─────────────────────────────────────────────

test.describe("File Downloads", () => {
  test("export CSV button triggers a file download", async ({ page }) => {
    await page.goto("https://your-app.com/reports");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export CSV" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/.*\.csv$/);
    const path = await download.path();
    expect(path).not.toBeNull();
  });

  test("downloaded CSV contains a header row", async ({ page }) => {
    await page.goto("https://your-app.com/reports");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export CSV" }).click(),
    ]);

    const content = await download
      .createReadStream()
      .then(
        (stream) =>
          new Promise<string>((resolve) => {
            let data = "";
            stream.on("data", (chunk: Buffer) => (data += chunk.toString()));
            stream.on("end", () => resolve(data));
          }),
      );

    expect(content).toContain("Name,Email,Role"); // header row check
  });
});
```

---

## 🧭 PART 6 — Session & Browser: Full Test Suite

```typescript
// tests/session/cookies-and-storage.spec.ts
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────
// COOKIES
// ─────────────────────────────────────────────

test.describe("Cookies", () => {
  test("login sets an httpOnly auth cookie", async ({ page, context }) => {
    await page.goto("https://your-app.com/login");
    await page.getByLabel("Email").fill("juan@example.com");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Log in" }).click();

    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === "auth_token");

    expect(authCookie).toBeDefined();
    expect(authCookie?.httpOnly).toBe(true);
    expect(authCookie?.secure).toBe(true);
  });

  test("logout clears the auth cookie", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "auth_token",
        value: "test-token",
        domain: "your-app.com",
        path: "/",
      },
    ]);

    await page.goto("https://your-app.com/dashboard");
    await page.getByRole("button", { name: "Log out" }).click();

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "auth_token")).toBeUndefined();
  });

  test("cookie banner appears on first visit", async ({ page }) => {
    await page.goto("https://your-app.com");

    await expect(page.getByTestId("cookie-banner")).toBeVisible();
  });

  test("accepting cookies hides the banner and sets consent cookie", async ({
    page,
    context,
  }) => {
    await page.goto("https://your-app.com");
    await page.getByRole("button", { name: "Accept All" }).click();

    await expect(page.getByTestId("cookie-banner")).not.toBeVisible();

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "cookie_consent")).toBeDefined();
  });
});

// ─────────────────────────────────────────────
// LOCAL STORAGE
// ─────────────────────────────────────────────

test.describe("LocalStorage", () => {
  test("toggling dark mode saves the preference to localStorage", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/settings");

    await page.getByRole("switch", { name: "Dark mode" }).click();

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");
  });

  test("app reads dark mode preference from localStorage on load", async ({
    page,
  }) => {
    await page.goto("https://your-app.com");
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();

    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("cart items persist in localStorage across page refreshes", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/shop");

    await page
      .locator('[data-product-id="prod_001"]')
      .getByRole("button", { name: "Add to Cart" })
      .click();

    await page.reload();

    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cart") ?? "[]"),
    );
    expect(cart.some((item: { id: string }) => item.id === "prod_001")).toBe(true);
  });
});

// ─────────────────────────────────────────────
// NATIVE BROWSER DIALOGS
// ─────────────────────────────────────────────

test.describe("Browser Dialogs", () => {
  test("alert dialog: dismissing it lets the test continue", async ({ page }) => {
    await page.goto("https://your-app.com/notifications");

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("alert");
      expect(dialog.message()).toContain("Notification sent");
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Send Test Notification" }).click();

    // Page should still be functional after dialog is dismissed
    await expect(page).toHaveURL(/.*\/notifications/);
  });

  test("confirm dialog: accepting proceeds with the action", async ({ page }) => {
    await page.goto("https://your-app.com/users");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Are you sure?");
      await dialog.accept();
    });

    await page.getByTestId("delete-user-btn").click();

    await expect(page.getByTestId("user-row-1")).not.toBeVisible();
  });

  test("confirm dialog: dismissing cancels the action", async ({ page }) => {
    await page.goto("https://your-app.com/users");

    page.once("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await page.getByTestId("delete-user-btn").click();

    await expect(page.getByTestId("user-row-1")).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// KEYBOARD NAVIGATION
// ─────────────────────────────────────────────

test.describe("Keyboard Navigation", () => {
  test("Tab key moves focus through form fields in the correct order", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/contact");

    await page.getByLabel("Name").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Email")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Message")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Send Message" }),
    ).toBeFocused();
  });

  test("Enter key in last text field submits the form", async ({ page }) => {
    await page.goto("https://your-app.com/login");

    await page.getByLabel("Email").fill("juan@example.com");
    await page.getByLabel("Password").fill("Password123!");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("Space bar toggles checkboxes when focused", async ({ page }) => {
    await page.goto("https://your-app.com/settings");

    const checkbox = page.getByLabel("Subscribe to newsletter");
    await checkbox.focus();
    await page.keyboard.press("Space");

    await expect(checkbox).toBeChecked();
  });
});

// ─────────────────────────────────────────────
// RESPONSIVE / VIEWPORT
// ─────────────────────────────────────────────

test.describe("Responsive Layout", () => {
  test("mobile (390px): shows hamburger, hides desktop nav", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("https://your-app.com");

    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.getByTestId("desktop-nav")).not.toBeVisible();
  });

  test("tablet (768px): sidebar is collapsible", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("https://your-app.com/dashboard");

    await expect(page.getByTestId("sidebar-toggle")).toBeVisible();
  });

  test("desktop (1440px): shows full nav and sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("https://your-app.com/dashboard");

    await expect(page.getByTestId("desktop-nav")).toBeVisible();
    await expect(page.getByTestId("sidebar")).toBeVisible();
  });

  test("layout adapts correctly on viewport resize", async ({ page }) => {
    await page.goto("https://your-app.com");

    // Start desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByTestId("desktop-nav")).toBeVisible();

    // Shrink to mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("desktop-nav")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// CLIPBOARD
// ─────────────────────────────────────────────

test.describe("Clipboard", () => {
  test("copy button copies the invite link to the clipboard", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("https://your-app.com/invite");

    await page.getByRole("button", { name: "Copy Link" }).click();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toMatch(/https:\/\/your-app\.com\/invite\/.+/);
  });

  test("copy button shows a visual confirmation after click", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("https://your-app.com/invite");

    await page.getByRole("button", { name: "Copy Link" }).click();

    await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
  });
});
```

---

## ♿ PART 7 — Accessibility: Full Test Suite

```typescript
// tests/accessibility/a11y.spec.ts
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────
// PAGE-LEVEL METADATA
// ─────────────────────────────────────────────

test.describe("Page Metadata (SEO + A11y)", () => {
  test("home page has the correct title", async ({ page }) => {
    await page.goto("https://your-app.com");
    await expect(page).toHaveTitle("Home | Your App");
  });

  test("every page has a meta description", async ({ page }) => {
    for (const route of ["/", "/about", "/products", "/contact"]) {
      await page.goto(`https://your-app.com${route}`);

      const meta = page.locator('meta[name="description"]');
      const content = await meta.getAttribute("content");

      expect(content, `Missing meta description on ${route}`).not.toBeNull();
      expect(
        content!.length,
        `Meta description too short on ${route}`,
      ).toBeGreaterThan(10);
    }
  });

  test("page has exactly one h1", async ({ page }) => {
    await page.goto("https://your-app.com/about");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });
});

// ─────────────────────────────────────────────
// ARIA & ROLES
// ─────────────────────────────────────────────

test.describe("ARIA Roles and Labels", () => {
  test("all images have non-empty alt text", async ({ page }) => {
    await page.goto("https://your-app.com/gallery");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(
        alt,
        `Image at index ${i} is missing alt text`,
      ).not.toBeNull();
      expect(alt!.length, `Image at index ${i} has empty alt`).toBeGreaterThan(0);
    }
  });

  test("icon-only buttons have an accessible label", async ({ page }) => {
    await page.goto("https://your-app.com/users");

    const iconButtons = page.locator('button[aria-label]');
    const count = await iconButtons.count();

    for (let i = 0; i < count; i++) {
      const label = await iconButtons.nth(i).getAttribute("aria-label");
      expect(label!.length).toBeGreaterThan(0);
    }
  });

  test("form error messages are linked to their inputs via aria-describedby", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/register");
    await page.getByRole("button", { name: "Register" }).click();

    const emailInput = page.getByLabel("Email");
    const describedBy = await emailInput.getAttribute("aria-describedby");

    // The error element should exist with that ID
    if (describedBy) {
      await expect(page.locator(`#${describedBy}`)).toBeVisible();
    }
  });

  test("loading spinner has an aria-label for screen readers", async ({ page }) => {
    await page.route("**/api/dashboard", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });

    await page.goto("https://your-app.com/dashboard");

    const spinner = page.getByTestId("loading-spinner");
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveAttribute("aria-label", /.+/);
  });
});

// ─────────────────────────────────────────────
// FOCUS MANAGEMENT
// ─────────────────────────────────────────────

test.describe("Focus Management", () => {
  test("focus moves into the modal when it opens", async ({ page }) => {
    await page.goto("https://your-app.com/users");

    await page.getByRole("button", { name: "Add User" }).click();

    // First focusable element inside the modal should have focus
    const focusedInDialog = await page.evaluate(
      () => document.activeElement?.closest('[role="dialog"]') !== null,
    );
    expect(focusedInDialog).toBe(true);
  });

  test("focus returns to trigger button when modal closes", async ({ page }) => {
    await page.goto("https://your-app.com/users");

    const triggerBtn = page.getByRole("button", { name: "Add User" });
    await triggerBtn.click();
    await page.keyboard.press("Escape");

    await expect(triggerBtn).toBeFocused();
  });

  test("skip-to-content link is visible on Tab and works", async ({ page }) => {
    await page.goto("https://your-app.com");

    // Tab once from the very start of the page
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: /skip to (main )?content/i });
    await expect(skipLink).toBeVisible();

    await skipLink.click();
    await expect(page.locator("#main-content")).toBeFocused();
  });
});

// ─────────────────────────────────────────────
// COLOUR & MOTION
// ─────────────────────────────────────────────

test.describe("Motion and Colour Preferences", () => {
  test("animations are disabled when prefers-reduced-motion is set", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("https://your-app.com");

    const animationDuration = await page.evaluate(() => {
      const el = document.querySelector("[data-testid='hero-animation']");
      return el ? getComputedStyle(el).animationDuration : null;
    });

    expect(animationDuration).toBe("0s");
    await context.close();
  });

  test("dark mode class is applied when prefers-color-scheme is dark", async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("https://your-app.com");

    await expect(page.locator("html")).toHaveClass(/dark/);
    await context.close();
  });
});
```

---

## 🔒 PART 8 — Security: Full Test Suite

```typescript
// tests/security/input-security.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Input Security", () => {
  test("XSS: script tags in input fields are escaped, not executed", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/profile");

    // If the script runs, a dialog will appear and we fail immediately
    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
      throw new Error(`XSS vulnerability: dialog appeared — ${dialog.message()}`);
    });

    await page.getByLabel("Display Name").fill('<script>alert("xss")</script>');
    await page.getByRole("button", { name: "Save" }).click();

    // Page must remain on a valid URL and not error
    await expect(page).not.toHaveURL(/.*error/);

    // The raw script tag must NOT appear in the DOM unescaped
    const scriptTagsInDOM = await page.locator("script:visible").count();
    expect(scriptTagsInDOM).toBe(0);
  });

  test("XSS: HTML injection in search input is rendered as text, not HTML", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/shop");

    await page
      .getByPlaceholder("Search products")
      .fill('<img src=x onerror=alert(1)>');

    await page.getByRole("button", { name: "Search" }).click();

    // The img tag should not exist in the DOM
    await expect(page.locator('img[src="x"]')).toHaveCount(0);
  });

  test("SQL injection string does not crash the server or bypass auth", async ({
    page,
  }) => {
    await page.goto("https://your-app.com/login");

    await page.getByLabel("Email").fill("' OR '1'='1'; DROP TABLE users; --");
    await page.getByLabel("Password").fill("anything");
    await page.getByRole("button", { name: "Log in" }).click();

    // Should NOT grant access
    await expect(page).not.toHaveURL(/.*\/dashboard/);

    // Should NOT expose a database error in the UI
    await expect(page.getByText("SQL")).not.toBeVisible();
    await expect(page.getByText("syntax error")).not.toBeVisible();
    await expect(page.getByText("ORA-")).not.toBeVisible(); // Oracle error
    await expect(page.getByText("MySQL")).not.toBeVisible();
  });

  test("unauthenticated request to protected page redirects to login", async ({
    page,
  }) => {
    // No cookies / auth token set
    await page.goto("https://your-app.com/dashboard");

    await expect(page).toHaveURL(/.*\/login/);
  });
});
```

---

## 🏗️ PART 9 — Page Object Model (POM): Reusable Pattern

> Use POM to avoid repeating locators and actions across many test files.

```typescript
// tests/page-objects/LoginPage.ts
import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;
  readonly errorMsg: Locator;
  readonly showPasswordBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitBtn = page.getByRole("button", { name: "Log in" });
    this.errorMsg = page.getByRole("alert");
    this.showPasswordBtn = page.getByRole("button", { name: /show password/i });
  }

  async goto() {
    await this.page.goto("https://your-app.com/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }

  async loginExpectingError(email: string, password: string) {
    await this.login(email, password);
    return this.errorMsg;
  }
}
```

```typescript
// tests/page-objects/LoginPage.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "./LoginPage";

test.describe("Login Page (using POM)", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("valid credentials redirect to dashboard", async ({ page }) => {
    await loginPage.login("juan@example.com", "Password123!");

    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("invalid credentials show an error message", async () => {
    const errorMsg = await loginPage.loginExpectingError("bad@user.com", "wrong");

    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText("Invalid email or password");
  });

  test("empty form shows required field errors", async ({ page }) => {
    await loginPage.submitBtn.click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });
});
```

---

## 🔧 PART 10 — playwright.config.ts Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html"], ["list"]],

  use: {
    baseURL: "https://your-app.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Desktop Firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "Tablet",
      use: { ...devices["iPad Pro 11"] },
    },
  ],
});
```

---

## ⚡ Quick Reference — Complete Locator Priority Cheat Sheet

```
data-testid  →  getByRole  →  getByLabel  →  getByText  →  CSS attr  →  XPath  →  nth()
most stable                                                                     least stable
```

```typescript
// MOST STABLE — use first
page.getByTestId("submit-btn");
page.getByRole("button", { name: "Submit" });
page.getByLabel("Email address");
page.getByPlaceholder("Enter email");

// STABLE IF TEXT DOESN'T CHANGE
page.getByText("Submit Order");
page.getByText(/submit/i);               // regex = case-insensitive

// CSS ATTRIBUTE TRICKS
page.locator('[name="submitOrder"]');    // name attr
page.locator('[aria-label="Submit"]');  // aria-label
page.locator('[class*="primaryBtn"]');  // partial class

// XPATH — when CSS can't express the relationship
page.locator('//tr[td="Juan"]//button[text()="Delete"]'); // sibling nav

// POSITION — last resort
page.locator("button").nth(0);
page.locator("button").first();
page.locator("button").last();

// FILTERING — narrow multiple matches
page.locator("button").filter({ hasText: "Delete" });
page.locator("tr").filter({ hasText: "Juan" });
parent.locator("child-selector");       // scope to parent

// ASSERTIONS — full list
await expect(locator).toBeVisible();
await expect(locator).not.toBeVisible();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).not.toBeChecked();
await expect(locator).toHaveValue("text");
await expect(locator).toHaveText("exact text");
await expect(locator).toContainText("partial");
await expect(locator).toHaveAttribute("type", "password");
await expect(locator).toHaveCount(5);
await expect(locator).toBeFocused();
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveTitle("My App");
```
