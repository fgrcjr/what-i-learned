# 07 — Codegen & Inspector: Let Playwright Find the Locator for You

## The Core Insight

When you face a hashed class like `.sc-abc123-xyz` you have two choices:

```
Option A (manual):  Open DevTools → dig through DOM → guess a selector → hope it survives a rebuild
Option B (smart):   Ask Playwright → it reads the DOM for you → gives you a stable locator instantly
```

Playwright's tools — codegen, Inspector, and the VS Code extension — all run the same locator engine under the hood. That engine knows the priority order for stable selectors. You never have to read raw HTML to pick a locator. You just point and let the tool decide.

---

## 1. Codegen CLI — Record Tests by Clicking

### Starting it

```bash
npx playwright codegen https://your-app.com
```

Two windows open simultaneously:

```
┌──────────────────────────────────────────────────────┐
│  BROWSER WINDOW                                      │
│                                                      │
│   ┌────────────────────────────────────┐             │
│   │  Your App                          │             │
│   │                                    │             │
│   │   [Sign In]   [Register]           │             │
│   │                                    │             │
│   │   Username: ___________________    │             │
│   │   Password: ___________________    │             │
│   │                                    │             │
│   │        [ Submit ]                  │             │
│   └────────────────────────────────────┘             │
│                                                      │
│   ^ You click here normally                          │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  PLAYWRIGHT INSPECTOR (codegen panel)                │
│                                                      │
│  ● Record  ■ Stop  ⎘ Copy  🗑 Clear                  │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄    │
│                                                      │
│  import { test, expect } from '@playwright/test';   │
│                                                      │
│  test('test', async ({ page }) => {                  │
│    await page.goto('https://your-app.com');          │
│    await page.getByLabel('Username').fill('ferds');  │
│    await page.getByLabel('Password').fill('••••••'); │
│    await page.getByRole('button', {                  │
│      name: 'Submit'                                  │
│    }).click();                                       │
│  });                                                 │
│                                                      │
│  ^ Code appears here as you click                    │
└──────────────────────────────────────────────────────┘
```

### What the generated code looks like

Every action you perform produces one line. Notice what Playwright chooses:

```typescript
// You clicked a button labelled "Add to Cart"
// Playwright generated this — NOT a hashed class:
await page.getByRole('button', { name: 'Add to Cart' }).click();

// You typed into a field labelled "Search"
await page.getByLabel('Search').fill('playwright');

// You clicked a link with visible text
await page.getByRole('link', { name: 'Docs' }).click();
```

Playwright never generates `.sc-abc123` or `.css-hashed-xyz`. It reads the accessible role, visible text, and label — because those survive rebuilds.

### How to use the generated code

1. Interact with your app in the browser window
2. Watch the code accumulate in the Inspector panel
3. Click the **Copy** button in the Inspector toolbar
4. Paste directly into your `.spec.ts` file
5. Done — no DOM spelunking required

### Useful codegen flags

```bash
# Target a specific viewport
npx playwright codegen --viewport-size="1280,720" https://your-app.com

# Emulate a mobile device
npx playwright codegen --device="iPhone 13" https://your-app.com

# Save auth state for reuse
npx playwright codegen --save-storage=auth.json https://your-app.com

# Load a saved auth session
npx playwright codegen --load-storage=auth.json https://your-app.com
```

---

## 2. VS Code: Record at Cursor

Use this when you already have a test and want to add more steps to it — without rewriting the whole thing.

