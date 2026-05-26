# Layout-Based Locators in Playwright
### When class names are useless, position is your anchor

---

## Why Layout Locators Exist

Modern UI frameworks (MUI, Tailwind JIT, CSS Modules) generate hashed class names that change on every build.

```
// What you see in DevTools — useless as a selector anchor
<div class="MuiFormControl-root css_a3f9c2 jss_8x9k2z">
  <label class="MuiFormLabel-root css_b7d1e4">Email</label>
  <input class="MuiInputBase-input css_f2c8a1" />
</div>
<div class="MuiFormControl-root css_q9r3p7 jss_2m5n8k">
  <label class="MuiFormLabel-root css_x1y4z6">Password</label>
  <input class="MuiInputBase-input css_h6j9l2" type="password" />
</div>
```

```
+------------------------------+
|  [ Email    ]  [_input_____] |   <- css_a3f9c2 / css_f2c8a1
|  [ Password ]  [_input_____] |   <- css_q9r3p7 / css_h6j9l2
|                [  Submit   ] |   <- css_m4p1r9
+------------------------------+
```

Both inputs share the same hashed class. `getByRole('textbox')` returns two hits.
**The only stable difference is where they sit on screen.**

> Layout pseudo-classes use the element's **bounding client rect** to compute distance
> and relative position — not the DOM tree.

---

## The 5 Layout Pseudo-Classes

---

### `:right-of(anchor)`

**Plain English:** Match elements whose left edge is to the right of the anchor's right edge, at any vertical position.

```
+----------+      +----------+
|  anchor  |      |  TARGET  |
+----------+      +----------+
     ^                  ^
  :text("Email")    input:right-of(...)
```

**Realistic scenario:** Two inputs on the same row as their labels — both inputs share the same class.

```typescript
// Fill the email input, not the password input
await page.locator('input:right-of(:text("Email"))').fill('user@example.com');

// Fill the password input
await page.locator('input:right-of(:text("Password"))').fill('s3cr3t!');
```

---

### `:left-of(anchor)`

**Plain English:** Match elements whose right edge is to the left of the anchor's left edge, at any vertical position.

```
+----------+      +----------+
|  TARGET  |      |  anchor  |
+----------+      +----------+
     ^                  ^
  radio:left-of(...)  :text("Label 3")
```

**Realistic scenario:** Radio buttons rendered before their label text — no stable id or name attribute.

```typescript
// Click the radio button that sits to the left of "Agree to Terms"
await page.locator('[type=radio]:left-of(:text("Agree to Terms"))').click();

// When multiple radios match, pick the closest one
await page.locator('[type=radio]:left-of(:text("Label 3"))').first().click();
```

---

### `:above(anchor)`

**Plain English:** Match elements whose bottom edge is above the anchor's top edge, at any horizontal position.

```
+-------------------+
|      TARGET       |   <- above
+-------------------+
         |
+-------------------+
|      anchor       |
+-------------------+
```

**Realistic scenario:** A column header sits above table rows that share hashed row classes.

```typescript
// Find the "Name" column header above the first data row
await page.locator('th:above(.css_row_k3m9p2)').first().textContent();

// Find a filter input that sits above a data grid
await page.locator('input:above([role="grid"])').fill('search term');
```

---

### `:below(anchor)`

**Plain English:** Match elements whose top edge is below the anchor's bottom edge, at any horizontal position.

```
+-------------------+
|      anchor       |
+-------------------+
         |
+-------------------+
|      TARGET       |   <- below
+-------------------+
```

**Realistic scenario:** An error message or helper text rendered below a label when both have no stable id.

```typescript
// Find the input that is below the "Date of Birth" section heading
await page.locator('input:below(:text("Date of Birth"))').first().fill('1990-01-15');

// Find the error span below the email field wrapper
await page.locator('span:below(.css_field_wrapper_a3f9)').first().textContent();
```

---

### `:near(anchor)` — and the distance argument

**Plain English:** Match elements within **50 CSS pixels** of the anchor (in any direction). Provide a second argument to override the default radius.

```
        120px radius
    .-------------------.
   /    +----------+     \
  |     |  anchor  |      |
   \    +----------+     /
    `-------------------`
     ^ everything here
       is :near(anchor)
       or :near(anchor, 120)
```

**Default distance: 50px.** Override: `:near(anchor, N)` where N is pixels.

```typescript
// Default 50px — find the delete button near a specific card title
await page.locator('button:near(:text("Invoice #4421"))').click();

// Explicit 120px radius — useful when elements are spaced further apart
await page.locator('button:near(:text("Promo Card"), 120)').click();

// Find any icon near a specific status badge
await page.locator('svg:near(.css_status_badge_7r2x)').first().click();
```

> Results are **sorted by distance** to the anchor. Use `.first()` to get the nearest match.
> Do not use `.first()` blindly — it may return an empty `<div>` or an off-screen element.

