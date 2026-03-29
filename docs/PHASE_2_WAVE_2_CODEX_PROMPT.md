# Phase 2 Wave 2 — Codex Agent Fleet Prompt

> Launch these as a fleet of **Codex** agents. Each agent works on a separate branch. All Wave 1 code is already merged. Failing tests have been written — each agent must make their tests pass.

---

## Project Context

Hungarian herbal ointment webshop monorepo (`pnpm` workspaces):

```
packages/
├── frontend/    # React 19 + Vite + MUI v7 + TanStack Query + Zustand
├── backend/     # Fastify + Drizzle ORM + PostgreSQL
└── shared/      # Shared TypeScript types and Zod schemas
```

### Coding Rules (ALL agents must follow)

- Always use arrow functions for components, handlers, helpers
- Use `type` over `interface` for props
- Never use `any` — use `unknown` or specific types
- Use `import type` for type-only imports
- Functions: `verbNoun` naming (e.g. `handleSubmit`, `fetchProducts`)
- Always use braces in `if`/`else`, even single-line
- No JSDoc comments
- Use `sx` prop instead of `style` for MUI components
- MUI Grid v2: `<Grid size={{ xs: 12, md: 6 }}>` NOT `<Grid xs={12} md={6}>`
- All user-facing text in Hungarian
- Keep type properties in alphabetical order
- `data-test-id` values use camelCase
- Event handler props: `on*`. Handler functions: `handle*`

### Verification (EVERY agent must run these before submitting)

```bash
pnpm typecheck
pnpm lint
pnpm --filter frontend test
```

All tests must pass, including the pre-written failing tests for your task.

---

## Agent 1: Header Enhancement + Cart Drawer + Mobile Nav Integration

**Branch:** `phase2/header-enhancement`

**Goal:** Wire up the CartDrawer and MobileNavDrawer into the Header and AppLayout so mobile navigation and the quick cart work.

**Pre-written tests to make pass:** None (tested via e2e only)

**Files to MODIFY:**

**`packages/frontend/src/components/layout/Header.tsx`:**
- Add state: `cartDrawerOpen` and `mobileNavOpen`
- Mobile (xs/sm): show hamburger IconButton (MenuIcon, aria-label="Menü") that opens MobileNavDrawer. Hide the "Termékek" text Button.
- Desktop (md+): show "Termékek" Button, hide hamburger
- Cart IconButton: instead of `navigate("/kosar")`, call `setCartDrawerOpen(true)`
- Render `<CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />`
- Render `<MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />`
- Preserve `data-test-id="cartBadge"` on cart IconButton

**`packages/frontend/src/components/layout/AppLayout.tsx`:**
- No changes needed if Header manages its own drawer state

**Reference:** Read `docs/STOREFRONT_UI_PLAN.md` section "Header" for exact component tree.

**Existing components to use:**
- `packages/frontend/src/components/layout/CartDrawer.tsx` (already exists)
- `packages/frontend/src/components/layout/MobileNavDrawer.tsx` (already exists)

---

## Agent 2: Enhanced Storefront Pages (Home, Product List, Footer, 404)

**Branch:** `phase2/storefront-pages`

**Goal:** Upgrade HomePage, ProductListPage, Footer, and NotFoundPage to match the UI plan.

**Pre-written tests to make pass:**
- `packages/frontend/src/pages/HomePage.test.tsx` — brand story, trust signals, featured products, "Összes termék" link
- `packages/frontend/src/pages/ProductListPage.test.tsx` — category filter chips, sort dropdown, product cards

**Files to MODIFY:**

**`packages/frontend/src/pages/HomePage.tsx`:**

Current: has hero + featured products grid. Missing: brand story, trust signals, hero image placeholder, "Összes termék" link, skeleton loading.

Add these sections after the featured products:

1. **Hero enhancement:** Split into 2-col Grid (text 7, image 5). Image placeholder hidden on mobile.
2. **"Összes termék" link:** `<Button variant="text" endIcon={<ArrowForwardIcon />} component={Link} to="/termekek">Összes termék</Button>` after the product grid
3. **Brand story section:** `<Box sx={{ bgcolor: "background.paper", py: 6 }}>` with 2-col Grid: image placeholder + text "A történetünk"
4. **Trust signals:** 3 Paper cards in Grid (xs:12 sm:4) with:
   - SpaOutlined + "100% természetes" + "Csak természetes összetevőket használunk"
   - HandshakeOutlined + "Kézzel készített" + "Minden termék kézzel, kis tételben készül"
   - FlagOutlined + "Magyar termék" + "Büszkén készítjük Magyarországon"
