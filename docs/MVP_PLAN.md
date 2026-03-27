# Herbal Ointment Webshop — MVP Plan

> A modern webshop for selling herbal ointments in the Hungarian market.

---

## 1. Architecture Overview

```
                        ┌─────────────────┐
                        │    Customer      │
                        │  (Browser/Mobile)│
                        └────────┬────────┘
                                 │ HTTPS
                        ┌────────▼────────┐
                        │   Vercel CDN     │
                        │  (React SPA)     │
                        └────────┬────────┘
                                 │ REST API
                        ┌────────▼────────┐
                        │  Node.js Backend │
                        │   (Fastify)      │
                        └──┬─────┬─────┬──┘
                           │     │     │
              ┌────────────┘     │     └────────────┐
              ▼                  ▼                   ▼
     ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐
     │ PostgreSQL   │   │   Barion     │   │  Szamlazz.hu    │
     │ (Neon/Supa)  │   │  Payment GW  │   │  Invoicing API  │
     └─────────────┘   └──────────────┘   └─────────────────┘
```

**Pattern**: Simple monolith — one backend, one frontend, one database. No microservices. Extract services later if the business validates.

**API Style**: REST — ~15 endpoints total. GraphQL overhead is not justified for a small product catalog.

**Project Structure**: Monorepo with pnpm workspaces.

```
herbal-shop/
├── packages/
│   ├── frontend/          # React + Vite + MUI
│   ├── backend/           # Fastify + TypeScript
│   └── shared/            # Shared types, Zod schemas
├── pnpm-workspace.yaml
├── docker-compose.dev.yml # Local Postgres only
├── .env.example
└── .github/workflows/ci.yml
```

---

## 2. Technology Stack

| Layer | Choice | Runner-up | Why |
|---|---|---|---|
| **Runtime** | Node.js (LTS) | Bun | Ecosystem maturity, universal PaaS support, all Hungarian payment SDKs are npm packages |
| **Backend Framework** | Fastify | Express | Built-in schema validation, ~3x faster, modern plugin system, similar learning curve |
| **Language** | TypeScript | — | Type safety across the full stack |
| **Database** | PostgreSQL | MongoDB | E-commerce is textbook relational data (orders→line items→products). ACID transactions for payment flows |
| **ORM** | Drizzle | Prisma | Lighter, no binary engine, SQL-like syntax, type-safe. Prisma's generation step is unnecessary overhead |
| **Frontend** | React + Vite (SPA) | Next.js | Simpler deployment, no SSR complexity. Small catalog (<50 products) indexes fine as SPA |
| **UI Library** | MUI (free tier) | shadcn/ui | Comprehensive components, built-in a11y, fast to build with |
| **Server State** | TanStack Query | — | Caching, loading/error states, refetching out of the box |
| **Client State** | Zustand (+ persist) | Context API | Cart persistence in localStorage with 5 lines of code |
| **Validation** | Zod | Joi | TypeScript-native, infers types from schemas, shared between frontend/backend |
| **Payment** | **Barion** | SimplePay | Node.js SDK exists (`node-barion`), instant sandbox access, HUF-native, good docs |
| **Invoicing** | Szamlazz.hu | — | De facto Hungarian standard. Handles NAV reporting automatically |
| **Hosting (FE)** | Vercel (free) | — | Zero-config for Vite/React, EU edge CDN, automatic SSL |
| **Hosting (BE)** | Railway ($5/mo) or Hetzner VPS (€4.51/mo) | Fly.io | Railway: git-push deploys, EU region. Hetzner: cheapest, full control |
| **Hosting (DB)** | Neon or Supabase (free tier, Frankfurt) | Railway Postgres | Managed, zero ops, EU data residency |
| **Containerization** | **Skip for MVP** | Docker | Solo dev, no team, no staging env |
| **Email** | Resend (free: 100/day) | Nodemailer + SMTP | Simplest API, generous free tier |
| **Images** | Cloudinary (free tier) | Supabase Storage | URL-based transforms (WebP, resize), CDN delivery |

**Estimated monthly cost: ~$5-8/month**

---

## 3. Payment & Billing

### Barion (Primary — MVP)

