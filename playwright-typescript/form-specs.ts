import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// CONFIGURATION
// This example assumes a typical Contact / Registration form with fields:
//   - Full Name, Email, Phone (optional), Subject (dropdown), Message, File Upload
// 🔁 Adjust selectors and URLs to match your actual form.
// ---------------------------------------------------------------------------
const BASE_URL = "https://your-app.com";
const FORM_URL = `${BASE_URL}/contact`;

// ---------------------------------------------------------------------------
// VALID PAYLOAD — used by the happy-path test and as a base for edge cases
// ---------------------------------------------------------------------------
const VALID = {
  name: "Juan dela Cruz",
  email: "juan@example.com",
  phone: "09171234567",
  subject: "General Inquiry",
  message: "Hello, I would like to know more about your services.",
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
async function goToForm(page: Page) {
  await page.goto(FORM_URL);
  await page.waitForSelector("form");
}

/** Fill every field with the provided values (falls back to VALID defaults). */
async function fillForm(page: Page, overrides: Partial<typeof VALID> = {}) {
  const data = { ...VALID, ...overrides };
  await page.fill('input[name="fullName"]', data.name);
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="phone"]', data.phone);
  await page.selectOption('select[name="subject"]', data.subject);
  await page.fill('textarea[name="message"]', data.message);
}

async function submitForm(page: Page) {
  await page.click('button[type="submit"]');
}

// ===========================================================================
// TEST SUITE
// ===========================================================================

// ---------------------------------------------------------------------------
// TEST 1 — Happy Path ✅
// All valid data → success message appears, form is cleared or user redirects.
// ---------------------------------------------------------------------------
test("TC01 – valid form submission shows success message", async ({ page }) => {
  await goToForm(page);
  await fillForm(page);
  await submitForm(page);

  // Success banner / confirmation message should be visible
  await expect(page.locator("text=Your message has been sent")).toBeVisible();

  // Optionally confirm the URL changed to a thank-you page
  // await expect(page).toHaveURL(/.*thank-you/);
});

// ---------------------------------------------------------------------------
// TEST 2 — Empty Submission ⚠️
// Clicking submit with nothing filled in should surface required-field errors
// for every mandatory field and prevent submission.
// ---------------------------------------------------------------------------
test("TC02 – submitting empty form shows all required-field errors", async ({
  page,
}) => {
  await goToForm(page);
  await submitForm(page); // submit without filling anything

  await expect(page.locator("text=Full name is required")).toBeVisible();
  await expect(page.locator("text=Email is required")).toBeVisible();
  await expect(page.locator("text=Message is required")).toBeVisible();

  // Page must NOT navigate away
  await expect(page).toHaveURL(FORM_URL);
});

// ---------------------------------------------------------------------------
// TEST 3 — Invalid Email Format ⚠️
// A malformed email address should be caught before hitting the server.
// Tests two common typos: missing @ and missing TLD.
// ---------------------------------------------------------------------------
test("TC03 – invalid email format is flagged inline", async ({ page }) => {
  await goToForm(page);

  for (const badEmail of ["notanemail", "missing@tld", "@nodomain.com"]) {
    await fillForm(page, { email: badEmail });
    await submitForm(page);

    await expect(
      page.locator("text=Enter a valid email address"),
    ).toBeVisible();
  }
});