5. **Replace LoadingSpinner** with 4 SkeletonProductCard components during loading

Icons to import: `SpaOutlined`, `HandshakeOutlined`, `FlagOutlined`, `ArrowForward` from `@mui/icons-material`

**`packages/frontend/src/pages/ProductListPage.tsx`:**

Current: basic Grid of ProductCards. Missing: CategoryFilter, sort, skeleton loading, empty state.

1. Add `useCategories()` hook import and call
2. Add state: `selectedCategory` (string | null), `sortBy` (string)
3. Add filter/sort bar: `<CategoryFilter>` + `<TextField select label="Rendezés">` with options: "Név (A-Z)" value="name-asc", "Ár (növekvő)" value="price-asc", "Ár (csökkenő)" value="price-desc"
4. Filter products client-side by selectedCategory
5. Sort products client-side by sortBy
6. Replace LoadingSpinner with 8 SkeletonProductCards
7. Show EmptyState with SearchOffIcon when no products match filter

**`packages/frontend/src/components/layout/Footer.tsx`:**

Current: simple centered text. Rewrite to 3-column Grid layout:
- Col 1 (xs:12 sm:4): "Herbal Shop" h6 + tagline body2
- Col 2 (xs:12 sm:4): "Információk" subtitle2 + links: Termékek, Szállítás és fizetés, ÁSZF, Adatvédelem
- Col 3 (xs:12 sm:4): "Kapcsolat" subtitle2 + email + phone
- Divider + copyright

**`packages/frontend/src/pages/NotFoundPage.tsx`:**

Add `<SearchOffIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />` above the 404 heading.

---

## Agent 3: Product Detail Page Enhancement

**Branch:** `phase2/product-detail`

**Goal:** Add breadcrumbs, stock indicator, add-to-cart snackbar feedback to ProductDetailPage.

**Pre-written tests to make pass:** None specific (tested via e2e). But ensure existing tests still pass.

**Files to MODIFY:**

**`packages/frontend/src/pages/ProductDetailPage.tsx`:**

Current: basic 2-col grid with image placeholder and info. Missing: breadcrumbs, stock chip, snackbar, skeleton loading.

Add:
1. **Breadcrumbs** at top: `<Breadcrumbs sx={{ mb: 3 }}>` with links: "Főoldal" → /, "Termékek" → /termekek, current product name as Typography
2. **Stock indicator Chip** after PriceDisplay:
   - stock > 5: `<Chip icon={<CheckCircleIcon />} label="Készleten" color="success" size="small" variant="outlined" />`
   - stock 1-5: `<Chip icon={<WarningIcon />} label={`Csak ${product.stock} db maradt`} color="warning" size="small" variant="outlined" />`
   - stock 0: `<Chip icon={<CancelIcon />} label="Elfogyott" color="error" size="small" variant="outlined" />`
3. **Disable add-to-cart** when stock=0: add `disabled={product.stock === 0}` and `startIcon={<ShoppingCartIcon />}` to the Kosárba button
4. **Snackbar** on successful add: state `showAdded`, `<Snackbar autoHideDuration={3000}>` with `<Alert severity="success" variant="filled">Termék hozzáadva a kosárhoz!</Alert>`
5. **Skeleton loading state** instead of LoadingSpinner: Grid with Skeleton rectangular (height 400) + Skeleton text lines
6. **Image placeholder** with `<ImageOutlinedIcon>` when no product images

Icons: `CheckCircle`, `Warning`, `Cancel`, `ShoppingCart`, `ImageOutlined` from `@mui/icons-material`

---

## Agent 4: Cart Page Enhancement

**Branch:** `phase2/cart-enhancement`

**Goal:** Add shipping threshold alert, shipping cost calculation, and proper summary Paper to CartPage.

