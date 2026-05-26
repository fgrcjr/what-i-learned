# 06 — Framework & Parent Locators

> Visual reference card for React/Vue component locators and parent element traversal in Playwright TypeScript.

---

## 1. The Hashed Class Problem

When you inspect a React (MUI, styled-components) or Vue app, the DOM does **not** show component names — it shows generated class strings that change on every build.

```
WHAT YOU SEE IN REACT DEVTOOLS       WHAT THE DOM ACTUALLY LOOKS LIKE
────────────────────────────         ──────────────────────────────────────
<BookList>                           <ul class="MuiList-root lst_4kj9xz">
  <BookItem author="King">             <li class="MuiListItem-root itm_7qp2mn">
    <Button variant="outlined">          <button class="MuiButton-root btn_8x9k2z
      "View"                                      MuiButton-outlined f3x_p9q1">
    </Button>                               View
  </BookItem>                          </li>
</BookList>                          </ul>
```

Frameworks like MUI apply utility classes that are hashed or versioned at build time (e.g. `btn_8x9k2z`). Targeting them with CSS selectors breaks on every deploy. The solution is to locate by **component name**, **props**, **roles**, or **text** instead.

---

## 2. React Component Locators (`_react=`)

Playwright can query the **React fiber tree** directly. Component names use **CamelCase**.

```
REACT COMPONENT TREE                 _react= SELECTOR MAPS TO
─────────────────────                ─────────────────────────────────────
<App>                                page.locator('_react=BookItem')
  <BookList>                           └─ matches every <BookItem> instance
    <BookItem author="King">
      <Button>View</Button>          page.locator('_react=BookItem[author = "King"]')
    </BookItem>                        └─ matches only the King BookItem
    <BookItem author="Rowling">
      <Button>View</Button>
    </BookItem>
  </BookList>
</App>
```

### Syntax reference

```typescript
// Match by component name only
await page.locator('_react=BookItem').count();

// Match by component + exact prop (case-sensitive)
await page.locator('_react=BookItem[author = "Steven King"]').click();

// Match by prop only, case-insensitive
await page.locator('_react=[author = "steven king" i]').click();

// Match by truthy prop
await page.locator('_react=MyButton[enabled]').click();

// Match by boolean false
await page.locator('_react=MyButton[enabled = false]').click();

// Match by prop substring
await page.locator('_react=[author *= "King"]').click();

// Match by multiple props
await page.locator('_react=BookItem[author *= "king" i][year = 1990]').click();

// Match by nested prop
await page.locator('_react=[pagination.page = 2]').click();

// Match by prop regex
await page.locator('_react=[author = /Steven(\\s+King)?/i]').click();

// Match by React key
await page.locator('_react=BookItem[key = "2"]').click();
```

> **Requirement:** Works only on **unminified** builds. Use React DevTools to confirm component display names.

---

## 3. Vue Component Locators (`_vue=`)

Same concept as React, but component names use **kebab-case**.

```
VUE COMPONENT TREE                   _vue= SELECTOR MAPS TO
──────────────────                   ─────────────────────────────────────
<App>                                page.locator('_vue=book-item')
  <book-list>                          └─ matches every <book-item> instance
    <book-item author="King">
      <my-button>View</my-button>    page.locator('_vue=book-item[author = "King"]')
    </book-item>                       └─ matches only the King book-item
    <book-item author="Rowling">
      <my-button>View</my-button>
    </book-item>
  </book-list>
</App>
```

### Syntax reference

```typescript
// Match by component name only
await page.locator('_vue=book-item').count();

// Match by component + exact prop (case-sensitive)
await page.locator('_vue=book-item[author = "Steven King"]').click();

// Match by prop only, case-insensitive
await page.locator('_vue=[author = "steven king" i]').click();

// Match by truthy prop
await page.locator('_vue=my-button[enabled]').click();

// Match by boolean false
await page.locator('_vue=my-button[enabled = false]').click();

// Match by prop substring
await page.locator('_vue=[author *= "King"]').click();

// Match by multiple props
await page.locator('_vue=book-item[author *= "king" i][year = 1990]').click();

// Match by nested prop
await page.locator('_vue=[pagination.page = 2]').click();

// Match by prop regex
await page.locator('_vue=[author = /Steven(\\s+King)?/i]').click();
```

> **Requirement:** Works only on **unminified** builds. Use Vue DevTools to confirm component names.

---

## 4. When to Use Framework Locators vs `data-testid`

| Situation | Recommended approach |
|---|---|
| App has hashed/generated class names | `_react=` / `_vue=` or `getByRole` |
| You control the source code | Add `data-testid` — most resilient |
| Testing a third-party component library | `_react=` / `_vue=` by component + props |
| Build is minified (production) | `getByRole`, `getByText`, `data-testid` only |
| Component display name is unstable | Prefer `data-testid` or role-based |
| Prop values are dynamic/unique | `_react=`/`_vue=` with exact prop filter |

---

## 5. Parent Element Traversal

Sometimes you find a child easily (by text or role), but you need to act on its **parent container**.

