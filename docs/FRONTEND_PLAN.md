# Frontend Plan — Herbal Ointment Webshop

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite (SPA) |
| UI Library | MUI v7 (free tier) |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| Client State | Zustand + persist middleware |
| Styling | MUI theme + `sx` prop |
| Forms | Native controlled inputs (add react-hook-form if painful) |
| SEO | react-helmet-async |
| i18n | Not needed — Hungarian only, hardcode strings |
| Auth | None for customers (guest checkout) |

---

## Theming

### Color Palette

| Role | Hex | Usage |
|---|---|---|
| Primary | `#4A7C59` | Buttons, links — muted sage green |
| Primary Dark | `#345740` | Hover states, active elements |
| Primary Light | `#E8F0EA` | Backgrounds, chip fills, subtle highlights |
| Secondary | `#C8A96E` | CTAs, badges ("Új", "Népszerű") — warm gold |
| Background Default | `#FAFAF7` | Page background — warm off-white |
| Background Paper | `#FFFFFF` | Cards, dialogs, drawers |
| Text Primary | `#2D2D2D` | Body text — soft black |
| Text Secondary | `#6B6B6B` | Captions, helper text |
| Error | `#C62828` | Form validation, stock warnings |
| Success | `#2E7D32` | Order confirmation, in-stock |

### Typography

- **Headings**: `Lora` (Google Font via `@fontsource/lora`) — serif, organic/apothecary feel. Weights 500, 700.
- **Body**: `Inter` (via `@fontsource/inter`) — clean, legible. Weights 400, 600.
- Two fonts only. Load via npm packages (no external Google Fonts request).

### Spacing & Border Radius

- MUI default 8px spacing unit — do not customize
- Cards/dialogs: `borderRadius: 12px`
- Buttons/inputs: `borderRadius: 8px`

### Component Overrides

- **MuiButton**: `textTransform: 'none'`, `fontWeight: 600`, `disableElevation: true`
- **MuiCard**: `borderRadius: 12`, subtle shadow `0 1px 4px rgba(0,0,0,0.08)`
- **MuiTextField**: `variant: 'outlined'`, `borderRadius: 8`
- **MuiAppBar**: white background, `elevation: 1` — clean, not colored

---

## Pages

### Home (`/`)
- Hero banner: full-width image with overlaid heading + CTA
- Featured products: horizontal row of 3-4 ProductCards
- Brand story: 2-3 sentences + image (two-column desktop, stacked mobile)
- Trust signals: "100% természetes", "Kézzel készített", "Magyar termék"

### Product List (`/termekek`)
- Category chips at top (single-select)
- Sort dropdown: price asc/desc, name A-Z
- Responsive grid: 4 col desktop, 3 tablet, 2 phone, 1 small phone
- Empty state if no products match filter

### Product Detail (`/termekek/:slug`)
- Large product image (single for MVP)
- Name, price, description, ingredients list, usage instructions
- Quantity selector (+/-) and "Kosárba" button
- Back breadcrumb

### Cart (`/kosar`)
- Line items with thumbnail, name, price, quantity editor, line total, remove button
- Shipping cost display ("Ingyenes szállítás 15 000 Ft felett!")
- Subtotal + shipping + total
- "Tovább a fizetéshez" CTA
- Empty cart state with link to products

### Checkout (`/penztar`)
- Shipping form: name, email, phone, address (Hungarian format)
- Shipping method: radio group (GLS / Foxpost)
- Order summary sidebar (compact cart repeat)
- "Megrendelés elküldése" button (disabled until valid)

### Order Confirmation (`/rendeles-visszaigazolas/:id`)
- "Köszönjük a rendelését!"
- Order number, items summary, shipping address, total
- Invoice download link
- "Tovább vásárlok" link

### 404 (`*`)
- Centered icon, "Az oldal nem található", link home

### Admin — Login (`/admin/login`)
- Simple API key login form (stored in sessionStorage)
- Redirects to `/admin` on success

### Admin — Dashboard (`/admin`)
- Overview: recent orders count, pending/shipped stats
- Quick links to products and orders management

### Admin — Products (`/admin/termekek`)
- Table of all products (active + inactive) with name, price, stock, status
- Add new / edit / deactivate buttons
- Inline stock editing

### Admin — Product Form (`/admin/termekek/uj`, `/admin/termekek/:id/szerkesztes`)
- Form: name, slug, description, ingredients, price, stock, weight, category, images, active toggle
- Validation using shared Zod schemas

### Admin — Orders (`/admin/megrendelesek`)
- Table of orders with order number, customer name, date, status, total
- Filter by status (pending, paid, shipped, delivered, cancelled)
- Click to view order detail