**Pre-written tests to make pass:**
- `packages/frontend/src/pages/CartPage.test.tsx` — shipping alert, summary with subtotal/shipping/total, checkout button

**Files to MODIFY:**

**`packages/frontend/src/pages/CartPage.tsx`:**

Current: line items + basic subtotal. Missing: shipping alert, shipping cost, summary Paper.

Add:
1. **Constants** at top: `const FREE_SHIPPING_THRESHOLD = 15_000;` and `const SHIPPING_COST_HUF = 1_490;`
2. **Compute shipping:** `const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST_HUF;`
3. **Shipping threshold Alert** after heading:
   - subtotal < threshold: `<Alert severity="info">Ingyenes szállítás {formatPriceHuf(FREE_SHIPPING_THRESHOLD)} feletti rendelésnél!</Alert>`
   - subtotal >= threshold: `<Alert severity="success">Ingyenes szállítás!</Alert>`
4. **Summary Paper** replacing the current loose Box:
   ```
   <Paper sx={{ p: 3, mt: 3 }}>
     <Stack spacing={1}>
       Row: "Részösszeg" / PriceDisplay
       Row: "Szállítási költség" / PriceDisplay (or "Ingyenes" in green when 0)
       <Divider />
       Row: "Összesen" (h6) / PriceDisplay of subtotal+shippingCost (h6)
     </Stack>
     <Button fullWidth ...>Tovább a fizetéshez</Button>
   </Paper>
   ```
5. **Responsive line items:** on mobile (xs), stack image+name and quantity+price+delete vertically using `flexDirection: { xs: "column", sm: "row" }`

Import `formatPriceHuf` from `@webshop/shared` for the threshold display. Import `Alert`, `Paper`, `Stack`, `Divider` from MUI.

---

## Agent 5: Checkout Page Rewrite

**Branch:** `phase2/checkout-rewrite`

**Goal:** Complete rewrite of CheckoutPage with full form validation, billing toggle, shipping method selector, and order submission.

**Pre-written tests to make pass:**
- `packages/frontend/src/pages/CheckoutPage.test.tsx` — form sections, billing checkbox, shipping methods, order summary, disabled submit button

**Files to REWRITE:**

**`packages/frontend/src/pages/CheckoutPage.tsx`:**

This is a full rewrite. Read `docs/STOREFRONT_UI_PLAN.md` section "Checkout Page" for the complete component tree.

Key requirements:
1. **Guard:** if cart is empty (`items.length === 0`), redirect to `/kosar` using `useEffect` + `useNavigate`
2. **Form state:** use `useState` for each field group (customer, shipping, billing, shippingMethod, note, sameAsShipping)
3. **Two-column layout:** `<Grid size={{ xs: 12, md: 8 }}>` for form, `<Grid size={{ xs: 12, md: 4 }}>` for summary
4. **Form sections:**
   - "Kapcsolattartási adatok": Név, E-mail, Telefon TextFields
   - "Szállítási cím": Név, Irányítószám (maxLength 4), Város, Utca/házszám
   - "Számlázási cím": Checkbox "Megegyezik a szállítási címmel" (default checked). When unchecked, show billing fields + Adószám field
   - "Szállítási mód": RadioGroup with GLS ("GLS futárszolgálat", "1-3 munkanap") and Foxpost ("Foxpost csomagpont", "1-2 munkanap") in Paper cards with highlighted border
   - "Megjegyzés": multiline TextField
5. **Order summary sidebar:** sticky on md+ (`position: { md: "sticky" }, top: { md: 80 }`). Shows "Rendelés összegzése", item list, subtotal, shipping cost, total, submit button
6. **Validation:** on submit, validate with `createOrderSchema` from `@webshop/shared`. Show errors as TextField helperText.
7. **Submit flow:** call `createOrder` from `../api/orders`, store `{ orderId, accessToken }` in sessionStorage as `"last-order"`, call `clearCart()`, navigate to `/rendeles-visszaigazolas/${orderId}`
8. **Submit button:** `data-test-id="placeOrderButton"`, disabled until form has all required fields filled, shows `<CircularProgress size={24} />` during submission
9. **Shipping cost:** `subtotal >= 15000 ? 0 : 1490`

---

## Agent 6: Order Confirmation Page Enhancement

