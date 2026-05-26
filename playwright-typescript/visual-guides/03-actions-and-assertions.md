# Playwright Actions & Assertions — Visual Cheat Sheet

## 1. Actions by Category

```
┌──────────────┬───────────────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│ Category     │ Action                        │ Code                                 │ When to use              │
├──────────────┼───────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ Fill / Type  │ Fill and replace              │ page.fill('[name="q"]', "text")      │ Most inputs              │
│              │ Type char by char             │ page.type('[name="q"]', "text")      │ Testing key events       │
│              │ Clear a field                 │ page.fill('[name="q"]', "")          │ Clearing                 │
├──────────────┼───────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ Click        │ Single click                  │ page.click("button")                 │ Buttons, links           │
│              │ Double click                  │ page.dblclick('[data-testid="x"]')   │ Edit-on-dblclick         │
│              │ Hover (no click)              │ page.hover('[data-testid="icon"]')   │ Tooltips, hover menus    │
├──────────────┼───────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ Check /      │ Check checkbox                │ checkbox.check()                     │ Toggle on                │
│ Select       │ Uncheck checkbox              │ checkbox.uncheck()                   │ Toggle off               │
│              │ Select by label               │ page.selectOption("select", {label}) │ Dropdown (visible text)  │
│              │ Select by value               │ page.selectOption("select", {value}) │ Dropdown (server value)  │
│              │ Select multiple               │ page.selectOption("select", [a, b])  │ Multi-select             │
├──────────────┼───────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ Keyboard     │ Press a key                   │ page.keyboard.press("Enter")         │ Submit, close modal      │
│              │ Key combo                     │ page.keyboard.press("Control+A")     │ Select all, shortcuts    │
│              │ Focus element                 │ page.focus("input")                  │ Keyboard nav testing     │
├──────────────┼───────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ File         │ Upload file (no OS dialog)    │ page.setInputFiles('input[type=file]'│ Bypass OS file picker    │
│              │                               │   , { name, mimeType, buffer })      │                          │
├──────────────┼───────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ Wait         │ Wait for URL                  │ page.waitForURL("**/dashboard")      │ After navigation         │
│              │ Wait for element              │ page.waitForSelector('[testid="x"]') │ Before interacting       │
│              │ Wait for API call             │ page.waitForResponse("**/api/users") │ After form submit        │
│              │ Wait for download             │ page.waitForEvent("download")        │ Export/download buttons  │
└──────────────┴───────────────────────────────┴──────────────────────────────────────┴──────────────────────────┘
```

---

## 2. Assertions by What You're Checking

```
┌─────────────────────────┬──────────────────────────────────────────┬──────────────────────────────────────┐
│ What to verify          │ Assertion                                │ Example                              │
├─────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ Element visible         │ .toBeVisible()                           │ expect(modal).toBeVisible()          │
│ Element hidden          │ .not.toBeVisible()                       │ expect(spinner).not.toBeVisible()    │
├─────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ Exact text              │ .toHaveText("text")                      │ expect(h1).toHaveText("Welcome")     │
│ Contains text           │ .toContainText("partial")                │ expect(row).toContainText("Juan")    │
├─────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ Input value             │ .toHaveValue("text")                     │ expect(input).toHaveValue("Juan")    │
├─────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ Checkbox checked        │ .toBeChecked()                           │ expect(checkbox).toBeChecked()       │
│ Checkbox unchecked      │ .not.toBeChecked()                       │ expect(checkbox).not.toBeChecked()   │
│ Button enabled          │ .toBeEnabled()                           │ expect(btn).toBeEnabled()            │
│ Button disabled         │ .toBeDisabled()                          │ expect(btn).toBeDisabled()           │
├─────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ Page URL                │ expect(page).toHaveURL(/pattern/)        │ expect(page).toHaveURL(/dashboard/)  │
│ Page title              │ expect(page).toHaveTitle("title")        │ expect(page).toHaveTitle("My App")   │
├─────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ Number of elements      │ .toHaveCount(n)                          │ expect(rows).toHaveCount(10)         │
├─────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ HTML attribute value    │ .toHaveAttribute("attr", "value")        │ expect(input).toHaveAttribute        │
│                         │                                          │   ("type", "password")               │
│ Element focused         │ .toBeFocused()                           │ expect(input).toBeFocused()          │
└─────────────────────────┴──────────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. Element Type → Actions Matrix

```
                     fill  click  check  selectOption  setInputFiles  keyboard
                     ────  ─────  ─────  ────────────  ─────────────  ────────
Text input            ✓      -      -         -               -           ✓
Password input        ✓      -      -         -               -           ✓
Textarea              ✓      -      -         -               -           ✓
Checkbox              -      -      ✓         -               -           -
Radio button          -      -      ✓         -               -           -
Dropdown <select>     -      -      -         ✓               -           -
Multi-select          -      -      -         ✓ (array)       -           -
File input            -      -      -         -               ✓           -
Button                -      ✓      -         -               -           ✓ (Enter)
Link <a>              -      ✓      -         -               -           -
Range slider          ✓      -      -         -               -           -
Date input            ✓      -      -         -               -           -
```

---

## 4. Action vs Assertion

```
  ACTION                               ASSERTION
  ──────                               ─────────
  Does something to the page           Checks the state of the page

  await page.fill(...)   ───────────►  (page changes)
  await page.click(...)  ───────────►  (page changes)
  await page.check(...)  ───────────►  (page changes)
                                              │
                                              ▼
                                   await expect(locator).toBeVisible()
                                   await expect(locator).toHaveValue("x")
                                   await expect(page).toHaveURL(/dashboard/)

  "I did something"                    "I verify the result"
  No return value needed               Fails the test if condition not met
```

---

## 5. The 3-Step Pattern

Every test follows: **Navigate → Act → Assert**

```
  ┌──────────────────────────────────────────────────────────────┐
  │ NAVIGATE (arrange)                                           │
  │   await page.goto("https://your-app.com/login")             │
  │   await page.waitForSelector('input[name="email"]')         │
  └──────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ ACT (trigger)                                                │
  │   await page.fill('input[name="email"]', "user@example.com")│
  │   await page.fill('input[name="password"]', "Password123!") │
  │   await page.click('button[type="submit"]')                  │
  └──────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ ASSERT (verify)                                              │
  │   await expect(page).toHaveURL(/.*dashboard/)                │
  │   await expect(page.locator("text=Welcome")).toBeVisible()   │
  └──────────────────────────────────────────────────────────────┘
```

Variations:
```
Happy path:  goto → fill → click → expect URL changed
Error path:  goto → fill (bad data) → click → expect error message visible
State check: goto → expect element has attribute/value (no action needed)
```