```
┌─ VS Code ─────────────────────────────────────────────────────────────┐
│                                                                       │
│  TESTING SIDEBAR              TEST FILE (example.spec.ts)             │
│  ┌─────────────────┐          ┌───────────────────────────────────┐   │
│  │ ▷ Run           │          │  test('login flow', async =>  {   │   │
│  │ ▷ Run all       │          │    await page.goto('/login');     │   │
│  │ ● Record new    │          │    await page.getByLabel(         │   │
│  │ ● Record at     │          │      'Email').fill('me@x.com');   │   │
│  │   cursor  <──── │──────────│──> cursor is HERE                 │   │
│  │ ⊙ Pick locator  │          │                                   │   │
│  └─────────────────┘          │    // new steps will appear here  │   │
│                               └───────────────────────────────────┘   │
│                                                                       │
│  Steps:                                                               │
│  1. Place your cursor in the test where new steps should go           │
│  2. Click "Record at cursor" in the Testing sidebar                   │
│  3. Interact with the browser                                         │
│  4. New lines are inserted at cursor position                         │
│  5. Click "Cancel" or close browser to stop                           │
└───────────────────────────────────────────────────────────────────────┘
```

This is different from "Record new" — it inserts into your existing test rather than creating a fresh file.

---

## 3. VS Code: Pick Locator — Best Tool for Hashed Elements

This is the most targeted tool. You hover over one element, Playwright tells you exactly what to write.

```
┌─ Browser Window ───────────────────────────────────────────────────┐
│                                                                    │
│   ┌────────────────────────────────────┐                           │
│   │  Dashboard                         │                           │
│   │                                    │                           │
│   │   [ Edit Profile ]  <── you hover  │                           │
│   │     ~~~~~~~~~~~~~~~                │                           │
│   │     locator hint shown here        │                           │
│   └────────────────────────────────────┘                           │
│                                                                    │
│   The element has class: btn--sc-x7k2a-0  (hashed, useless)       │
│   But Playwright sees:   role=button, name="Edit Profile"          │
└────────────────────────────────────────────────────────────────────┘
                              |
                              | hover + click
                              v
┌─ VS Code Testing Sidebar ──────────────────────────────────────────┐
│                                                                    │
│  ⊙ Pick locator                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  page.getByRole('button', { name: 'Edit Profile' })          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Press Enter to copy to clipboard  |  Esc to cancel               │
└────────────────────────────────────────────────────────────────────┘
```

### Steps

1. Click **Pick locator** in the VS Code Testing sidebar
2. Move your mouse over any element in the browser
3. The locator appears live in the Pick locator box as you hover
4. Click the element to lock the locator in
5. Press **Enter** to copy it — paste anywhere in your code
6. Press **Esc** to cancel without copying

The locator shown is already the best possible one. You do not need to validate it manually.

---

## 4. Playwright Inspector (`--debug` flag)

### Starting it

```bash
# Debug all tests (runs one at a time, opens Inspector for each)
npx playwright test --debug

# Debug a specific test file at a specific line
npx playwright test example.spec.ts:10 --debug

# Debug on a specific browser
npx playwright test --project=chromium --debug
```

When `--debug` is active: browsers launch in headed mode, and timeouts are disabled (so tests won't time out while you're inspecting).

### Inspector panel layout