```
DOM STRUCTURE
─────────────────────────────────────────────────────────────────────
<table>
  <tbody>
    <tr>  ◄── you want THIS row (to assert its status cell)
      <td>Juan dela Cruz</td>
      <td>Active</td>
      <td><button>Delete</button></td>
    </tr>
    <tr>
      <td>Maria Santos</td>
      <td>Inactive</td>
      <td><button>Delete</button></td>
    </tr>
  </tbody>
</table>
```

### Option A — `.locator('..')` (go up one level via XPath)

```typescript
// Find the <td> with the name, then step up to its parent <tr>
const nameCell = page.getByText('Juan dela Cruz');
const row = nameCell.locator('xpath=..');   // one level up = <tr>

await expect(row.getByRole('cell', { name: 'Active' })).toBeVisible();
```

> Use `xpath=..` when no cleaner parent selector is available. Fragile if DOM nesting changes.

### Option B — `.filter({ has: ... })` (preferred)

```typescript
// Find all rows, then keep only the one that contains the target name
const row = page.locator('tr').filter({
  has: page.getByText('Juan dela Cruz'),
});

await expect(row).toHaveCount(1);
await expect(row.getByRole('cell', { name: 'Active' })).toBeVisible();
```

### Option C — Chaining: find row by text, then drill into it

```typescript
// Get the row, then find the Delete button inside it
const row = page.locator('tr').filter({ hasText: 'Juan dela Cruz' });
await row.getByRole('button', { name: 'Delete' }).click();
```

---

## 6. The `.filter()` + `.locator()` Power Combo

This is the go-to pattern for tables and lists with hashed class names — no fragile selectors needed.

```
TABLE DIAGRAM
┌─────────────────┬──────────┬──────────────────────────┐
│ Name            │ Status   │ Actions                  │
├─────────────────┼──────────┼──────────────────────────┤
│ Juan dela Cruz  │ Active   │ [Edit] [Delete]          │  ◄── target row
├─────────────────┼──────────┼──────────────────────────┤
│ Maria Santos    │ Inactive │ [Edit] [Delete]          │
├─────────────────┼──────────┼──────────────────────────┤
│ Pedro Reyes     │ Active   │ [Edit] [Delete]          │
└─────────────────┴──────────┴──────────────────────────┘
         │                              │
   .filter({ hasText: 'Juan dela Cruz' })
         │                              │
         └──── scoped row ─────────────►└── .getByRole('button', { name: 'Delete' })
```

```typescript
// Click Delete only in Juan's row — even if all rows have the same button classes
await page
  .locator('tr')
  .filter({ hasText: 'Juan dela Cruz' })
  .getByRole('button', { name: 'Delete' })
  .click();

// Assert Juan's status without touching other rows
await expect(
  page.locator('tr').filter({ hasText: 'Juan dela Cruz' }).getByRole('cell', { name: 'Active' })
).toBeVisible();

// Chain two filters to narrow further (e.g., row with both "Juan" AND a Delete button)
await page
  .locator('tr')
  .filter({ hasText: 'Juan dela Cruz' })
  .filter({ has: page.getByRole('button', { name: 'Delete' }) })
  .screenshot({ path: 'juan-row.png' });
```

### Filter options quick reference

| Option | Type | Effect |
|---|---|---|
| `hasText` | `string \| RegExp` | Row must contain this text anywhere |
| `hasNotText` | `string \| RegExp` | Row must NOT contain this text |
| `has` | `Locator` | Row must contain a matching descendant |
| `hasNot` | `Locator` | Row must NOT contain a matching descendant |
| `visible` | `boolean` | Only visible elements |

---

## 7. `and()` / `or()` Locator Operators

Use these when a single locator condition is not specific enough.

### `and()` — element must match BOTH conditions

```typescript
// A button that is both a "button" role AND has the title "Subscribe"
const subscribeBtn = page
  .getByRole('button')
  .and(page.getByTitle('Subscribe'));

await subscribeBtn.click();
```

```
MATCHES:   <button title="Subscribe">Subscribe</button>  ✔
SKIPS:     <button title="Cancel">Subscribe</button>     ✗ (wrong title)
SKIPS:     <a title="Subscribe">Subscribe</a>            ✗ (wrong role)
```

### `or()` — element matches EITHER condition

```typescript
// Handle two possible UI states: the button, or a confirmation dialog
const newEmailBtn = page.getByRole('button', { name: 'New' });
const securityDialog = page.getByText('Confirm security settings');

// Wait for whichever appears first
await expect(newEmailBtn.or(securityDialog).first()).toBeVisible();

// Then handle conditionally
if (await securityDialog.isVisible()) {
  await page.getByRole('button', { name: 'Dismiss' }).click();
}
await newEmailBtn.click();
```

> **Note:** If both match simultaneously, `or()` may throw a strict mode error — use `.first()` to prevent it.

---

## Quick Decision Summary

```
Element has a component name in React/Vue?
  YES → _react=ComponentName  /  _vue=component-name
  NO  ↓

You control the source code?
  YES → add data-testid, use getByTestId()
  NO  ↓

Element has unique visible text or accessible role?
  YES → getByText() / getByRole()
  NO  ↓

Need to scope to a row/card that contains known text?
  → locator('tr').filter({ hasText: '...' }).getByRole(...)

Need the PARENT of a known child?
  → childLocator.locator('xpath=..')           (simple, fragile)
  → parentLocator.filter({ has: childLocator }) (preferred)
```
