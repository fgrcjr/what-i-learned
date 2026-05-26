# Playwright Test Anatomy & Helper Patterns

## 1. Structure of a Test File

```
┌─────────────────────────────────────────────────────┐
│  IMPORTS                                            │
│  import { test, expect, Page } from "@playwright/test" │
├─────────────────────────────────────────────────────┤
│  CONFIGURATION                                      │
│  const BASE_URL = "https://your-app.com"            │
│  const VALID_EMAIL = "user@example.com"             │
│  const VALID_PASSWORD = "Password123!"              │
├─────────────────────────────────────────────────────┤
│  HELPERS  (reusable async functions)                │
│  async function goToLogin(page: Page) { ... }       │
│  async function login(page, email, password) { ... }│
├─────────────────────────────────────────────────────┤
│  TEST CASES                                         │
│  test("TC01 – description", async ({ page }) => {  │
│    // arrange → act → assert                        │
│  })                                                 │
│  test("TC02 – ...")                                 │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

---

## 2. The Helper Function Pattern

Helpers extract repeated steps so each test body stays readable.

```
Without helpers:                    With helpers:
──────────────────                  ──────────────────────
test("TC01", async ({ page }) => {  test("TC01", async ({ page }) => {
  await page.goto(URL + "/login");    await goToLogin(page);
  await page.waitForSelector(...)     await login(page, EMAIL, PASS);
  await page.fill('[name="email"]')
  await page.fill('[name="password"]')  await expect(page).toHaveURL(/dashboard/);
  await page.click('button[type=submit]') });
  await expect(page).toHaveURL(...)
});
```

Flow of helper calls in `login-tests.ts`:

```
test("TC01")
    │
    ├─► goToLogin(page)
    │       └─► page.goto(BASE_URL + "/login")
    │       └─► page.waitForSelector('input[name="email"]')
    │
    └─► login(page, EMAIL, PASS)
            └─► page.fill('input[name="email"]', email)
            └─► page.fill('input[name="password"]', password)
            └─► page.click('button[type="submit"]')
```

---

## 3. The Override Pattern (form-specs.ts)

`fillForm` uses spread to merge a base payload with per-test overrides:

```typescript
const VALID = {
  name: "Juan dela Cruz",
  email: "juan@example.com",
  phone: "09171234567",     // optional field
  subject: "General Inquiry",
  message: "Hello..."
};

fillForm(page, { phone: "" })
// Equivalent to: { ...VALID, phone: "" }
// Result:
// ┌──────────────────────────────┐
// │ name    │ "Juan dela Cruz"   │  ← from VALID
// │ email   │ "juan@example.com" │  ← from VALID
// │ phone   │ ""                 │  ← OVERRIDDEN
// │ subject │ "General Inquiry"  │  ← from VALID
// │ message │ "Hello..."         │  ← from VALID
// └──────────────────────────────┘
```

One field overridden. Everything else stays valid. Keeps tests minimal.

---

## 4. Test Categories (login-tests.ts)

```
┌───────────────────┬──────────────────────────────────────────────────┐
│ Category          │ Test Cases                                        │
├───────────────────┼──────────────────────────────────────────────────┤
│ ✅ Happy Path      │ TC01 – valid credentials → redirect to dashboard  │
├───────────────────┼──────────────────────────────────────────────────┤
│ ❌ Wrong Creds     │ TC02 – wrong password → error message             │
│                   │ TC03 – unknown email → SAME generic error (no     │
│                   │         user enumeration leak)                    │
├───────────────────┼──────────────────────────────────────────────────┤
│ ⚠️ Validation      │ TC04 – empty form → required field errors         │
│                   │ TC05 – invalid email format → format error        │
├───────────────────┼──────────────────────────────────────────────────┤
│ 🔒 Security        │ TC06 – SQL injection → rejected safely            │
│                   │ TC07 – XSS payload → escaped, not executed        │
├───────────────────┼──────────────────────────────────────────────────┤
│ 👁️ UX / Session    │ TC08 – password visibility toggle                 │
│                   │ TC09 – "Remember Me" sets persistent cookie       │
│                   │ TC10 – redirect to original URL after login       │
└───────────────────┴──────────────────────────────────────────────────┘
```

## 5. Test Categories (form-specs.ts)

```
┌───────────────────┬──────────────────────────────────────────────────┐
│ Category          │ Test Cases                                        │
├───────────────────┼──────────────────────────────────────────────────┤
│ ✅ Happy Path      │ TC01 – all valid fields → success message         │
├───────────────────┼──────────────────────────────────────────────────┤
│ ⚠️ Validation      │ TC02 – empty form → all required-field errors     │
│                   │ TC03 – invalid email format (3 variations)        │
│                   │ TC04 – message over 500 chars → rejected          │
├───────────────────┼──────────────────────────────────────────────────┤
│ ✅ Optional Fields │ TC05 – phone left blank → still succeeds          │
├───────────────────┼──────────────────────────────────────────────────┤
│ 🔒 Security        │ TC06 – XSS in text fields → escaped              │
│                   │ TC07 – SQL injection strings → safe               │
├───────────────────┼──────────────────────────────────────────────────┤
│ 📎 Edge Cases      │ TC08 – disallowed file type → error               │
│                   │ TC09 – submit button disabled after first click   │
│                   │ TC10 – fields cleared after success               │
└───────────────────┴──────────────────────────────────────────────────┘
```

---

## 6. Minimal Test Skeleton

```typescript
import { test, expect } from "@playwright/test";

const BASE_URL = "https://your-app.com";

// Helper: one reusable action (optional but recommended)
async function doSomething(page) {
  await page.goto(BASE_URL + "/page");
  await page.waitForSelector("form");
}

test("TC01 – description of expected behavior", async ({ page }) => {
  // ARRANGE — navigate / set up state
  await doSomething(page);

  // ACT — trigger the thing you're testing
  await page.click('button[type="submit"]');

  // ASSERT — verify the outcome
  await expect(page.locator("text=Success")).toBeVisible();
});
```

Pattern: **Arrange → Act → Assert** (every test, no exceptions).