```
┌─ Playwright Inspector ────────────────────────────────────────────────────────┐
│                                                                               │
│  ▷ Resume  ⏭ Step over  ⏸ Pause                                              │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄     │
│                                                                               │
│  SOURCE                          │  LOCATOR PICKER                            │
│  ┌───────────────────────────┐   │  ┌────────────────────────────────────┐   │
│  │  await page.goto('/');    │   │  │  ⊙ Pick Locator                    │   │
│  │  await page               │   │  │                                    │   │
│  │  > .getByRole('button',   │   │  │  page.getByRole('button', {        │   │
│  │      { name: 'Login' })   │   │  │    name: 'Login'                   │   │
│  │      .click();  <── here  │   │  │  })                                │   │
│  │  await page...            │   │  │                                    │   │
│  └───────────────────────────┘   │  │  [Edit locator directly here]      │   │
│                                  │  └────────────────────────────────────┘   │
│  ACTIONABILITY LOG                                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  waiting for getByRole('button', { name: 'Login' })                    │  │
│  │  element is visible                                                    │  │
│  │  element is enabled                                                    │  │
│  │  element is stable                                                     │  │
│  │  scrolling into view...                                                │  │
│  │  clicking...                                                           │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Key things you can do in Inspector

**Step through actions** — Use the toolbar buttons (Resume / Step over / Pause) to move through your test one action at a time. The current step is highlighted in the source panel and the matching element is highlighted in the browser.

**Pick a locator live** — Click the **Pick Locator** button, hover over any element in the browser. The best locator appears in the picker field. Click to lock it in, then edit or copy.

**Edit a locator live** — The locator field is editable. Change the text and the browser immediately highlights which elements match. Useful for verifying you're targeting exactly one element.

**Jump to a specific point** — Add `await page.pause()` in your test code where you want to stop. Run with `--debug` and the Inspector opens exactly there. Click Resume to continue from that point.

```typescript
test('my test', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Open menu' }).click();

  await page.pause(); // Inspector opens here, test waits

  await page.getByRole('menuitem', { name: 'Settings' }).click();
});
```

**Read the actionability log** — The log shows you exactly what Playwright checked before acting: was the element visible? enabled? stable? did it scroll into view? If a click failed, this log tells you why.

---

## 5. What Playwright's Auto-Picker Prioritizes

When codegen or Inspector suggests a locator, it follows this preference order:

```
Priority   Strategy            Example
──────────────────────────────────────────────────────────────────────
1st        Role + Name         getByRole('button', { name: 'Submit' })
           (ARIA semantics)    Survives CSS rebuilds, refactors, class renames

2nd        Test ID             getByTestId('submit-btn')
           (data-testid attr)  Explicit, stable, team-controlled
                               Requires: <button data-testid="submit-btn">

3rd        Label / Text        getByLabel('Email')  /  getByText('Sign in')
           (visible content)   Stable as long as copy doesn't change

4th        CSS / XPath         page.locator('.some-class')
           (last resort)       Fragile — breaks when classes are hashed or renamed
```

### Why this matters for hashed classes

```
The DOM has:   <button class="sc-abc123-0 hYqKzN">Submit</button>
                                 ↑ useless hash

Playwright sees:
  - role:  button
  - name:  "Submit"  (text content / aria-label)

Playwright suggests:  page.getByRole('button', { name: 'Submit' })
                                                          ↑ stable forever
```

The hash in the class name is invisible to Playwright's picker because it looks at semantics first. You get a locator that works regardless of which CSS-in-JS build produced those classes.

If multiple elements match (e.g. two buttons labelled "Edit"), Playwright automatically narrows the locator — adding a parent scope or index — until it uniquely identifies the target.

---

## 6. Cheat Sheet — Which Tool for Which Situation

```
Situation                                  Tool
──────────────────────────────────────────────────────────────────────
Starting a brand new test from scratch     codegen CLI
  npx playwright codegen https://app.com

Adding steps to an existing test           VS Code: Record at cursor
  Place cursor → click "Record at cursor"

Finding the locator for one specific       VS Code: Pick Locator
element (fastest, most targeted)           Click "Pick locator" → hover → Enter

Hashed element, no idea what to use        Inspector hover (either tool)
  → hover in browser → copy locator string

Debugging a failing test step              npx playwright test --debug
  → step through → pick better locator

Pausing at a known problem line            await page.pause() + --debug
  → Inspector opens exactly there
```

---

## Quick Reference

```bash
# Codegen (record new test)
npx playwright codegen https://your-app.com

# Debug all tests
npx playwright test --debug

# Debug one test at a line
npx playwright test my.spec.ts:42 --debug

# Debug on specific browser
npx playwright test --project=chromium --debug
```

```typescript
// Pause test at a specific point (use with --debug)
await page.pause();
```

**Rule of thumb:** if you're about to open DevTools to hunt for a selector, stop. Open the Inspector instead. Let Playwright read the DOM and hand you the locator directly.