- **Fees**: ~1% for Barion Wallet, ~2.4-2.9% for card payments, no monthly fee
- **SDK**: `node-barion` on npm (covers all endpoints, async/await compatible)
- **Sandbox**: Instant access, no contract needed
- **Flow**: Redirect-based (your server → Barion gateway → callback)
- **Supports**: Visa, Mastercard, Barion Wallet, Google Pay, Apple Pay

### Szamlazz.hu (Invoicing)

- **SDK**: `szamlazz.js` on npm (wraps the XML API)
- **NAV reporting**: Automatic — no separate NAV integration needed
- **PDF generation**: Automatic, downloadable via API
- **Customer email**: Can send invoice to customer automatically
- **Pricing**: Free tier sufficient for MVP volume

### Payment → Invoice → Order Lifecycle

```
1. Customer submits checkout     → POST /api/orders
2. Backend validates & creates   → Order (status: pending), Payment (status: initiated)
   order in DB transaction       → Decrements stock
3. Backend calls Barion          → startPayment() → receives GatewayUrl
4. Customer redirected to Barion → Pays on Barion's hosted page
5. Barion sends IPN callback     → POST /api/payments/callback
6. Backend VERIFIES with Barion  → getPaymentState() (NEVER trust callback alone)
7. On success → generate invoice → Szamlazz.hu API → store PDF URL
8. Send confirmation email       → Resend (order summary + invoice PDF)
9. Customer sees confirmation    → /rendeles-visszaigazolas/:id
```