**Branch:** `phase2/order-confirmation`

**Goal:** Fetch and display real order data on the confirmation page.

**Pre-written tests to make pass:** None specific (tested via e2e). Existing test still passes.

**Files to MODIFY:**

**`packages/frontend/src/pages/OrderConfirmationPage.tsx`:**

Current: static thank-you message. Rewrite to fetch order data.

1. Read `sessionStorage.getItem("last-order")` to get `{ orderId, accessToken }`
2. Call `fetchOrder(orderId, accessToken)` from `../api/orders` via `useQuery`
3. Show `<CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />` centered
4. Show "Köszönjük a rendelését!" heading + subtitle
5. `<Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>` with:
   - "Rendelés részletei" heading
   - Order number + status Chip ("Feldolgozás alatt", color="warning")
   - Items list with name × quantity and line totals
   - Subtotal, shipping, total
   - "Szállítási cím" section with address
6. "Számla letöltése" Button (outlined, disabled — invoice is Phase 3)
7. "Tovább vásárolok" Button linking to /termekek
8. Skeleton loading state while fetching
9. Preserve `data-test-id="orderConfirmation"`

Icons: `CheckCircle`, `Receipt` from `@mui/icons-material`. Import `Chip`, `Divider`, `Paper`, `Skeleton` from MUI.

---

## Agent 7: Admin Login + Layout + Protected Route + Router

**Branch:** `phase2/admin-shell`

**Goal:** Create the admin authentication flow, layout shell with sidebar, route protection, and update the router.

**Pre-written tests to make pass:**
- `packages/frontend/src/pages/admin/AdminLoginPage.test.tsx` — heading, API key input, login button, back link

**Files to CREATE:**

**`packages/frontend/src/pages/admin/AdminLoginPage.tsx`:**
- Full-page centered layout (no AdminLayout), `minHeight: "100vh"`, `bgcolor: "background.default"`
- `<Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>` with:
  - `<LockOutlinedIcon sx={{ fontSize: 48, color: "primary.main" }} />`
  - `<Typography variant="h4">Admin belépés</Typography>`
  - `<TextField label="API kulcs" type="password" required autoFocus />`
  - `<Button variant="contained" fullWidth size="large">Belépés</Button>` — on click, test key by calling `GET /api/admin/products` via `adminFetch`. On 200: store key in `sessionStorage.setItem("admin-api-key", key)`, navigate to `/admin`. On error: show `<Alert severity="error">` with error message.
  - `<Button variant="text" component={Link} to="/">Vissza a webshopba</Button>`

**`packages/frontend/src/components/admin/AdminLayout.tsx`:**
- `<Box sx={{ display: "flex" }}>` wrapping sidebar + main
- Sidebar: `<Drawer variant="permanent" sx={{ width: 240, display: { xs: "none", md: "block" } }}>` on desktop, `<Drawer variant="temporary">` on mobile
- Sidebar content: "Herbal Admin" logo, Divider, nav List with:
  - DashboardIcon "Irányítópult" → /admin
  - InventoryIcon "Termékek" → /admin/termekek
  - ReceiptIcon "Megrendelések" → /admin/megrendelesek
  - Divider
  - StorefrontIcon "Webshop megtekintése" → /
  - "Kijelentkezés" Button (outlined, error color) — clears sessionStorage, navigates to /admin/login
- Selected ListItemButton: `bgcolor: "primary.light"`, `color: "primary.main"`
- TopBar: `<AppBar>` offset by sidebar width on md+, hamburger IconButton on mobile
- Main: `<Box component="main" sx={{ flexGrow: 1, p: 3 }}>` with `<Outlet />`

**`packages/frontend/src/components/admin/AdminProtectedRoute.tsx`:**
- On mount: check `sessionStorage.getItem("admin-api-key")`
- If missing: `<Navigate to="/admin/login" replace />`
- If present: `<Outlet />`

**`packages/frontend/src/router.tsx` — MODIFY:**

