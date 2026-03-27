# Browser Session Management

Run multiple isolated browser sessions concurrently with state persistence.

## Named Browser Sessions

Use `-s` flag to isolate browser contexts:

```bash
# Browser 1: Admin flow
playwright-cli -s=admin open https://localhost:5173/admin

# Browser 2: Customer browsing (separate cookies, storage)
playwright-cli -s=customer open https://localhost:5173

# Commands are isolated by browser session
playwright-cli -s=admin fill e1 "admin@example.com"
playwright-cli -s=customer snapshot
```

## Browser Session Isolation Properties

Each browser session has independent:
- Cookies
- LocalStorage / SessionStorage
- IndexedDB
- Cache
- Browsing history
- Open tabs

## Browser Session Commands

```bash
playwright-cli list
playwright-cli close                # stop the default browser
playwright-cli -s=mysession close   # stop a named browser
playwright-cli close-all
playwright-cli kill-all             # for stale/zombie processes
playwright-cli delete-data
playwright-cli -s=mysession delete-data
```

## Persistent Profile

```bash
playwright-cli open https://example.com --persistent
playwright-cli open https://example.com --profile=/path/to/profile
```

## Best Practices

### Name Browser Sessions Semantically

```bash
# GOOD
playwright-cli -s=admin-flow open https://localhost:5173/admin
playwright-cli -s=checkout-test open https://localhost:5173

# AVOID
playwright-cli -s=s1 open https://localhost:5173
```

### Always Clean Up

```bash
playwright-cli -s=admin close
playwright-cli -s=checkout close
# Or
playwright-cli close-all
```
