# Visual Guide 04 — Async & Network Patterns in Playwright

---

## 1. Why `await` Is Everywhere

JavaScript is non-blocking. When Playwright tells the browser to do something — click a button, wait for a response, check if text is visible — that work happens asynchronously. `await` is the pause point that says: "don't move to the next line until this is done."

### Timeline: What happens when a user submits a form

```
TIME ──────────────────────────────────────────────────────────────►

[Test starts]
    │
    ├── await page.goto(url)
    │         └── WAITS: browser loads, all assets fetched, page idle
    │
    ├── await page.fill(input, value)
    │         └── WAITS: element is ready and interactable
    │
    ├── await page.click(submitBtn)
    │         └── WAITS: click registered by the browser
    │                         │
    │                         ▼
    │              [Network request in flight]
    │              POST /api/contact ─────────────────────►  server
    │                                                         │
    │                                              processes  │
    │                                              & responds │
    │              ◄─────────────────────────────── 200 OK   │
    │                         │
    │              [DOM updates]
    │              React/Vue re-renders, success message added
    │                         │
    ├── await expect(successMsg).toBeVisible()
    │         └── WAITS: element appears in DOM and is visible
    │
[Test passes]
```

**Rule:** Any time Playwright talks to the browser or the network, you need `await`. Skip it and the assertion runs before the work finishes — you get a false failure or a false pass.

---

## 2. Which Wait Method to Use

```
┌─────────────────────────┬──────────────────────────────────┬─────────────────────────────────────┬──────────────────────────────────────┐
│ Method                  │ What it waits for                │ When to use                         │ Danger                               │
├─────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────┤
│ waitForResponse(url)    │ A network response matching URL  │ After clicking submit, need to      │ Low — tied to real network events    │
│                         │ pattern to arrive                │ confirm the API was called          │                                      │
├─────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────┤
│ waitForSelector(sel)    │ Element matching selector to     │ Waiting for dynamic content to      │ Low — auto-retries until timeout     │
│                         │ exist in the DOM                 │ appear (e.g. after AJAX load)       │                                      │
├─────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────┤
│ waitForURL(pattern)     │ Page URL to match a pattern      │ After clicking a link or redirect   │ Low — declarative and readable       │
│                         │                                  │ to confirm navigation happened      │                                      │
├─────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────┤
│ waitForTimeout(ms)      │ A fixed number of milliseconds   │ ALMOST NEVER                        │ HIGH — anti-pattern. Makes tests     │
│                         │ (a hard sleep)                   │                                     │ slow and flaky. Use a real wait      │
│                         │                                  │                                     │ instead. Only ok for quick debug.    │
└─────────────────────────┴──────────────────────────────────┴─────────────────────────────────────┴──────────────────────────────────────┘
```

**Prefer event-based waits** (`waitForResponse`, `waitForSelector`, `waitForURL`) over time-based waits (`waitForTimeout`). Event-based waits resolve as soon as the condition is true — no unnecessary delay, no arbitrary sleep that breaks on a slow CI server.

---

## 3. API Mocking with `page.route()`

`page.route()` intercepts outgoing network requests and lets your test return a fake response. The real server never gets called.

```
                    ┌─────────────────────────────────────────────┐
                    │              NORMAL (no mock)               │
                    └─────────────────────────────────────────────┘

  [Test clicks button]
        │
        ▼
  Browser sends ──────────────────────────────────► Real server
  GET /api/users                                          │
                                                   returns data
  Browser receives ◄──────────────────────────────── 200 OK
        │
  UI renders list


                    ┌─────────────────────────────────────────────┐
                    │           WITH page.route() MOCK            │
                    └─────────────────────────────────────────────┘

  [page.route("**/api/users", handler) registered]
        │
  [Test navigates to page]
        │
        ▼
  Browser sends ──────► INTERCEPTOR (your handler) ──X──► Real server
  GET /api/users              │                       never reached
                         route.fulfill({
                           status: 500,
                           body: { error: "..." }
                         })
                              │
  Browser receives ◄──────────┘
        fake 500 response
        │
  UI renders error state   ◄── assert this!
```

**Why mock?** Test error states, empty states, or slow responses without needing a real backend in a known bad state. Your test controls the scenario exactly.

```typescript
// Register BEFORE navigating — the handler must be ready
await page.route("**/api/users", (route) => {
  route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) });
});
await page.goto("https://your-app.com/users");
await expect(page.locator("text=Something went wrong")).toBeVisible();
```

---

## 4. `Promise.all` — Concurrent Wait Pattern

**The problem:** If you start listening for a network response AFTER clicking, the response may have already arrived before your listener registered. You miss it. The test hangs until timeout.

### Wrong order — sequential (can miss the response)

```
TIME ───────────────────────────────────────────────────────────────►

  await page.click(submitBtn)   ──── fires immediately
          │
          │   [response arrives HERE — nobody is listening yet]
          │
  await page.waitForResponse()  ──── registers too late, never resolves
          │
          └── TEST HANGS / TIMEOUT
```

### Right order — concurrent with `Promise.all`