Add admin routes to the existing router. The admin route tree:
```tsx
{
  path: "admin",
  children: [
    { path: "login", element: <AdminLoginPage /> },
    {
      element: <AdminProtectedRoute />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            { index: true, element: <AdminDashboardPage /> },
            { path: "termekek", element: <AdminProductListPage /> },
            { path: "termekek/uj", element: <AdminProductFormPage /> },
            { path: "termekek/:id/szerkesztes", element: <AdminProductFormPage /> },
            { path: "megrendelesek", element: <AdminOrderListPage /> },
            { path: "megrendelesek/:id", element: <AdminOrderDetailPage /> },
          ],
        },
      ],
    },
  ],
}
```

For now, create placeholder components for pages that don't exist yet (AdminProductListPage, AdminProductFormPage, AdminOrderListPage, AdminOrderDetailPage) — just a `<Typography>` with the page name. These will be implemented in Wave 3.

---

## Agent 8: Admin Dashboard Page

**Branch:** `phase2/admin-dashboard`

**Goal:** Create the admin dashboard with stat cards and recent orders table.

**Pre-written tests to make pass:**
- `packages/frontend/src/pages/admin/AdminDashboardPage.test.tsx` — heading, stat cards, quick action links

**Files to CREATE:**

**`packages/frontend/src/pages/admin/AdminDashboardPage.tsx`:**
- `<Typography variant="h4" component="h1" gutterBottom>Irányítópult</Typography>`
- 4 stat cards in `<Grid container spacing={3} sx={{ mb: 4 }}>`, each `<Grid size={{ xs: 12, sm: 6, md: 3 }}>`:
  1. "Összes megrendelés" / total count / ReceiptIcon
  2. "Függőben lévő" / pending count / HourglassEmptyIcon
  3. "Mai bevétel" / formatPriceHuf(todayRevenue) / AttachMoneyIcon
  4. "Aktív termékek" / active count / InventoryIcon
- Use `fetchAdminStats()` from `../../api/admin` wrapped in a `useQuery` with key `["admin", "stats"]`
- Recent orders table: `<Table>` with columns "Rendelési szám", "Vevő", "Dátum", "Állapot", "Összeg". Clickable rows → `/admin/megrendelesek/:id`
- Use `useAdminOrders()` hook for the table data (first page)
- Use `OrderStatusChip` for status display (create if needed)
- Quick action links: "Termékek kezelése" → /admin/termekek, "Összes megrendelés" → /admin/megrendelesek
- Skeleton loading state for cards and table

**`packages/frontend/src/components/admin/StatCard.tsx`:**
- Props: `icon: ReactNode`, `label: string`, `value: string | number`, `iconBgColor?: string`
- `<Paper sx={{ p: 3 }}>` with icon in colored Box + label (body2 text.secondary) + value (h4)

**`packages/frontend/src/components/admin/OrderStatusChip.tsx`:**
- Props: `status: OrderStatus`
- Uses `ORDER_STATUS_CONFIG` from `@webshop/shared` to get label and color
- Returns `<Chip label={config.label} color={config.color} size="small" />`

---

## Fleet Summary

| Agent | Branch | Tests to Pass | Creates | Modifies |
|---|---|---|---|---|
| 1 | `phase2/header-enhancement` | e2e only | — | Header.tsx |
| 2 | `phase2/storefront-pages` | HomePage.test, ProductListPage.test | — | HomePage, ProductListPage, Footer, NotFoundPage |
| 3 | `phase2/product-detail` | e2e only | — | ProductDetailPage.tsx |
| 4 | `phase2/cart-enhancement` | CartPage.test | — | CartPage.tsx |
| 5 | `phase2/checkout-rewrite` | CheckoutPage.test | — | CheckoutPage.tsx (full rewrite) |
| 6 | `phase2/order-confirmation` | e2e only | — | OrderConfirmationPage.tsx |
| 7 | `phase2/admin-shell` | AdminLoginPage.test | AdminLoginPage, AdminLayout, AdminProtectedRoute, placeholders | router.tsx |
| 8 | `phase2/admin-dashboard` | AdminDashboardPage.test | AdminDashboardPage, StatCard, OrderStatusChip | — |

All 8 agents can run in parallel. Each must pass `pnpm typecheck && pnpm lint && pnpm --filter frontend test`.

**E2e tests** (`e2e/storefront.spec.ts`, `e2e/admin.spec.ts`) will be run after all agents complete and branches are merged. They require the full app running locally.
