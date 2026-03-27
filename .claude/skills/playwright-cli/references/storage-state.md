# Storage Management

Manage cookies, localStorage, sessionStorage, and browser storage state.

## Storage State

Save and restore complete browser state including cookies and storage.

```bash
# Save
playwright-cli state-save
playwright-cli state-save my-auth-state.json

# Restore
playwright-cli state-load my-auth-state.json
playwright-cli open https://localhost:5173
```

## Cookies

```bash
playwright-cli cookie-list
playwright-cli cookie-list --domain=localhost
playwright-cli cookie-get session_id
playwright-cli cookie-set session abc123 --domain=localhost --httpOnly --secure
playwright-cli cookie-delete session_id
playwright-cli cookie-clear
```

### Multiple Cookies via run-code

```bash
playwright-cli run-code "async page => {
  await page.context().addCookies([
    { name: 'session_id', value: 'sess_abc123', domain: 'localhost', path: '/', httpOnly: true },
    { name: 'cart', value: JSON.stringify([]), domain: 'localhost', path: '/' }
  ]);
}"
```

## Local Storage

```bash
playwright-cli localstorage-list
playwright-cli localstorage-get cart-storage
playwright-cli localstorage-set theme dark
playwright-cli localstorage-set cart-storage '{"items":[]}'
playwright-cli localstorage-delete cart-storage
playwright-cli localstorage-clear
```

## Session Storage

```bash
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get checkout_step
playwright-cli sessionstorage-set checkout_step 3
playwright-cli sessionstorage-delete checkout_step
playwright-cli sessionstorage-clear
```

## Common Patterns

### Authentication State Reuse

```bash
# Login and save
playwright-cli open https://localhost:5173/login
playwright-cli fill e1 "admin@example.com"
playwright-cli fill e2 "password"
playwright-cli click e3
playwright-cli state-save auth.json

# Later, restore and skip login
playwright-cli state-load auth.json
playwright-cli open https://localhost:5173/admin
```

## Security Notes

- Never commit storage state files containing auth tokens
- Add `*.auth-state.json` to `.gitignore`
- Delete state files after automation completes