---

## Combining Layout with Other Selectors

Layout pseudo-classes are weak on their own — always pair them with a **type or role** selector to narrow the match pool.

```
// BAD — may match any element in between, including empty wrappers
page.locator(':right-of(:text("Email"))')

// GOOD — scoped to input elements only
page.locator('input:right-of(:text("Email"))')
```

**Chaining layout with role:**

```typescript
// Find a button to the right of the "Email" label
await page.locator('button:right-of(:text("Email"))').click();

// Find a checkbox below the "Notifications" heading
await page.locator('[type=checkbox]:below(:text("Notifications"))').first().check();

// Find a select dropdown to the right of a "Country" label in a hashed form
await page.locator('select:right-of(:text("Country"))').selectOption('Australia');
```

**Chaining layout with `getByRole` via `.filter()`:**

```typescript
// Scope to buttons, then filter by layout position
await page.getByRole('button').filter({ has: page.locator(':right-of(:text("Confirm"))') });
// Note: for complex narrowing, direct CSS layout selectors are usually simpler
```

**Using `.first()` with layout for closest-wins logic:**

```typescript
// In a repeating list, grab the edit button closest to "Alice"
await page.locator('button:near(:text("Alice"))').first().click();
```

---

## Real-World Hashed Element Scenarios

---

### Scenario 1 — Edit icon next to a specific table row

```
+------------------------------------------+
|  Name         | Amount  | Actions        |
+------------------------------------------+
|  Invoice #001 | $120    | [edit] [del]   |
|  Invoice #002 | $450    | [edit] [del]   |   <- target row
|  Invoice #003 | $80     | [edit] [del]   |
+------------------------------------------+

All [edit] buttons share class: css_icon_btn_9k2p
All [del]  buttons share class: css_icon_btn_9k2p  (same!)
```

```typescript
// Click the edit icon on the "Invoice #002" row
// Both edit and delete icons share the same hashed class — use position
await page.locator('button:right-of(:text("Invoice #002"))').first().click();

// If you need the second button (delete), skip first()
await page.locator('button:right-of(:text("Invoice #002"))').nth(1).click();
```

---

### Scenario 2 — Delete button near a specific card

```
+---------------------+  +---------------------+
|  css_card_a3f9      |  |  css_card_b7d1      |
|  "Summer Sale"      |  |  "Winter Promo"     |
|                     |  |                     |
|  [Edit]  [Delete]   |  |  [Edit]  [Delete]   |
+---------------------+  +---------------------+
```

```typescript
// Delete the "Winter Promo" card — both cards use identical hashed classes
await page.locator('button:near(:text("Winter Promo"))').filter({
  hasText: 'Delete'
}).click();

// Alternative: use :near with explicit text match on the button
await page.locator('button:has-text("Delete"):near(:text("Winter Promo"))').click();
```

---

### Scenario 3 — Input below a label when both have hashed IDs

```
+----------------------------------+
|  <label id="lbl_x9k2">          |
|    Street Address                |
|  </label>                        |
|                                  |
|  <input id="inp_m4p7"            |  <- no stable id pattern
|    class="css_input_r3q8" />     |
+----------------------------------+
```

```typescript
// The label text is stable even when the id is hashed
// Find the input that sits below the "Street Address" label
await page.locator('input:below(:text("Street Address"))').first().fill('42 Main St');

// Scope further if multiple inputs exist below (e.g. city, postcode on same form)
await page.locator('input:below(:text("Street Address")):above(:text("City"))').fill('42 Main St');
```

---

## Limitations

| Situation | Why it breaks |
|-----------|---------------|
| **Scrollable containers** | Elements outside the visible viewport may report bounding rects of `{0, 0, 0, 0}`, making layout comparisons unreliable. |
| **Absolute / fixed positioning** | Elements positioned with `position: absolute` or `fixed` may visually overlap the anchor but have unrelated DOM coordinates. |
| **Responsive reflow** | On smaller viewports, a layout that was horizontal may stack vertically, swapping `:right-of` and `:below` relationships. |
| **Off-by-one pixel** | Bounding rect calculations can differ by 1px across browsers; a layout match at exactly the boundary may be flaky. |
| **Iframes** | Layout pseudo-classes operate within a single frame; cross-frame position comparisons are not supported. |

---

## Quick Reference Card

```
Pseudo-class              Direction          Default max distance
------------------------------------------------------------------
:right-of(anchor)         left > right       unlimited
:left-of(anchor)          right > left       unlimited
:above(anchor)            below > above      unlimited
:below(anchor)            above > below      unlimited
:near(anchor)             any direction      50px
:near(anchor, N)          any direction      N px
------------------------------------------------------------------

Always pair with a type/role:    input:right-of(...)
Use .first() for closest match:  button:near(...).first()
Override near distance:          button:near(:text("X"), 120)
```
