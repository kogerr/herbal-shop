# Phase 2 Implementation Plan — Core Features

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Workstream Overview](#workstream-overview)
3. [Wave 1: No Dependencies](#wave-1-no-dependencies-6-tasks-all-parallel)
4. [Wave 2: Depends on Wave 1](#wave-2-depends-on-wave-1-7-tasks-all-parallel)
5. [Wave 3: Depends on Wave 2](#wave-3-depends-on-wave-2-4-tasks-all-parallel)
6. [Wave 4: Integration Testing](#wave-4-integration-testing)
7. [Agent Assignment Summary](#agent-assignment-summary)
8. [Dependency Graph](#dependency-graph)
9. [File Summary](#file-creationmodification-summary)

---

## Current State Assessment

Phase 1 (Project Skeleton) is complete. The following exists:

**Backend:**
- Fastify server with PostgreSQL + Drizzle ORM
- Full DB schema: categories, products, orders, orderItems, payments, invoices with relations
- Product routes: `GET /api/products` (list with category filter + pagination), `GET /api/products/:slug` (detail with category)
- Admin routes: `GET/POST/PUT/DELETE /api/admin/products` (protected by API key)
- Order routes: stub only (`POST /api/orders` and `GET /api/orders/:id` return 501)
- Middleware: `adminAuth` (Bearer token), `createValidator` (Zod)
- Seed data: 3 categories, 6 products

**Frontend:**
- React + Vite + MUI + React Router v7 + TanStack Query + Zustand
- Layout: `AppLayout`, `Header` (no mobile nav, no cart drawer), `Footer` (minimal), `PageContainer`
- Pages: `HomePage` (hero + featured products, no brand story/trust signals), `ProductListPage` (no filters/sort), `ProductDetailPage` (no breadcrumbs/stock/snackbar), `CartPage` (basic, no shipping cost), `CheckoutPage` (stub form, no validation), `OrderConfirmationPage` (static, no order data), `NotFoundPage` (no icon)
- Components: `ProductCard`, `PriceDisplay`, `QuantitySelector`, `EmptyState`, `LoadingSpinner`
- Stores: `cartStore` (fully functional with persist)
- API: `client.ts` (GET-only `apiFetch`), `products.ts` (fetchProducts, fetchProduct)
- Hooks: `useProducts`, `useProduct`
- No admin pages exist yet

**Shared:**
- Types: `Product`, `ProductWithCategory`, `Category`, `CartItem`, `OrderStatus`, `CreateOrderInput`, `ShippingInfo`, `BillingInfo`, `OrderSummary`
- Schemas: `createOrderSchema`, `shippingInfoSchema`, `billingInfoSchema`
- Utils: `formatPriceHuf`

---

## Workstream Overview

Phase 2 ("Core Features") delivers:
1. **Storefront enhancement** — full product listing with filters/sort, enriched detail page, cart with shipping cost, checkout form with validation
2. **Admin dashboard UI** — login, layout, dashboard, product CRUD, order list, order detail
3. **Backend admin orders API** — order listing, order detail, ship order
4. **Shared types/schemas** — admin types, product form schema

---

## Wave 1: No Dependencies (6 tasks, all parallel)

### Task S1: Shared — Admin Types and Product Form Schema

**Agent:** Shared Agent

**What:** Add admin-specific types and a Zod schema for product create/update validation.

**Files to create or modify:**
- `packages/shared/src/types/admin.ts` — **CREATE**: `AdminOrderSummary` (extends OrderSummary with customerName, customerEmail, customerPhone), `AdminOrderDetail` (full order with items, addresses, timestamps), `AdminOrderItem`, `AdminStats`, `OrderStatusConfig`, `ORDER_STATUS_CONFIG` constant
- `packages/shared/src/schemas/product.schema.ts` — **CREATE**: `createProductSchema` and `updateProductSchema` (Zod) for admin product form validation
- `packages/shared/src/types/order.ts` — **MODIFY**: Add `OrderDetail` type with full order data (items, addresses, totals) for use by both storefront confirmation and admin detail
- `packages/shared/src/index.ts` — **MODIFY**: Export new modules

**Depends on:** Nothing

**Acceptance criteria:**
- `AdminOrderSummary` includes: id, orderNumber, customerName, customerEmail, status, totalHuf, createdAt
- `AdminOrderDetail` includes all order fields + items array (AdminOrderItem[])
- `AdminOrderItem` includes: id, productName, productPriceHuf, quantity, lineTotalHuf
- `AdminStats` includes: totalOrders, pendingOrders, todayRevenue, activeProducts
- `ORDER_STATUS_CONFIG` maps each OrderStatus to `{ label: string; color: string }` with Hungarian labels (Függőben, Fizetve, Kiszállítva, Kézbesítve, Lemondva)
- `createProductSchema` validates: name (min 1, max 200), slug (regex `/^[a-z0-9-]+$/`), description (min 1), ingredients (min 1), priceHuf (> 0), stock (>= 0), weight (> 0), categoryId (uuid), images (string[]), isActive (boolean)
- `updateProductSchema` is a partial version of createProductSchema (all fields optional)
- All types exported from index.ts
- `pnpm --filter @webshop/shared typecheck` passes

**Reference:** ADMIN_UI_PLAN.md > "Shared Types & Constants"

---

### Task B1: Backend — Admin Orders API

**Agent:** Backend Agent 1

**What:** Implement admin order endpoints: list (with status filter + pagination), single order detail, and ship order action.

**Files to create or modify:**
- `packages/backend/src/routes/admin.ts` — **MODIFY**: Add order endpoints alongside existing product endpoints
- `packages/backend/src/routes/categories.ts` — **CREATE**: Public `GET /api/categories` endpoint returning all categories sorted by sortOrder (needed by frontend filters and admin product form)

**Depends on:** Nothing

**Acceptance criteria:**
- `GET /api/admin/orders` returns `{ orders: [], total: number, page: number }` with fields: id, orderNumber, customerName, customerEmail, customerPhone, status, totalHuf, createdAt
- `GET /api/admin/orders?status=paid` filters by status; omitting status returns all
- `GET /api/admin/orders?page=2` paginates (10 per page default)
- `GET /api/admin/orders/:id` returns full order detail with orderItems joined (productName, productPriceHuf, quantity, lineTotalHuf), all address fields, timestamps, note
- `PATCH /api/admin/orders/:id/ship` sets status to "shipped", sets updatedAt, returns updated order. Returns 400 if current status is not "paid"
- `GET /api/categories` returns categories array sorted by sortOrder (public, no auth)
- All admin endpoints require Bearer token auth
- Error responses use Hungarian messages

**Reference:** BACKEND_PLAN.md > "API Endpoints > Admin", ADMIN_UI_PLAN.md > "Admin Order Detail"

---

### Task B2: Backend — Create Order Endpoint

**Agent:** Backend Agent 2

**What:** Implement `POST /api/orders` to create an order from cart data. For Phase 2, this creates the order in the database (no payment integration yet — that is Phase 3).

**Files to create or modify:**
- `packages/backend/src/routes/orders.ts` — **MODIFY**: Implement `POST /api/orders` and `GET /api/orders/:id`
- `packages/backend/src/utils/generateOrderNumber.ts` — **CREATE**: Generates order numbers like "HO-20260327-001"

**Depends on:** Nothing

**Acceptance criteria:**
- `POST /api/orders` accepts body matching `createOrderSchema`: customer info, shipping/billing addresses, items [{productId, quantity}], optional note
- Validates all products exist, are active, and have sufficient stock
- Creates Order + OrderItems in a DB transaction with snapshotted product names and prices
- Decrements stock for each product
- Calculates subtotalHuf (sum of line totals), shippingCostHuf (1490 if subtotal < 15000, else 0), totalHuf
- Generates unique orderNumber (format: "HO-YYYYMMDD-NNN")
- Generates random accessToken (crypto.randomUUID)
- Sets initial status to "pending"
- Returns `{ orderId: string, orderNumber: string, accessToken: string }`
- `GET /api/orders/:id?token=xxx` returns order details (including items) when token matches; 403 if token wrong; 404 if order not found
- Returns 400 with validation errors for invalid body
- Returns 400 if any product is out of stock or inactive
- Uses `createValidator` middleware with `createOrderSchema`

**Reference:** BACKEND_PLAN.md > "API Endpoints > Orders", "Order & Payment Flow" steps 1-6 (minus Barion)

---

### Task F1: Frontend — New Shared Components

**Agent:** Frontend Agent 1

**What:** Build the new reusable components needed by multiple pages.

**Files to create or modify:**
- `packages/frontend/src/components/layout/CartDrawer.tsx` — **CREATE**
- `packages/frontend/src/components/layout/MobileNavDrawer.tsx` — **CREATE**
- `packages/frontend/src/components/product/SkeletonProductCard.tsx` — **CREATE**
- `packages/frontend/src/components/product/CategoryFilter.tsx` — **CREATE**

**Depends on:** Nothing

**Acceptance criteria:**
- CartDrawer: right Drawer, width {xs: "100vw", sm: 400}, shows items with QuantitySelector and delete, empty state when empty, subtotal, "Kosár megtekintése" and "Fizetés" buttons, closes on navigation
- MobileNavDrawer: left Drawer, "Herbal Shop" branding, links to /termekek and /kosar, contact email, closes on navigation
- SkeletonProductCard: matches ProductCard dimensions with Skeleton components (rectangular 200px + text lines + button area)
- CategoryFilter: accepts categories[], selectedCategory, onCategoryChange. Renders "Mind" chip + category chips. Selected=filled, others=outlined, color=primary

**Reference:** STOREFRONT_UI_PLAN.md > "CartDrawer", "Header > Mobile Nav Drawer", "Product List Page"

---

### Task F2: Frontend — API Client Extensions and Hooks

**Agent:** Frontend Agent 2

**What:** Build admin API client layer, order API, categories API, and auth utilities.

**Files to create or modify:**
- `packages/frontend/src/api/client.ts` — **MODIFY**: Add POST/PUT/PATCH/DELETE support
- `packages/frontend/src/api/admin.ts` — **CREATE**: `adminFetch` wrapper with auth header, admin API functions
- `packages/frontend/src/api/orders.ts` — **CREATE**: `createOrder`, `fetchOrder`
- `packages/frontend/src/api/categories.ts` — **CREATE**: `fetchCategories`
- `packages/frontend/src/hooks/useCategories.ts` — **CREATE**
- `packages/frontend/src/hooks/useAdminProducts.ts` — **CREATE**
- `packages/frontend/src/hooks/useAdminOrders.ts` — **CREATE**

**Depends on:** Nothing

**Acceptance criteria:**
- `client.ts` supports all HTTP methods via options parameter
- `adminFetch` reads API key from sessionStorage, sets `Authorization: Bearer {key}`, redirects to /admin/login on 401
- `createOrder` posts to `/api/orders` and returns `{ orderId, orderNumber, accessToken }`
- `fetchOrder(id, token)` calls `GET /api/orders/:id?token=xxx`
- All admin hooks use query keys `["admin", ...]`, staleTime 30s
- `useCategories` uses query key `["categories"]`, staleTime 5min

**Reference:** ADMIN_UI_PLAN.md > "Auth Pattern > API Call Helper"

---

### Task F3: Frontend — Utility Functions

**Agent:** Frontend Agent 3

**What:** Hungarian date formatter and slug generator.

**Files to create or modify:**
- `packages/frontend/src/utils/formatDateHu.ts` — **CREATE**
- `packages/frontend/src/utils/generateSlug.ts` — **CREATE**

**Depends on:** Nothing

**Acceptance criteria:**
- `formatDateHu("2026-03-27T14:30:00Z")` → "2026. 03. 27. 14:30"
- `generateSlug("Levendulás nyugtató kenőcs")` → "levendulas-nyugtato-kenocs"
- Handles all Hungarian accented characters (á, é, í, ó, ö, ő, ú, ü, ű)

**Reference:** ADMIN_UI_PLAN.md > "Date Formatter", "Admin Product Form > Slug Auto-Generation"

---

## Wave 2: Depends on Wave 1 (7 tasks, all parallel)

### Task F4: Frontend — Header Enhancement

**Agent:** Frontend Agent 1

**Depends on:** F1 (CartDrawer, MobileNavDrawer)

**What:** Update Header and AppLayout to integrate CartDrawer and MobileNavDrawer.

**Files to modify:**
- `packages/frontend/src/components/layout/Header.tsx`
- `packages/frontend/src/components/layout/AppLayout.tsx`

**Acceptance criteria:**
- Mobile (xs/sm): hamburger opens MobileNavDrawer, "Termékek" button hidden
- Desktop (md+): no hamburger, "Termékek" button visible
- Cart icon opens CartDrawer on all breakpoints
- Both drawers close on navigation
- `data-test-id="cartBadge"` preserved

**Reference:** STOREFRONT_UI_PLAN.md > "Header"

---

### Task F5: Frontend — Enhanced Storefront Pages

**Agent:** Frontend Agent 2

**Depends on:** F1 (SkeletonProductCard, CategoryFilter), F2 (useCategories), F3 (formatDateHu)

**What:** Upgrade all storefront pages to match STOREFRONT_UI_PLAN.md.

**Files to modify:**
- `packages/frontend/src/pages/HomePage.tsx` — hero image, brand story, trust signals, skeleton loading
- `packages/frontend/src/pages/ProductListPage.tsx` — CategoryFilter, sort dropdown, skeletons, empty state
- `packages/frontend/src/pages/ProductDetailPage.tsx` — Breadcrumbs, stock Chip, add-to-cart Snackbar, skeleton loading
- `packages/frontend/src/pages/CartPage.tsx` — shipping threshold Alert, shipping cost, summary Paper
- `packages/frontend/src/pages/NotFoundPage.tsx` — SearchOffIcon
- `packages/frontend/src/components/layout/Footer.tsx` — 3-column layout

**Acceptance criteria:**
- HomePage: 2-column hero, brand story, trust signals (SpaOutlined, HandshakeOutlined, FlagOutlined), skeleton loading
- ProductListPage: category chips, sort (name/price asc/desc), skeleton cards, "Nem található termék" empty state
- ProductDetailPage: breadcrumbs, stock chip (green >5, warning 1-5, red 0), Snackbar "Termék hozzáadva a kosárhoz!", disabled add button when stock=0
- CartPage: shipping Alert (info <15000, success >=15000), 1490 Ft or free shipping, summary Paper
- NotFoundPage: SearchOffIcon
- Footer: 3-column with brand/links/contact

**Reference:** STOREFRONT_UI_PLAN.md > all page sections

---

### Task F6: Frontend — Checkout Page Rewrite

**Agent:** Frontend Agent 3

**Depends on:** F2 (api/orders.ts, createOrder)

**What:** Complete rewrite of CheckoutPage with full form, validation, and order submission.

**Files to modify:**
- `packages/frontend/src/pages/CheckoutPage.tsx` — **REWRITE**

**Acceptance criteria:**
- Redirects to /kosar if cart empty
- Sections: customer info, shipping address, billing address (with "Megegyezik" checkbox), shipping method (GLS/Foxpost RadioGroup in Papers), note
- Order summary sidebar (sticky on md+, below form on mobile)
- Zod validation with Hungarian error messages
- Submit: calls createOrder, stores accessToken in sessionStorage, clears cart, navigates to confirmation
- `data-test-id="placeOrderButton"` preserved

**Reference:** STOREFRONT_UI_PLAN.md > "Checkout Page"

---

### Task F7: Frontend — Order Confirmation Enhancement

**Agent:** Frontend Agent 3

**Depends on:** F2 (api/orders.ts, fetchOrder)

**What:** Fetch and display real order data on confirmation page.

**Files to modify:**
- `packages/frontend/src/pages/OrderConfirmationPage.tsx`

**Acceptance criteria:**
- Fetches order via token from sessionStorage
- Shows CheckCircleIcon, order number, status Chip, items, totals, shipping address
- "Számla letöltése" button (disabled for now)
- "Tovább vásárolok" CTA
- Loading skeleton

**Reference:** STOREFRONT_UI_PLAN.md > "Order Confirmation Page"

---

### Task F8: Frontend — Admin Login, Layout, Protected Route

**Agent:** Frontend Agent 4

**Depends on:** F2 (admin API client)

**What:** Admin auth flow, layout shell, route protection, and router update.

**Files to create or modify:**
- `packages/frontend/src/pages/admin/AdminLoginPage.tsx` — **CREATE**
- `packages/frontend/src/components/admin/AdminLayout.tsx` — **CREATE**
- `packages/frontend/src/components/admin/AdminProtectedRoute.tsx` — **CREATE**
- `packages/frontend/src/router.tsx` — **MODIFY**: Add admin route tree

**Acceptance criteria:**
- Login: centered Paper, password field, tests key against `GET /api/admin/products`, stores in sessionStorage, navigates to /admin
- Layout: 240px permanent sidebar (md+), temporary Drawer (xs/sm), nav items with selected highlighting, logout button
- Protected route: checks sessionStorage, redirects to /admin/login if missing
- Router: /admin/login standalone, /admin/* protected with AdminLayout

**Reference:** ADMIN_UI_PLAN.md > "Admin Login", "AdminLayout", "Auth Pattern"

---

### Task F9: Frontend — Admin Dashboard Page

**Agent:** Frontend Agent 5

**Depends on:** F2 (admin API hooks), F3 (formatDateHu)

**What:** Dashboard with stat cards and recent orders table.

**Files to create:**
- `packages/frontend/src/pages/admin/AdminDashboardPage.tsx`
- `packages/frontend/src/components/admin/StatCard.tsx`
- `packages/frontend/src/components/admin/OrderStatusChip.tsx`

**Acceptance criteria:**
- 4 stat cards (xs:12 sm:6 md:3): Összes megrendelés, Függőben lévő, Mai bevétel, Aktív termékek
- Recent orders table (last 10): clickable rows → /admin/megrendelesek/:id
- Quick actions: "Termékek kezelése", "Összes megrendelés"
- Skeleton loading, empty state

**Reference:** ADMIN_UI_PLAN.md > "Admin Dashboard"

---

## Wave 3: Depends on Wave 2 (4 tasks, all parallel)

### Task F10: Frontend — Admin Product List Page

**Agent:** Frontend Agent 1

**Depends on:** F8 (AdminLayout + routes), F2 (admin API hooks)

**Files to create:**
- `packages/frontend/src/pages/admin/AdminProductListPage.tsx`

**Acceptance criteria:**
- "Új termék" button → /admin/termekek/uj
- Table: thumbnail, name, category, price, inline-editable stock (color coded), active/inactive Chip, edit + visibility toggle actions
- Stock saves on blur via PUT
- Visibility toggle calls PUT with { isActive: !current }
- Skeleton loading, empty state

**Reference:** ADMIN_UI_PLAN.md > "Admin Product List"

---

### Task F11: Frontend — Admin Product Form Page

**Agent:** Frontend Agent 2

**Depends on:** F8 (AdminLayout + routes), F2 (admin API hooks, useCategories)

**Files to create:**
- `packages/frontend/src/pages/admin/AdminProductFormPage.tsx`

**Acceptance criteria:**
- Detects create vs edit from URL params
- Fields: name, slug (auto-generated), description, ingredients, price (Ft adornment), stock, weight (g adornment), category select, image URL, active Switch
- Slug auto-generates from name until manually edited
- Validation using shared createProductSchema
- Success Snackbar "Termék sikeresen mentve!", navigates to list

**Reference:** ADMIN_UI_PLAN.md > "Admin Product Form"

---

### Task F12: Frontend — Admin Order List Page

**Agent:** Frontend Agent 4

**Depends on:** F8 (AdminLayout + routes), F2 (admin API hooks), F9 (OrderStatusChip)

**Files to create:**
- `packages/frontend/src/pages/admin/AdminOrderListPage.tsx`

**Acceptance criteria:**
- Status filter chips (Mind + 5 statuses), active=filled, inactive=outlined
- Table: order number, customer, email, date, status Chip, total
- Clickable rows → /admin/megrendelesek/:id
- TablePagination with Hungarian labels
- Skeleton loading, empty states

**Reference:** ADMIN_UI_PLAN.md > "Admin Order List"

---

### Task F13: Frontend — Admin Order Detail Page

**Agent:** Frontend Agent 5

**Depends on:** F8 (AdminLayout + routes), F2 (admin API hooks), F9 (OrderStatusChip)

**Files to create:**
- `packages/frontend/src/pages/admin/AdminOrderDetailPage.tsx`

**Acceptance criteria:**
- Header: back button, "Rendelés #{orderNumber}", status Chip, action buttons
- "Szállítás indítása" visible when status=paid, confirmation Dialog
- Two-column: items table (left) + info cards (right: customer, shipping, billing, status)
- Ship flow: PATCH, success Snackbar, refetch
- "Számla letöltése" button (disabled until Phase 3)

**Reference:** ADMIN_UI_PLAN.md > "Admin Order Detail"

---

## Wave 4: Integration Testing

### Task T1: End-to-End Smoke Test

**Depends on:** All previous tasks

**Acceptance criteria:**
- Storefront flow: browse → filter → detail → add to cart → cart → checkout → confirmation
- Admin flow: login → dashboard → products CRUD → orders → ship order
- Mobile responsive on 375px viewport
- No console errors
- `pnpm typecheck`, `pnpm lint`, `pnpm test` all pass

---

## Agent Assignment Summary

| Agent | Tasks | Focus Area |
|---|---|---|
| **Shared Agent** | S1 | Types, Zod schemas in packages/shared |
| **Backend Agent 1** | B1 | Admin orders API + categories endpoint |
| **Backend Agent 2** | B2 | Order creation endpoint |
| **Frontend Agent 1** | F1, F4, F10 | Shared components, header, admin product list |
| **Frontend Agent 2** | F2, F5, F11 | API client, storefront pages, admin product form |
| **Frontend Agent 3** | F3, F6, F7 | Utils, checkout rewrite, order confirmation |
| **Frontend Agent 4** | F8, F12 | Admin auth/layout/routes, admin order list |
| **Frontend Agent 5** | F9, F13 | Admin dashboard, admin order detail |
| **QA Agent** | T1 | End-to-end verification |

---

## Dependency Graph

```
Wave 1 (parallel):  S1  B1  B2  F1  F2  F3
                     │   │   │   │   │   │
Wave 2 (parallel):   │   │   │  F4  F5  F6  F7  F8  F9
                     │   │   │       │              │   │
Wave 3 (parallel):   │   │   │      F10 F11       F12 F13
                     │   │   │       │   │          │   │
Wave 4:              └───┴───┴───────┴───┴──────────┴───┴──→ T1
```

---

## File Creation/Modification Summary

### New Files (23)

**Shared (2):**
- `packages/shared/src/types/admin.ts`
- `packages/shared/src/schemas/product.schema.ts`

**Backend (2):**
- `packages/backend/src/routes/categories.ts`
- `packages/backend/src/utils/generateOrderNumber.ts`

**Frontend (19):**
- `packages/frontend/src/components/layout/CartDrawer.tsx`
- `packages/frontend/src/components/layout/MobileNavDrawer.tsx`
- `packages/frontend/src/components/product/SkeletonProductCard.tsx`
- `packages/frontend/src/components/product/CategoryFilter.tsx`
- `packages/frontend/src/components/admin/AdminLayout.tsx`
- `packages/frontend/src/components/admin/AdminProtectedRoute.tsx`
- `packages/frontend/src/components/admin/StatCard.tsx`
- `packages/frontend/src/components/admin/OrderStatusChip.tsx`
- `packages/frontend/src/pages/admin/AdminLoginPage.tsx`
- `packages/frontend/src/pages/admin/AdminDashboardPage.tsx`
- `packages/frontend/src/pages/admin/AdminProductListPage.tsx`
- `packages/frontend/src/pages/admin/AdminProductFormPage.tsx`
- `packages/frontend/src/pages/admin/AdminOrderListPage.tsx`
- `packages/frontend/src/pages/admin/AdminOrderDetailPage.tsx`
- `packages/frontend/src/api/admin.ts`
- `packages/frontend/src/api/orders.ts`
- `packages/frontend/src/api/categories.ts`
- `packages/frontend/src/hooks/useCategories.ts`
- `packages/frontend/src/hooks/useAdminProducts.ts`
- `packages/frontend/src/hooks/useAdminOrders.ts`
- `packages/frontend/src/utils/formatDateHu.ts`
- `packages/frontend/src/utils/generateSlug.ts`

### Modified Files (16)

- `packages/shared/src/types/order.ts`
- `packages/shared/src/index.ts`
- `packages/backend/src/routes/admin.ts`
- `packages/backend/src/routes/orders.ts`
- `packages/backend/src/index.ts` (register categories route)
- `packages/frontend/src/api/client.ts`
- `packages/frontend/src/router.tsx`
- `packages/frontend/src/components/layout/Header.tsx`
- `packages/frontend/src/components/layout/AppLayout.tsx`
- `packages/frontend/src/components/layout/Footer.tsx`
- `packages/frontend/src/pages/HomePage.tsx`
- `packages/frontend/src/pages/ProductListPage.tsx`
- `packages/frontend/src/pages/ProductDetailPage.tsx`
- `packages/frontend/src/pages/CartPage.tsx`
- `packages/frontend/src/pages/CheckoutPage.tsx`
- `packages/frontend/src/pages/OrderConfirmationPage.tsx`
- `packages/frontend/src/pages/NotFoundPage.tsx`