### Admin — Order Detail (`/admin/megrendelesek/:id`)
- Full order info: customer data, shipping address, line items, totals
- Status badge + "Mark as shipped" action button
- Invoice download link

---

## Components

### Layout
- `AppLayout` — wraps all routes (Header + Outlet + Footer)
- `Header` — logo, nav links, cart icon with Badge
- `Footer` — contact, info links, copyright
- `MobileNav` — hamburger Drawer (xs/sm only)

### Product
- `ProductCard` — image, name, price, quick add button. Click navigates to detail.
- `PriceDisplay` — `Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 })`
- `CategoryFilter` — row of Chips
- `QuantitySelector` — minus IconButton, number, plus IconButton

### Cart
- `CartDrawer` — right Drawer, triggered by header cart icon. Shows items + "Kosár" + "Fizetés" buttons.
- `CartLineItem` — thumbnail, name, QuantitySelector, PriceDisplay, delete IconButton
- `CartSummary` — subtotal, shipping, total

### Checkout
- `CheckoutForm` — controlled MUI TextFields
- `ShippingMethodSelector` — RadioGroup
- `OrderSummaryCompact` — condensed cart for sidebar

### Admin
- `AdminLayout` — sidebar nav (Drawer) + header with logout. Wraps admin routes.
- `AdminProductTable` — DataGrid/Table of products with inline actions
- `AdminProductForm` — create/edit product form with all fields
- `AdminOrderTable` — DataGrid/Table of orders with status filters
- `AdminOrderDetail` — full order view with status actions
- `AdminLoginForm` — API key input

### Shared
- `PageContainer` — Container maxWidth="lg" with consistent padding
- `SectionHeading` — styled Typography for section titles
- `LoadingSpinner` — centered CircularProgress
- `EmptyState` — icon + message + optional CTA
- `SEOHead` — react-helmet-async wrapper

---

## Routing

```
/                              → Home
/termekek                      → ProductList
/termekek/:slug                → ProductDetail
/kosar                         → Cart
/penztar                       → Checkout
/rendeles-visszaigazolas/:id   → OrderConfirmation
/admin/login                   → AdminLogin
/admin                         → AdminDashboard
/admin/termekek                → AdminProductList
/admin/termekek/uj             → AdminProductForm (create)
/admin/termekek/:id/szerkesztes → AdminProductForm (edit)
/admin/megrendelesek           → AdminOrderList
/admin/megrendelesek/:id       → AdminOrderDetail
*                              → NotFound
```

React Router v7 with `createBrowserRouter`. Admin routes protected: redirect to `/admin/login` if no API key in sessionStorage. Soft guard: redirect `/penztar` → `/kosar` if cart empty.

---

## State Management

### Server State — TanStack Query

- Products list: `useQuery(['products'], fetchProducts)`, `staleTime: 5min`
- Single product: `useQuery(['product', slug])`, pre-populated from list cache
- Order submission: `useMutation` for POST /api/orders
- Categories: derived from product data (extract unique)

### Client State — Zustand

Cart store with persist middleware → localStorage:

```ts
type CartStore = {
    items: CartItem[];
    addItem: (product: Product, quantity: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    // Derived
    totalItems: number;
    subtotal: number;
};
```

Key: `cart-storage` in localStorage.

---

## Responsive Design

Mobile-first. MUI default breakpoints:

| Breakpoint | Width | Device |
|---|---|---|
| xs | 0px+ | Small phones |
| sm | 600px+ | Large phones, small tablets |
| md | 900px+ | Tablets |
| lg | 1200px+ | Desktops |

Key behaviors:
- **Header**: hamburger on xs/sm, full nav on md+
- **Product grid**: 1 col xs, 2 sm, 3 md, 4 lg
- **Product detail**: stacked xs/sm, side-by-side md+
- **Checkout**: stacked xs/sm, form + sidebar md+
- **Touch targets**: all interactive elements ≥ 44x44px

---

## Accessibility

- Semantic HTML via MUI's `component` prop (`<main>`, `<nav>`, `<header>`, `<footer>`)
- Alt text on all product images
- `label` prop on all TextFields
- `aria-label` on all IconButtons
- Skip-to-content link ("Ugrás a tartalomhoz")
- `<html lang="hu">`
- Focus management after cart actions (Snackbar with `role="alert"`)

---

## SEO

- SPA sufficient for MVP (<50 products)
- `react-helmet-async` per-page `<title>` and `<meta description>`
- Open Graph tags for social sharing (Facebook is big in Hungary)
- JSON-LD `Product` schema on detail pages
- Static `sitemap.xml` generated at build time
- Clean slug-based URLs (`/termekek/levendulas-kenocs`)