// ---------------------------------------------------------------------------
// TEST 4 — Character Limit on Message Field ⚠️
// If the message textarea has a max-length (e.g. 500 chars), the UI should
// show a counter and block submission when the limit is exceeded.
// ---------------------------------------------------------------------------
test("TC04 – message exceeding character limit is rejected", async ({
  page,
}) => {
  await goToForm(page);
  const tooLong = "A".repeat(501); // One character over the 500-char limit
  await fillForm(page, { message: tooLong });
  await submitForm(page);

  await expect(
    page.locator("text=Message must be 500 characters or fewer"),
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 5 — Optional Field Can Be Left Blank ✅
// Phone is optional. Submitting without it should still succeed.
// This guards against regressions where optional fields accidentally become
// required after a validation-library upgrade.
// ---------------------------------------------------------------------------
test("TC05 – optional phone field can be left blank", async ({ page }) => {
  await goToForm(page);
  await fillForm(page, { phone: "" }); // explicitly leave phone empty
  await submitForm(page);

  await expect(page.locator("text=Your message has been sent")).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 6 — XSS Payload in Text Fields 🔒
// Script tags entered into any text field must be escaped in the response,
// never executed. The page.on("dialog") trick auto-fails the test if an
// alert() fires — meaning the XSS actually worked.
// ---------------------------------------------------------------------------
test("TC06 – XSS payload in text fields is escaped, not executed", async ({
  page,
}) => {
  await goToForm(page);

  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
    throw new Error(`XSS succeeded via dialog: "${dialog.message()}"`);
  });

  await fillForm(page, {
    name: '<script>alert("xss")</script>',
    message: '<img src=x onerror=alert("xss")>',
  });
  await submitForm(page);

  // Whether success or validation error, no JS dialog should have fired
  // (the page.on listener above would have thrown if it did)
});

// ---------------------------------------------------------------------------
// TEST 7 — SQL Injection in Text Fields 🔒
// Classic injection strings must not crash the server or return database errors.
// The app should treat them as plain wrong/invalid input.
// ---------------------------------------------------------------------------
test("TC07 – SQL injection strings are handled safely", async ({ page }) => {
  await goToForm(page);

  await fillForm(page, {
    name: "' OR '1'='1'; DROP TABLE contacts; --",
    message: "'; SELECT * FROM users; --",
  });
  await submitForm(page);

  // App should not surface a database or server error
  await expect(page.locator("text=500")).not.toBeVisible();
  await expect(page.locator("text=SQL")).not.toBeVisible();
  await expect(page.locator("text=database error")).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 8 — File Upload Validation 📎
// If the form accepts attachments, only allowed file types should be accepted
// and oversized files should be rejected with a clear error.
// ---------------------------------------------------------------------------
test("TC08 – uploading a disallowed file type shows an error", async ({
  page,
}) => {
  await goToForm(page);
  await fillForm(page);

  // Simulate choosing a .exe file (disallowed)
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "malicious.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("fake binary content"),
  });

  await submitForm(page);
  await expect(
    page.locator("text=Only PDF, JPG, and PNG files are allowed"),
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 9 — Duplicate Submission Prevention 🔁
// The submit button should be disabled immediately after the first click to
// prevent accidental double-submissions (a common support issue).
// ---------------------------------------------------------------------------
test("TC09 – submit button is disabled after first click", async ({ page }) => {
  await goToForm(page);
  await fillForm(page);

  const submitBtn = page.locator('button[type="submit"]');

  // Click once to submit
  await submitBtn.click();

  // The button should be disabled before the response comes back
  await expect(submitBtn).toBeDisabled();
});

// ---------------------------------------------------------------------------
// TEST 10 — Form Resets After Successful Submission ♻️
// After a successful submission, either:
//   (a) All fields are cleared so the user can submit again, or
//   (b) The user is redirected to a thank-you page.
// Either is acceptable; what's NOT acceptable is stale data sitting in the
// form — the user might re-submit the same message by mistake.
// ---------------------------------------------------------------------------
test("TC10 – form fields are cleared after successful submission", async ({
  page,
}) => {
  await goToForm(page);
  await fillForm(page);
  await submitForm(page);

  // Wait for the success state to settle
  await expect(page.locator("text=Your message has been sent")).toBeVisible();

  // If the form stays on the same page, fields should be empty
  // (skip these checks if your app redirects to a separate thank-you page)
  await expect(page.locator('input[name="fullName"]')).toHaveValue("");
  await expect(page.locator('input[name="email"]')).toHaveValue("");
  await expect(page.locator('textarea[name="message"]')).toHaveValue("");
});
