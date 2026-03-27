# Test Generation

Generate Playwright test code automatically as you interact with the browser.

## How It Works

Every action you perform with `playwright-cli` generates corresponding Playwright TypeScript code.

## Example Workflow

```bash
playwright-cli open https://localhost:5173
playwright-cli snapshot
# Output shows: e1 [link "Termékek"], e2 [button "Kosár"], etc.

playwright-cli click e1
# Ran Playwright code:
# await page.getByRole('link', { name: 'Termékek' }).click();

playwright-cli click e5
# Ran Playwright code:
# await page.getByRole('button', { name: 'Kosárba' }).click();
```

## Building a Test File

```typescript
import { test, expect } from '@playwright/test';

test('add product to cart', async ({ page }) => {
  await page.goto('https://localhost:5173');
  await page.getByRole('link', { name: 'Termékek' }).click();
  await page.getByRole('button', { name: 'Kosárba' }).first().click();

  await expect(page.getByTestId('cartBadge')).toHaveText('1');
});
```

## Best Practices

1. **Use Semantic Locators** — role-based locators are more resilient than CSS selectors
2. **Explore Before Recording** — take snapshots to understand page structure first
3. **Add Assertions Manually** — generated code captures actions but not assertions
