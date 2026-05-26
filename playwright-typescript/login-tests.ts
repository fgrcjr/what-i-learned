import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// CONFIGURATION
// Centralise URLs and credentials so tests are easy to maintain.
// In a real project, move these to playwright.config.ts or a .env file.
// ---------------------------------------------------------------------------
const BASE_URL = "https://your-app.com"; // 🔁 Replace with your app's URL
const VALID_EMAIL = "user@example.com";
const VALID_PASSWORD = "Password123!";

// ---------------------------------------------------------------------------
// HELPER: navigate to the login page before each test
// ---------------------------------------------------------------------------
async function goToLogin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  // Wait until the form is visible — avoids race conditions on slow networks
  await page.waitForSelector('input[name="email"]');
}

// ---------------------------------------------------------------------------
// HELPER: fill and submit the login form
// Keeps the test bodies clean and avoids repeating the same 3 lines.
// ---------------------------------------------------------------------------
async function login(page: Page, email: string, password: string) {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

// ===========================================================================
// TEST SUITE
// ===========================================================================

// ---------------------------------------------------------------------------
// TEST 1 — Happy Path ✅
// The most fundamental test: a valid user can log in and reach the dashboard.
// If this fails, everything else is irrelevant.
// ---------------------------------------------------------------------------
test("TC01 – valid credentials redirect to dashboard", async ({ page }) => {
  await goToLogin(page);
  await login(page, VALID_EMAIL, VALID_PASSWORD);

  // After a successful login the app should land on /dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  // And a welcome element should be visible (adjust selector to match your UI)
  await expect(page.locator("text=Welcome")).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 2 — Wrong Password ❌
// The most common failure users encounter; the error message must be clear.
// ---------------------------------------------------------------------------
test("TC02 – wrong password shows error message", async ({ page }) => {
  await goToLogin(page);
  await login(page, VALID_EMAIL, "WrongPassword!");

  // The user should stay on the login page
  await expect(page).toHaveURL(/.*login/);
  await expect(page.locator("text=Invalid email or password")).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 3 — Non-existent Email ❌
// Important: the error message should be IDENTICAL to TC02.
// Returning different messages ("email not found" vs "wrong password")
// leaks account existence — a security vulnerability known as user enumeration.
// ---------------------------------------------------------------------------
test("TC03 – unknown email shows generic error (no user enumeration)", async ({
  page,
}) => {
  await goToLogin(page);
  await login(page, "nobody@nowhere.com", VALID_PASSWORD);

  // Must show the SAME generic message as a wrong password
  await expect(page.locator("text=Invalid email or password")).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 4 — Empty Fields (Validation) ⚠️
// The form should not even submit if required fields are empty.
// HTML5 `required` attributes normally handle this, but it's worth asserting.
// ---------------------------------------------------------------------------
test("TC04 – empty form submission shows validation errors", async ({
  page,
}) => {
  await goToLogin(page);
  // Click submit without filling anything
  await page.click('button[type="submit"]');

  // Expect inline validation messages to appear
  await expect(page.locator("text=Email is required")).toBeVisible();
  await expect(page.locator("text=Password is required")).toBeVisible();
  // URL must not change — the form should be blocked
  await expect(page).toHaveURL(/.*login/);
});

// ---------------------------------------------------------------------------
// TEST 5 — Invalid Email Format ⚠️
// "notanemail" is not a valid address. The browser (or the backend)
// should catch this before hitting the server.
// ---------------------------------------------------------------------------
test("TC05 – invalid email format shows format error", async ({ page }) => {
  await goToLogin(page);
  await login(page, "notanemail", VALID_PASSWORD);

  // A real email validator should catch this
  await expect(page.locator("text=Enter a valid email")).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 6 — SQL Injection Attempt 🔒
// Classic attack vector. The app must NOT log in or crash.
// A proper backend uses parameterised queries, so this should simply fail
// like any other wrong credential.
// ---------------------------------------------------------------------------
test("TC06 – SQL injection in email field is rejected safely", async ({
  page,
}) => {
  await goToLogin(page);
  await login(page, "' OR '1'='1", VALID_PASSWORD);

  // The app should not crash and should not grant access
  await expect(page).toHaveURL(/.*login/);
  await expect(page.locator("text=Invalid email or password")).toBeVisible();
});

// ---------------------------------------------------------------------------
// TEST 7 — XSS Attempt 🔒
// If the app reflects the email back in an error message (e.g. "No account
// for <email>"), a script tag must be escaped, not executed.
// ---------------------------------------------------------------------------
test("TC07 – XSS payload in email field is escaped, not executed", async ({
  page,
}) => {
  await goToLogin(page);
  // Attach a listener: if any dialog appears, the XSS worked — fail the test
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
    throw new Error("XSS succeeded — script was executed!");
  });

  await login(page, '<script>alert("xss")</script>', VALID_PASSWORD);
  // Page should still be intact and showing an error, not a JS alert
  await expect(page).toHaveURL(/.*login/);
});

// ---------------------------------------------------------------------------
// TEST 8 — Password Visibility Toggle 👁️
// A small UX feature, but frequently broken after refactors.
// The password field should switch between type="password" and type="text".
// ---------------------------------------------------------------------------
test("TC08 – password visibility toggle works correctly", async ({ page }) => {
  await goToLogin(page);

  const passwordInput = page.locator('input[name="password"]');
  const toggleButton = page.locator('[data-testid="toggle-password"]');

  // By default the password is masked
  await expect(passwordInput).toHaveAttribute("type", "password");

  // After clicking the toggle it should be readable
  await toggleButton.click();
  await expect(passwordInput).toHaveAttribute("type", "text");

  // Clicking again should mask it back
  await toggleButton.click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});

// ---------------------------------------------------------------------------
// TEST 9 — Remember Me / Persistent Session 🍪
// When "Remember Me" is checked, an auth cookie should persist beyond the
// current browser session (i.e. it should have an explicit `expires` date).
// This is a common source of bugs when session logic changes.
// ---------------------------------------------------------------------------
test("TC09 – 'Remember Me' checkbox sets a persistent auth cookie", async ({
  page,
  context,
}) => {
  await goToLogin(page);

  // Check the remember-me box before logging in
  await page.check('input[name="rememberMe"]');
  await login(page, VALID_EMAIL, VALID_PASSWORD);

  // Inspect cookies after login
  const cookies = await context.cookies();
  const authCookie = cookies.find((c) => c.name === "auth_token");

  expect(authCookie).toBeDefined();
  // A persistent cookie has an `expires` value greater than -1 (session cookie)
  expect(authCookie?.expires).toBeGreaterThan(Date.now() / 1000);
});

// ---------------------------------------------------------------------------
// TEST 10 — Redirect After Login (Return URL) 🔀
// If a user visits a protected page while unauthenticated, the app typically
// redirects them to /login?returnTo=/protected-page.
// After logging in, they should land on that page, NOT just the dashboard.
// This is one of the most commonly broken flows in auth systems.
// ---------------------------------------------------------------------------
test("TC10 – user is redirected to original destination after login", async ({
  page,
}) => {
  // Try to visit a protected route directly
  await page.goto(`${BASE_URL}/settings/profile`);

  // The app should redirect to login and preserve the return URL
  await expect(page).toHaveURL(/.*login\?returnTo=.*settings/);

  // Now log in
  await login(page, VALID_EMAIL, VALID_PASSWORD);

  // The user should land back on /settings/profile, not /dashboard
  await expect(page).toHaveURL(/.*settings\/profile/);
});
