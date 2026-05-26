# Locator Strategies — Visual Guide

## 1. The Stability Spectrum

```
MOST STABLE ──────────────────────────────── LEAST STABLE
     │                                               │
     ▼                                               ▼
┌──────────────┬───────────────────────────────────────────────────────────┐
│ RANK         │ METHOD                  │ WHY                             │
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 1 ⭐ Best     │ data-testid             │ exists only for testing, devs   │
│              │ getByTestId("btn")      │ won't rename it, CSS won't touch │
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 2            │ ARIA role + name        │ semantic, survives style changes │
│              │ getByRole("button",     │ required for accessibility       │
│              │   { name: "Submit" })   │                                 │
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 3            │ Label text              │ tied to UX copy, survives refactor│
│              │ getByLabel("Email")     │ breaks if label text changes     │
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 4            │ Visible text            │ fine for static content          │
│              │ getByText("Submit")     │ breaks on i18n/copy changes      │
│              │ locator("text=Submit")  │                                 │
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 5            │ Stable HTML attributes  │ only if attrs are hand-written   │
│              │ locator('[name="email"]')│ and not auto-generated          │
│              │ locator('[type="submit"]')│                                │
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 6            │ CSS class / ID          │ ONLY if hand-written, not hashed │
│              │ locator(".submit-btn")  │ compiled CSS = breaks every build│
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 7 ❌ Avoid   │ XPath                   │ brittle, breaks on DOM structure │
│              │ locator("//button[1]")  │ changes, hard to read           │
├──────────────┼─────────────────────────┼─────────────────────────────────┤
│ 8 ❌ Avoid   │ nth / index             │ order changes = random failures  │
│              │ locator("button").nth(0)│                                 │
└──────────────┴─────────────────────────┴─────────────────────────────────┘
```

---

## 2. Decision Flowchart

```
  Does the element have data-testid?
           │
      ┌────┴─────┐
     YES         NO
      │           │
      ▼           ▼
  getByTestId   Does it have an ARIA role you can name?
  ✅ Done        │
            ┌────┴─────┐
           YES         NO
            │           │
            ▼           ▼
        getByRole     Does it have a <label>?
        ✅ Done        │
                  ┌────┴─────┐
                 YES         NO
                  │           │
                  ▼           ▼
             getByLabel    Is the visible text unique & stable?
             ✅ Done        │
                       ┌────┴─────┐
                      YES         NO
                       │           │
                       ▼           ▼
                  getByText     Use stable HTML attr ([name], [type])
                  ✅ Done        │
                             Still nothing stable?
                                  │
                                  ▼
                             Discuss with dev team:
                             Add data-testid to the element
```

---

## 3. Same Element, 7 Ways (from pw-ts-learning_2.md)

Target HTML:
```html
<button
  id="btn_a3f9c2"               ← HASHED — changes every build
  class="MuiButton-root btn_8x9k2z styles__primaryBtn___3Fk2"  ← HASHED
  data-testid="submit-order-btn"  ← STABLE
  aria-label="Submit your order"  ← STABLE
  type="submit"                   ← STABLE
  name="submitOrder"              ← STABLE
>
  Submit Order                    ← STABLE (visible text)
</button>
```

```
┌───┬─────────────────────────────────────────────────────┬──────────┬──────────────────────────┐
│ # │ Locator                                             │ Stable?  │ Use when                 │
├───┼─────────────────────────────────────────────────────┼──────────┼──────────────────────────┤
│ 1 │ getByTestId("submit-order-btn")                     │ ✅ Best  │ Always, if attr exists   │
│ 2 │ getByRole("button", { name: "Submit your order" })  │ ✅ Great │ No testid; has ARIA      │
│ 3 │ getByRole("button", { name: "Submit Order" })       │ ✅ Good  │ Matches visible text     │
│ 4 │ getByText("Submit Order")                           │ ✅ OK    │ Unique text, won't change│
│ 5 │ locator('[name="submitOrder"]')                     │ ✅ OK    │ name attr is hand-written│
│ 6 │ locator('[aria-label="Submit your order"]')         │ ✅ OK    │ a11y attr present        │
│ 7 │ locator("#btn_a3f9c2")                              │ ❌ Never │ Hashed ID, breaks builds │
│ 8 │ locator(".MuiButton-root")                          │ ❌ Never │ Library class, changes   │
└───┴─────────────────────────────────────────────────────┴──────────┴──────────────────────────┘
```

---

## 4. Annotated HTML Diagram

```
<button
  id="btn_a3f9c2"          ◄── ❌ HASHED: btn_{random} — never use
  class="MuiButton-root    ◄── ❌ HASHED: library + build hash
         btn_8x9k2z
         styles__primaryBtn___3Fk2"
  data-testid="submit-order-btn"  ◄── ✅ STABLE: added by devs for tests
  aria-label="Submit your order"  ◄── ✅ STABLE: a11y attribute
  type="submit"                   ◄── ✅ STABLE: HTML standard
  name="submitOrder"              ◄── ✅ STABLE: hand-written by dev
>
  Submit Order   ◄── ✅ STABLE: visible text (unless copy changes)
</button>
```

Rule: **Hashed = unstable. Hand-written = stable.**

---

## 5. Quick-Pick Cheat Sheet

```
┌──────────────────────────────────────────┬─────────────────────────────────────────────────────┐
│ Situation                                │ Best Locator                                        │
├──────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Button with data-testid                  │ page.getByTestId("submit-btn")                      │
│ Button with visible label                │ page.getByRole("button", { name: "Save" })          │
│ Text input with a <label>                │ page.getByLabel("Email address")                    │
│ Input with placeholder text              │ page.getByPlaceholder("Enter your email")           │
│ Link by visible text                     │ page.getByRole("link", { name: "About Us" })        │
│ Checkbox by its label                    │ page.getByLabel("Accept terms")                     │
│ Error message by text                    │ page.getByText("Email is required")                 │
│ Element inside a table row               │ page.locator("tr").filter({ hasText: "Juan" })      │
└──────────────────────────────────────────┴─────────────────────────────────────────────────────┘
```