```
TIME ───────────────────────────────────────────────────────────────►

  Promise.all([
    page.waitForResponse("**/api/contact"),   ─── listener registered FIRST
    page.click(submitBtn),                    ─── click fires second (same tick)
  ])
      │                                   │
      │ [click fires]                     │
      │      │                            │
      │      ▼                            │
      │  POST /api/contact ─────────────► server
      │                                   │
      │             response arrives ◄────┘
      │                   │
      │  waitForResponse resolves ─────────────────────────────────►
      │
  [both promises done — Promise.all resolves]
      │
  const [response] = result   ◄── you have the response object
```

```typescript
// Correct pattern — start listening before the action that triggers the request
const [response] = await Promise.all([
  page.waitForResponse("**/api/contact"),  // listener first
  page.click('button[type="submit"]'),     // trigger second
]);
expect(response.status()).toBe(200);
```

The same pattern applies to events like `download`, `dialog`, and new tabs (`context.waitForEvent("page")`).

---

## 5. Cookie / LocalStorage / Session Patterns

```
┌─────────────────┬───────────────────────────────────────┬──────────────────────────────────────┬──────────────────────────────────────┐
│ Storage type    │ How to READ in Playwright             │ How to WRITE in Playwright           │ Persists across?                     │
├─────────────────┼───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┤
│ Cookie          │ const cookies =                       │ await context.addCookies([{          │ Page reloads: YES                    │
│                 │   await context.cookies();            │   name, value, domain, path          │ New context: NO (fresh context       │
│                 │ cookies.find(c => c.name === "auth")  │ }])                                  │ = fresh cookies)                     │
├─────────────────┼───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┤
│ localStorage    │ await page.evaluate(()=>              │ await page.evaluate(()=>             │ Page reloads: YES                    │
│                 │   localStorage.getItem("theme"))      │   localStorage.setItem("k","v"))     │ New page in same context: NO         │
│                 │                                       │ — must be after page.goto()          │ (localStorage is per-origin)         │
├─────────────────┼───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┤
│ sessionStorage  │ await page.evaluate(()=>              │ await page.evaluate(()=>             │ Page reloads: NO                     │
│                 │   sessionStorage.getItem("key"))      │   sessionStorage.setItem("k","v"))   │ Tab close: clears immediately        │
├─────────────────┼───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┤
│ Auth state      │ Read specific cookie (see above)      │ context.addCookies() or              │ Saved via                            │
│ (logged-in      │ or inspect network headers            │ page.evaluate() to set token         │ context.storageState() — can be      │
│  session)       │                                       │ in localStorage                      │ loaded in future tests               │
└─────────────────┴───────────────────────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┘
```

**Key gotcha:** Set localStorage/sessionStorage only after `page.goto()` — you need an active origin for the browser's storage APIs to work. For cookies, use `context.addCookies()` before navigating.

---

## 6. Security Test Patterns — XSS and SQL Injection

Security tests check that bad input is **defused** before it reaches the output or the database.

### XSS — Cross-Site Scripting

```
  USER INPUT                WHAT THE APP DOES              WHAT APPEARS IN HTML
  ──────────                ─────────────────              ────────────────────

  (safe app)
  <script>alert("xss")     ──► ESCAPE ──►                 &lt;script&gt;alert(&quot;xss&quot;)
  </script>                                                — rendered as plain text, not executed

  (vulnerable app)
  <script>alert("xss")     ──► NO ESCAPE ──►              <script>alert("xss")</script>
  </script>                                                — browser executes the script!
                                                                     │
                                                                     ▼
                                                            DIALOG FIRES  ◄── Playwright catches this
```

**How the test catches XSS:**

```
  page.on("dialog", handler)    ← trap is set BEFORE any input
          │
  fill input with <script>alert("xss")</script>
          │
  click submit
          │
          ├── [safe app]   → no dialog fires → test passes
          │
          └── [vulnerable] → dialog fires → handler runs:
                                  throw new Error("XSS succeeded!")
                                  → test FAILS and tells you why
```

### SQL Injection

```
  USER INPUT                WHAT THE APP DOES                 DATABASE QUERY
  ──────────                ─────────────────                 ──────────────

  (safe app — parameterized queries)
  ' OR '1'='1'; DROP        ──► treated as a literal          SELECT * FROM users
  TABLE users; --               string parameter              WHERE email = ?
                                                              param: "' OR '1'='1'..."
                                                              — query finds nothing, safe

  (vulnerable app — string concatenation)
  ' OR '1'='1'; DROP        ──► injected into SQL string      SELECT * FROM users
  TABLE users; --                                             WHERE email = '' OR '1'='1';
                                                              DROP TABLE users; --'
                                                              — logs everyone in OR drops table!
```

**What the Playwright test asserts:**

```
  fill email with SQL payload
          │
  fill password with "anything"
          │
  click submit
          │
          ▼
  Assert NONE of these happen:
    ┌─────────────────────────────────────────────────┐
    │  page URL contains /dashboard        → NOT OK   │  (got logged in)
    │  page shows text "SQL"               → NOT OK   │  (leaked db error)
    │  page shows text "syntax error"      → NOT OK   │  (leaked db error)
    └─────────────────────────────────────────────────┘

  If all three assertions pass → input was safely rejected
```

**Both security tests share the same logic:** inject malicious input, then assert the app **did not** react in the dangerous way. The dialog listener in XSS tests is the specific trap for script execution — if `alert()` runs, the listener fires and fails the test immediately.