**Payment succeeds but invoice fails:**
- Order moves to `PAYMENT_RECEIVED` immediately (customer's order is confirmed regardless)
- Invoice retries with exponential backoff (immediate → 30s → 2min → 10min → 1h)
- After 5 failures → alert shop owner, who can generate manually in Szamlazz.hu web UI
- Hungarian law requires invoice issuance but not instantaneously — same business day is acceptable

### VAT Rate

- Almost certainly **27%** (standard rate) unless products have pharmaceutical/OGYÉI registration
- **Must verify with accountant before launch**

---

## 4. Frontend Plan

### Theming (MUI — ~25 lines of config)

| Role | Hex | Usage |
|---|---|---|
| Primary | `#4A7C59` | Buttons, links — muted sage green |
| Primary Dark | `#345740` | Hover states, active elements |
| Primary Light | `#E8F0EA` | Backgrounds, highlights |
| Secondary | `#C8A96E` | CTAs, badges — warm gold |
| Background | `#FAFAF7` | Pages — warm off-white |
| Text | `#2D2D2D` | Body text — soft black |

- **Headings**: Lora (serif, organic/apothecary feel) via `@fontsource/lora`
- **Body**: Inter (clean, legible) via `@fontsource/inter`
- Border radius: 12px cards, 8px buttons. No all-caps buttons. Flat (no elevation).

### Pages

| Route | Page | Key Components |
|---|---|---|
| `/` | Home | Hero banner, featured products, brand story, trust signals |
| `/termekek` | Product List | Category chips, sort dropdown, product grid (4/3/2/1 col responsive) |
| `/termekek/:slug` | Product Detail | Image, description, ingredients, price, add-to-cart |
| `/kosar` | Cart | Line items, quantity edit, shipping cost, subtotal/total |
| `/penztar` | Checkout | Shipping form, payment method, order summary sidebar |
| `/rendeles-visszaigazolas/:id` | Confirmation | Thank you, order number, invoice download |
| `*` | 404 | Friendly error with link home |

### Key Components

- **Layout**: `AppLayout`, `Header` (logo, nav, cart badge), `Footer`, `MobileNav` (Drawer)
- **Product**: `ProductCard`, `PriceDisplay` (HUF via `Intl.NumberFormat`), `CategoryFilter`, `QuantitySelector`
- **Cart**: `CartDrawer` (right-side quick view), `CartLineItem`, `CartSummary`
- **Checkout**: `CheckoutForm`, `ShippingMethodSelector`, `PaymentMethodSelector`, `OrderSummaryCompact`
- **Shared**: `PageContainer`, `SectionHeading`, `LoadingSpinner`, `EmptyState`, `SEOHead`

### State Management

- **Server state**: TanStack Query for products, orders. `staleTime: 5min` for product data.
- **Client state**: Zustand cart store with `persist` middleware → localStorage
- **Cart store**: `items[]`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, derived `totalItems` and `subtotal`

### Routing

React Router v7 with `createBrowserRouter`. No protected routes for MVP (guest checkout only). Soft guard on `/penztar` — redirect to `/kosar` if cart is empty.

### SEO

SPA is sufficient for MVP (<50 products). Use `react-helmet-async` for per-page meta tags. Add JSON-LD `Product` schema on detail pages. Generate static `sitemap.xml` at build time.

---

## 5. Backend Plan

### Data Models

**Product**: id, name, slug, description, ingredients, priceHuf (integer), images[], categoryId, stock, isActive, weight

**Category**: id, name, slug, sortOrder

**Order**: id, orderNumber, status enum (`pending`→`paid`→`shipped`→`delivered`→`cancelled`), customer/shipping/billing fields (inlined — no separate Customer entity for MVP), subtotalHuf, shippingCostHuf, totalHuf

**OrderItem**: id, orderId, productId, **snapshotted** name+price, quantity, lineTotalHuf

**Payment**: id, orderId, provider, providerTransactionId, amountHuf, status (`initiated`→`succeeded`→`failed`→`refunded`), providerPayload (jsonb)

**Invoice**: id, orderId, szamlazzInvoiceId, invoiceNumber, pdfData, status (`pending`→`created`→`failed`)

### API Endpoints

```
# Public
GET    /api/products                  — list (filter by category, paginate)
GET    /api/products/:slug            — detail
POST   /api/orders                    — create order + initiate payment → returns paymentUrl
GET    /api/orders/:id?token=xxx      — order status (token-based auth)
POST   /api/payments/callback         — Barion IPN webhook
GET    /api/invoices/:orderId/download?token=xxx  — PDF download

# Admin (API key in Authorization header)
GET    /api/admin/orders              — list orders
PATCH  /api/admin/orders/:id/ship     — mark shipped
CRUD   /api/admin/products            — product management
```

### Cart: Client-Side Only

No server-side cart for MVP. Cart lives in browser localStorage via Zustand. Backend validates cart contents at checkout (product existence, stock, recalculates prices from DB).

### Validation

Zod schemas shared between frontend and backend. Hungarian-specific: zip codes (4 digits), phone (+36 or 06 prefix), tax number format.

### Security

- Helmet.js for HTTP headers
- CORS: explicit allowlist
- Rate limiting: 100 req/min global, 10 req/min on POST /api/orders
- Zod validation on all inputs
- Parameterized queries via Drizzle
- Admin: single API key in env var

### Abandoned Order Cleanup

Scheduled job (node-cron, every 10 min): find orders older than 30 min still `pending`, set to `cancelled`, restore stock.

---

## 6. DevOps Strategy

### Local Development

- `pnpm workspaces` (no Turborepo needed)
- `concurrently` for running frontend + backend
- `docker-compose.dev.yml` with just Postgres
- `tsx --watch` for backend hot reload
- Vite HMR for frontend

### Deployment

- **Frontend**: Vercel (free, git-push deploy, EU edge CDN)
- **Backend**: Railway ($5/mo, Amsterdam region) or Hetzner VPS (€4.51/mo, Germany)
- **Database**: Neon/Supabase free tier (Frankfurt)
- **DNS**: Cloudflare (free) — CDN + DDoS protection

### CI/CD (GitHub Actions — ~30 lines)

1. Lint + typecheck
2. Test (Vitest — focus on payment/invoice/cart logic)
3. Build
4. Deploy automatically via Vercel/Railway git integrations

### Monitoring (all free tier)

- **Uptime**: UptimeRobot
- **Errors**: Sentry (`@sentry/node` + `@sentry/react`)
- **Logging**: Pino (structured JSON, Railway captures stdout)

### Backups

- Neon/Supabase: automatic daily backups
- Additional: daily `pg_dump` → Backblaze B2 (free up to 10GB)

---

## 7. MVP Scope

### IN (must have)

- Browse products, view details (ingredients, description, price)
- Add to cart (client-side, localStorage persisted)
- Guest checkout (no accounts)
- Online card payment via Barion
- Automatic invoice generation via Szamlazz.hu (NAV-compliant)
- Order confirmation page + email
- Mobile-responsive design
- Minimal admin API for product CRUD
- Admin dashboard UI (product management, order overview, mark shipped)
- Shipping cost display (flat rate tiers)
- Cookie consent banner (GDPR)
- Legal pages: ÁSZF, Privacy Policy, Impresszum

### OUT (post-MVP)

- User accounts / registration / login
- Order history, wishlist, favorites
- Product reviews, discount codes / coupons
- Advanced search / filtering
- Blog / content pages, multi-language
- Multiple payment providers
- Analytics dashboard, subscription orders

---

## 8. Phased Roadmap

| Phase | Focus | Duration | Key Deliverables |
|---|---|---|---|
| **0** | Research & Decisions | 2-3 days | Barion account + sandbox, Szamlazz.hu account, domain registered, hosting set up, VAT rate confirmed with accountant |
| **1** | Project Skeleton | 3-4 days | Monorepo initialized, frontend + backend running, Postgres + Drizzle schema, basic routing, `.env` config, CI pipeline |
| **2** | Core Features | 5-7 days | Product listing + detail pages, shopping cart (Zustand + localStorage), checkout form with validation, admin product CRUD API |
| **3** | Integrations | 5-7 days | Barion payment flow (start → redirect → callback → verify), Szamlazz.hu invoice generation, order status state machine, confirmation email via Resend |
| **4** | Polish | 3-4 days | MUI theming (herbal palette), responsive fixes, error handling + loading states, form validation UX, cookie consent, SEO meta tags, legal pages |
| **5** | Launch Prep | 3-4 days | Production deployment, domain + SSL, monitoring (Sentry + UptimeRobot), GDPR privacy policy, security review, full end-to-end smoke test |

**Total: ~21-29 working days (~4-6 weeks solo)**

---

## 9. Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Barion rejects herbal/health products | Medium | Critical | Apply in Phase 0. Avoid health claims on product pages. Have SimplePay as fallback |
| VAT rate miscategorization | Medium | High | **Consult accountant before launch** — 30-min conversation, non-negotiable |
| Szamlazz.hu API downtime during order | Low | High | Decouple invoice from payment confirmation. Retry queue. Manual fallback |
| Payment callback lost/duplicated | Medium | High | Idempotent processing on PaymentId. Poll `getPaymentState()` after 5min timeout |
| Scope creep delays launch | High | High | Stick to MVP scope. Write ideas in a backlog file, ignore until post-launch |
| Solo dev burnout | Medium | High | Keep phases small. Ship incrementally. No weekends |
| Product images look unprofessional | Medium | Medium | Invest 1-2h in good product photography (white bg, natural light, consistent style) |

---

## 10. Hungarian Compliance Checklist

- [ ] VAT rate confirmed with accountant (27% standard, or 5% if pharmaceutical)
- [ ] Szamlazz.hu account set up, NAV online invoice reporting verified
- [ ] ÁSZF (Terms & Conditions) page
- [ ] Impresszum (company details, tax number)
- [ ] Privacy Policy (GDPR compliant, list data processors: Barion, Szamlazz.hu, hosting)
- [ ] Cookie consent banner
- [ ] Invoice includes all legally required fields (see Szamlazz.hu docs)
- [ ] Domain registered (.hu or .com)

---

## 11. "Ship It" Checklist

### Functional
- [ ] Customer can browse, add to cart, checkout as guest
- [ ] Payment processed via Barion (tested with real test transactions)
- [ ] Hungarian invoice generated via Szamlazz.hu
- [ ] NAV reporting works (verified in Szamlazz.hu dashboard)
- [ ] Confirmation email sent with order details
- [ ] Admin can add/edit/deactivate products without deploy

### Non-functional
- [ ] Lighthouse performance 90+ on mobile
- [ ] Pages load <3s on 3G
- [ ] Works on Chrome, Safari, Firefox (latest)
- [ ] Mobile-usable (tested on real phone)
- [ ] HTTPS enforced, no secrets in source code
- [ ] Daily database backups, error tracking active (Sentry), uptime monitoring active

### Business
- [ ] Legal pages in place
- [ ] One real end-to-end test order completed
- [ ] Shipping workflow clear (how to fulfill when order comes in)
- [ ] Customer support email set up
