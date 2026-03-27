# Playwright E2E Testing Guide

> Conventions and patterns for writing Playwright end-to-end tests in the webshop project.

---

## Location and Config

Playwright tests live in `packages/frontend/e2e/`. Config is at `packages/frontend/playwright.config.ts`.

---

## Test Structure — Single `test()` with `test.step()`

Every test file should use a **single `test()` call** with `test.step()` for each scenario. This ensures fixtures stay alive for the entire test duration.

```typescript
// Correct — single test, fixtures alive for all steps
test("Checkout flow", async ({ page }) => {
    test.setTimeout(60_000);

    await test.step("Browse products", async () => { ... });
    await test.step("Add to cart", async () => { ... });
    await test.step("Complete checkout", async () => { ... });
    await test.step("Verify confirmation", async () => { ... });
});

// Wrong — multiple tests lose shared state
test("Browse products", async ({ page }) => { ... });
test("Add to cart", async ({ page }) => { ... }); // New page, cart is empty!
```

---

## Page Object Model Conventions

POMs go in `packages/frontend/e2e/pages/`.

### Rules

1. **All locators are `private readonly`** — never expose locators as public properties
2. **All interactions are `async` methods** with `verbNoun` naming
3. **Constructor takes `Page`**, locators initialized in constructor body
4. **Methods encapsulate waits** — each method waits for its expected outcome

```typescript
export class ProductListPage {
    private readonly page: Page;
    private readonly productGrid: Locator;
    private readonly categoryChips: Locator;

    constructor(page: Page) {
        this.page = page;
        this.productGrid = page.getByTestId("productGrid");
        this.categoryChips = page.getByRole("group").filter({ hasText: "Kategória" });
    }

    async selectCategory(name: string): Promise<void> {
        await this.categoryChips.getByRole("button", { name }).click();
        await this.productGrid.waitFor({ state: "visible" });
    }

    async clickProduct(name: string): Promise<void> {
        await this.productGrid.getByText(name).click();
        await this.page.waitForURL(/\/termekek\/.+/);
    }

    async expectProductCount(count: number): Promise<void> {
        await expect(this.productGrid.getByTestId("productCard")).toHaveCount(count);
    }
}

// Wrong — public locators
export class ProductListPage {
    readonly productGrid: Locator; // Never do this
}
```

### Method Naming (verbNoun)

| Pattern | Examples |
|---------|---------|
| `click*` | `clickProduct()`, `clickAddToCart()`, `clickCheckout()` |
| `expect*` | `expectProductCount()`, `expectCartTotal()`, `expectConfirmation()` |
| `waitFor*` | `waitForPageLoad()`, `waitForProducts()` |
| `fill*` | `fillShippingAddress()`, `fillPaymentDetails()` |
| `select*` | `selectCategory()`, `selectShippingMethod()` |
| `get*` | `getCartItemCount(): Promise<number>` |

---

## Selectors — Prefer Stable Attributes

Use `data-test-id` attributes (camelCase) for elements that need test targeting:

```typescript
// Good — stable, explicit test selector
page.getByTestId("productCard")
page.getByTestId("addToCartButton")
page.getByTestId("cartBadge")

// Good — semantic role-based
page.getByRole("button", { name: "Kosárba" })
page.getByRole("heading", { name: "Termékek" })

// Avoid — fragile CSS selectors
page.locator(".MuiCard-root:nth-child(3)")
page.locator("#product-123")
```

### Key Test IDs (planned)

| Element | `data-test-id` |
|---------|----------------|
| Product card | `productCard` |
| Add to cart button | `addToCartButton` |
| Cart badge (item count) | `cartBadge` |
| Cart drawer | `cartDrawer` |
| Cart line item | `cartLineItem` |
| Checkout form | `checkoutForm` |
| Place order button | `placeOrderButton` |
| Order confirmation | `orderConfirmation` |
| Price display | `priceDisplay` |

---

## Composite Flows with `browser_run_code`

When using the Playwright MCP tools interactively, prefer `browser_run_code` over snapshot-click loops to reduce round-trips:

```js
async (page) => {
    // Multiple actions, zero snapshots, one round-trip
    await page.getByTestId("productCard").first().click();
    await page.getByTestId("addToCartButton").click();
    await page.getByTestId("cartDrawer").waitFor({ state: "visible" });
    const itemCount = await page.getByTestId("cartLineItem").count();
    return { itemCount };
}
```

Only fall back to `browser_snapshot` when inspecting unknown/dynamic content.

---

## Test Data

For e2e tests, seed the database with known product data. Keep test fixtures in `packages/frontend/e2e/fixtures/`.

---

## Running Tests

```bash
# Run all e2e tests
cd packages/frontend && npx playwright test

# Run specific test file
npx playwright test e2e/checkout.spec.ts

# Run in headed mode (visible browser)
npx playwright test --headed

# Run with specific project (browser)
npx playwright test --project=chromium

# Debug mode (step through)
npx playwright test --debug

# Show report after run
npx playwright show-report
```

---

## Hungarian Text in Tests

Use Hungarian text directly in selectors and assertions:

```typescript
await page.getByRole("button", { name: "Kosárba" }).click();
await page.getByRole("heading", { name: "Fizetés" }).waitFor();
await expect(page.getByText("Köszönjük a rendelését!")).toBeVisible();
```

For frequently used strings, define constants:

```typescript
const HU = {
    addToCart: "Kosárba",
    checkout: "Tovább a fizetéshez",
    placeOrder: "Megrendelés elküldése",
    orderConfirm: "Köszönjük a rendelését!",
    emptyCart: "A kosár üres",
} as const;
```

---

## Timeouts

- Default test timeout: 30s
- Expect timeout: 5s
- For payment flow tests (Barion redirect): extend to 60s via `test.setTimeout(60_000)`
- For full checkout e2e: extend to 120s

---

## Best Practices

1. **One test file per user flow** — checkout.spec.ts, cart.spec.ts, browsing.spec.ts
2. **Test the happy path first** — then add edge cases
3. **Don't test MUI internals** — test user-visible behavior
4. **Use network mocking** for payment provider in e2e tests (don't hit real Barion sandbox in CI)
5. **Clean up test state** — each test should start from a known state
