# Phase 0–1 Implementation — Agent Team Prompt

> Copy this entire file as a prompt to spawn an agent team that bootstraps the webshop project from zero to a working skeleton.

---

You are an orchestration agent responsible for spawning and coordinating a team of specialized AI agents to implement Phase 0 (setup) and Phase 1 (skeleton) of a herbal ointment webshop.

## Context

The project lives in `~/workspace/webshop`. All planning is done — read these files for full context:

- `CLAUDE.md` — project overview, tech stack, code style
- `docs/MVP_PLAN.md` — architecture, scope, roadmap
- `docs/FRONTEND_PLAN.md` — pages, components, theming, routing, state
- `docs/BACKEND_PLAN.md` — data models, API endpoints, project structure
- `docs/DEVOPS_PLAN.md` — monorepo setup, env config, CI/CD
- `docs/CODING_GUIDELINES.md` — TypeScript and React conventions
- `docs/STACK_EVALUATION.md` — technology decisions and rationale
- `docs/PAYMENT_AND_BILLING.md` — Barion, Szamlazz.hu integration details

## Goal

Go from an empty directory to a fully working development environment where:
1. `pnpm dev` starts both frontend and backend with hot reload
2. Frontend shows a basic home page with MUI theming applied
3. Backend responds to `GET /api/products` with seed data from PostgreSQL
4. Database has schema and migrations applied with seed products
5. All TypeScript compiles, ESLint passes, basic tests run

---

## Agent Team

Spawn the following agents. Agents 1–4 can run in parallel (they write to separate directories). Agent 5 (Integration) runs after all others complete.

---

### Agent 1: Monorepo & DevOps Setup

**Writes to**: root files, `docker-compose.dev.yml`, `.github/`

**Tasks**:

1. **Initialize the monorepo**:
   ```
   cd ~/workspace/webshop
   git init
   pnpm init
   ```
   Create `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - "packages/*"
   ```

2. **Create root `package.json`** with:
   ```json
   {
     "name": "herbal-shop",
     "private": true,
     "scripts": {
       "dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\"",
       "build": "pnpm -r build",
       "lint": "pnpm -r lint",
       "typecheck": "pnpm -r typecheck",
       "test": "pnpm -r test"
     },
     "devDependencies": {
       "concurrently": "^9.1.0"
     }
   }
   ```

3. **Create `docker-compose.dev.yml`** (Postgres only):
   ```yaml
   services:
     postgres:
       image: postgres:16-alpine
       ports:
         - "5432:5432"
       environment:
         POSTGRES_DB: webshop
         POSTGRES_USER: webshop
         POSTGRES_PASSWORD: webshop
       volumes:
         - pgdata:/var/lib/postgresql/data
   volumes:
     pgdata:
   ```

4. **Create `.env.example`**:
   ```env
   NODE_ENV=development
   DATABASE_URL=postgresql://webshop:webshop@localhost:5432/webshop
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ADMIN_API_KEY=dev-admin-key
   BARION_POS_KEY=test-pos-key
   BARION_ENV=test
   SZAMLAZZ_API_KEY=test-key
   RESEND_API_KEY=re_test_xxx
   ```
   Copy to `.env` (gitignored).

5. **Create `.gitignore`**:
   ```
   node_modules/
   dist/
   .env
   .env.local
   *.auth-state.json
   .playwright-cli/
   .playwright-mcp/
   ```

6. **Create root `tsconfig.base.json`** (shared TypeScript config):
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "esModuleInterop": true,
       "strict": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noFallthroughCasesInSwitch": true
     }
   }
   ```

7. **Create `.github/workflows/ci.yml`**:
   ```yaml
   name: CI
   on:
     push:
       branches: [main]
     pull_request:

   jobs:
     quality:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
             cache: pnpm
         - run: pnpm install --frozen-lockfile
         - run: pnpm lint
         - run: pnpm typecheck
         - run: pnpm test
         - run: pnpm build
   ```

8. **Create a root `README.md`** (minimal — just enough to get started):
   ```markdown
   # Herbal Ointment Webshop

   ## Quick Start

   ```bash
   # Prerequisites: Node.js 22+, pnpm 9+, Docker

   # Start database
   docker compose -f docker-compose.dev.yml up -d

   # Install dependencies
   pnpm install

   # Copy environment config
   cp .env.example .env

   # Run database migrations
   pnpm --filter backend db:migrate

   # Seed database
   pnpm --filter backend db:seed

   # Start development
   pnpm dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API docs: http://localhost:3000/api/products
   ```

---

### Agent 2: Shared Package

**Writes to**: `packages/shared/`

**Tasks**:

1. **Initialize `packages/shared/package.json`**:
   ```json
   {
     "name": "@webshop/shared",
     "version": "0.0.1",
     "private": true,
     "type": "module",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "scripts": {
       "lint": "eslint src/",
       "typecheck": "tsc --noEmit"
     },
     "devDependencies": {
       "typescript": "^5.7.0"
     },
     "dependencies": {
       "zod": "^3.24.0"
     }
   }
   ```

2. **Create `packages/shared/tsconfig.json`** extending root base.

3. **Create shared types** in `packages/shared/src/types/`:

   **`product.ts`**:
   ```ts
   export type Product = {
     id: string;
     name: string;
     slug: string;
     description: string;
     ingredients: string;
     priceHuf: number;
     images: string[];
     categoryId: string;
     stock: number;
     isActive: boolean;
     weight: number;
     createdAt: string;
     updatedAt: string;
   };

   export type Category = {
     id: string;
     name: string;
     slug: string;
     description?: string;
     sortOrder: number;
   };

   export type ProductWithCategory = Product & {
     category: Category;
   };
   ```

   **`order.ts`**:
   ```ts
   export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
   export type PaymentStatus = "initiated" | "succeeded" | "failed" | "refunded";
   export type InvoiceStatus = "pending" | "created" | "failed";

   export type OrderItem = {
     productId: string;
     quantity: number;
   };

   export type ShippingInfo = {
     name: string;
     zip: string;
     city: string;
     address: string;
   };

   export type BillingInfo = ShippingInfo & {
     taxNumber?: string;
   };

   export type CreateOrderInput = {
     customerName: string;
     customerEmail: string;
     customerPhone: string;
     shipping: ShippingInfo;
     billing: BillingInfo;
     note?: string;
     items: OrderItem[];
   };

   export type OrderSummary = {
     id: string;
     orderNumber: string;
     status: OrderStatus;
     totalHuf: number;
     createdAt: string;
   };
   ```

   **`cart.ts`**:
   ```ts
   import type { Product } from "./product";

   export type CartItem = {
     product: Product;
     quantity: number;
   };
   ```

4. **Create Zod validation schemas** in `packages/shared/src/schemas/`:

   **`order.schema.ts`**:
   ```ts
   import { z } from "zod";

   const HUNGARIAN_ZIP = /^[0-9]{4}$/;
   const PHONE_REGEX = /^\+?[0-9\s\-]{7,15}$/;

   export const shippingInfoSchema = z.object({
     name: z.string().min(1).max(200),
     zip: z.string().regex(HUNGARIAN_ZIP, "Érvénytelen irányítószám"),
     city: z.string().min(1).max(100),
     address: z.string().min(1).max(300),
   });

   export const billingInfoSchema = shippingInfoSchema.extend({
     taxNumber: z.string().optional(),
   });

   export const createOrderSchema = z.object({
     customerName: z.string().min(1).max(200),
     customerEmail: z.string().email("Érvénytelen e-mail cím"),
     customerPhone: z.string().regex(PHONE_REGEX, "Érvénytelen telefonszám"),
     shipping: shippingInfoSchema,
     billing: billingInfoSchema,
     note: z.string().max(500).optional(),
     items: z.array(z.object({
       productId: z.string().uuid(),
       quantity: z.number().int().min(1).max(99),
     })).min(1).max(50),
   });
   ```

5. **Create `packages/shared/src/index.ts`** that re-exports everything.

6. **Create utility** `packages/shared/src/utils/formatPrice.ts`:
   ```ts
   const formatter = new Intl.NumberFormat("hu-HU", {
     style: "currency",
     currency: "HUF",
     maximumFractionDigits: 0,
   });

   export const formatPriceHuf = (amountHuf: number): string => formatter.format(amountHuf);
   ```

---

### Agent 3: Frontend Skeleton

**Writes to**: `packages/frontend/`

**Tasks**:

1. **Scaffold with Vite**:
   ```bash
   cd ~/workspace/webshop/packages
   pnpm create vite frontend --template react-ts
   ```

2. **Install dependencies**:
   ```bash
   cd frontend
   pnpm add @mui/material @emotion/react @emotion/styled @mui/icons-material
   pnpm add @tanstack/react-query react-router zustand
   pnpm add @fontsource/lora @fontsource/inter
   pnpm add react-helmet-async
   pnpm add -D @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom jsdom eslint @eslint/js typescript-eslint
   ```
   Add `@webshop/shared` as workspace dependency: `"@webshop/shared": "workspace:*"`

3. **Create MUI theme** at `src/theme.ts`:
   - Primary: `#4A7C59`, Primary Dark: `#345740`, Primary Light: `#E8F0EA`
   - Secondary: `#C8A96E`
   - Background default: `#FAFAF7`, paper: `#FFFFFF`
   - Text primary: `#2D2D2D`, secondary: `#6B6B6B`
   - Typography: Lora for headings (h1–h6), Inter for body
   - Button overrides: `textTransform: 'none'`, `disableElevation: true`, `borderRadius: 8`
   - Card overrides: `borderRadius: 12`, subtle shadow
   - TextField: outlined variant, `borderRadius: 8`
   - AppBar: white background

4. **Set up React Router** in `src/router.tsx`:
   ```
   /                              → Home
   /termekek                      → ProductList
   /termekek/:slug                → ProductDetail
   /kosar                         → Cart
   /penztar                       → Checkout
   /rendeles-visszaigazolas/:id   → OrderConfirmation
   *                              → NotFound
   ```
   Wrap all routes in `AppLayout` component.

5. **Create layout components**:

   **`src/components/layout/AppLayout.tsx`** — Header + `<Outlet />` + Footer
   **`src/components/layout/Header.tsx`** — Logo text, nav links (Termékek), cart icon with MUI Badge
   **`src/components/layout/Footer.tsx`** — Simple footer: "© 2026 Herbal Shop", contact info placeholder
   **`src/components/layout/PageContainer.tsx`** — MUI Container with maxWidth="lg" and vertical padding

6. **Create placeholder pages** (each in `src/pages/`):

   **`HomePage.tsx`** — Hero section with heading "Természetes kenőcsök, kézzel készítve", CTA button to /termekek, featured products placeholder
   **`ProductListPage.tsx`** — Grid of ProductCard components. Use TanStack Query to fetch `GET /api/products`. Show loading spinner. Category chips placeholder.
   **`ProductDetailPage.tsx`** — Fetch single product by slug. Show name, price, description, ingredients, add-to-cart button.
   **`CartPage.tsx`** — Read from Zustand cart store. Show line items or empty state.
   **`CheckoutPage.tsx`** — Form with shipping fields (name, email, phone, zip, city, address). "Megrendelés elküldése" button (disabled, not wired up yet).
   **`OrderConfirmationPage.tsx`** — "Köszönjük a rendelését!" placeholder.
   **`NotFoundPage.tsx`** — "Az oldal nem található" with link home.

7. **Create Zustand cart store** at `src/stores/cartStore.ts`:
   - `items: CartItem[]`
   - `addItem(product, quantity)` — add or increment
   - `removeItem(productId)` — remove entirely
   - `updateQuantity(productId, quantity)`
   - `clearCart()`
   - Derived getters: `totalItems`, `subtotal`
   - Use `persist` middleware with key `cart-storage`

8. **Create reusable components**:

   **`src/components/product/ProductCard.tsx`** — MUI Card: image placeholder (gray Box), product name (Typography), price (PriceDisplay), "Kosárba" Button. Clicking card navigates to `/termekek/${slug}`.
   **`src/components/product/PriceDisplay.tsx`** — Uses `formatPriceHuf` from shared package. Props: `amount: number`, optional `variant`.
   **`src/components/product/QuantitySelector.tsx`** — IconButton (−), Typography (count), IconButton (+). Props: `value`, `onChange`, `min=1`, `max=99`.
   **`src/components/shared/LoadingSpinner.tsx`** — Centered MUI CircularProgress.
   **`src/components/shared/EmptyState.tsx`** — Icon + message + optional action Button.

9. **Set up TanStack Query** in `src/api/`:

   **`src/api/client.ts`** — Base fetch wrapper pointing to `http://localhost:3000` (from env).
   **`src/api/products.ts`** — `fetchProducts()` and `fetchProduct(slug)` functions.
   **`src/hooks/useProducts.ts`** — `useProducts()` and `useProduct(slug)` hooks wrapping TanStack Query.

10. **Wire up `src/main.tsx`**:
    - `QueryClientProvider`
    - `ThemeProvider` with custom theme
    - `HelmetProvider`
    - `RouterProvider`
    - Import Lora and Inter fonts

11. **Create `vite.config.ts`** with proxy to backend:
    ```ts
    export default defineConfig({
      plugins: [react()],
      server: {
        proxy: {
          "/api": "http://localhost:3000",
        },
      },
    });
    ```

12. **Add scripts** to `package.json`:
    ```json
    "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      "preview": "vite preview",
      "lint": "eslint src/",
      "typecheck": "tsc --noEmit",
      "test": "vitest run"
    }
    ```

13. **Write one basic test**: `src/components/product/PriceDisplay.test.tsx` — renders formatted HUF price.

14. **Update `index.html`**: set `<html lang="hu">`, title "Herbal Shop — Természetes kenőcsök".

---

### Agent 4: Backend Skeleton

**Writes to**: `packages/backend/`

**Tasks**:

1. **Initialize `packages/backend/package.json`**:
   ```json
   {
     "name": "@webshop/backend",
     "version": "0.0.1",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js",
       "lint": "eslint src/",
       "typecheck": "tsc --noEmit",
       "test": "vitest run",
       "db:generate": "drizzle-kit generate",
       "db:migrate": "drizzle-kit migrate",
       "db:seed": "tsx src/db/seed.ts"
     }
   }
   ```

2. **Install dependencies**:
   ```bash
   pnpm add fastify @fastify/cors @fastify/helmet @fastify/rate-limit
   pnpm add drizzle-orm postgres
   pnpm add zod pino pino-pretty
   pnpm add dotenv
   pnpm add -D drizzle-kit tsx typescript vitest @types/node eslint @eslint/js typescript-eslint
   ```
   Add `@webshop/shared` as workspace dependency.

3. **Create `src/config.ts`** — typed environment variable loader:
   ```ts
   import "dotenv/config";
   import { z } from "zod";

   const envSchema = z.object({
     NODE_ENV: z.enum(["development", "production"]).default("development"),
     PORT: z.coerce.number().default(3000),
     DATABASE_URL: z.string(),
     FRONTEND_URL: z.string().default("http://localhost:5173"),
     ADMIN_API_KEY: z.string().default("dev-admin-key"),
   });

   export const config = envSchema.parse(process.env);
   ```

4. **Create Drizzle schema** at `src/db/schema.ts`:
   - `categories` table: id (uuid, pk, default random), name, slug (unique), description, sortOrder, createdAt, updatedAt
   - `products` table: id, name, slug (unique), description, ingredients, priceHuf (integer), images (text array), categoryId (FK), stock (integer, default 0), isActive (boolean, default true), weight (integer), createdAt, updatedAt
   - `orders` table: id, orderNumber (unique), status (text, default 'pending'), all customer/shipping/billing fields, subtotalHuf, shippingCostHuf, totalHuf, accessToken, note, createdAt, updatedAt
   - `orderItems` table: id, orderId (FK), productId (FK), productName, productPriceHuf, quantity, lineTotalHuf
   - `payments` table: id, orderId (FK), provider, providerTransactionId, amountHuf, status, providerPayload (jsonb), createdAt, updatedAt
   - `invoices` table: id, orderId (FK), szamlazzInvoiceId, invoiceNumber, pdfData (text), status, retryCount, createdAt

   Use `pgTable` from drizzle-orm/pg-core. Use proper relations.

5. **Create `src/db/index.ts`** — Drizzle client setup connecting to DATABASE_URL.

6. **Create `drizzle.config.ts`** at package root.

7. **Create seed script** `src/db/seed.ts`:

   Seed 3 categories:
   - "Fájdalomcsillapító" (slug: "fajdalomcsillapito")
   - "Bőrápoló" (slug: "borapolo")
   - "Izomfeszültség" (slug: "izomfeszultseg")

   Seed 6 products (2 per category):
   - "Levendulás nyugtató kenőcs" — 3490 HUF, 50g
   - "Mentás hűsítő balzsam" — 2990 HUF, 30g
   - "Körömvirág bőrápoló krém" — 4290 HUF, 50g
   - "Teafa tisztító kenőcs" — 3690 HUF, 30g
   - "Rozmaring izomfrissítő" — 4490 HUF, 75g
   - "Ördögcsáklya ízületi balzsam" — 5290 HUF, 50g

   Each with realistic Hungarian descriptions and ingredient lists.
   Images: empty array for now (placeholder).
   Stock: 50 each. isActive: true.

8. **Create Fastify app** at `src/index.ts`:
   - Register `@fastify/cors` (allow FRONTEND_URL)
   - Register `@fastify/helmet`
   - Register `@fastify/rate-limit` (100 req/min)
   - Register route plugins
   - Health check: `GET /api/health` → `{ status: "ok" }`
   - Start on config.PORT
   - Pino logger (pretty in dev)

9. **Create routes**:

   **`src/routes/products.ts`** (Fastify plugin):
   ```
   GET /api/products?category=slug&page=1&limit=20
   → { products: Product[], total: number, page: number, totalPages: number }

   GET /api/products/:slug
   → ProductWithCategory (joined with category)
   → 404 if not found
   ```

   **`src/routes/admin.ts`** (Fastify plugin):
   ```
   // All routes behind adminAuth preHandler
   GET    /api/admin/products → list all (including inactive)
   POST   /api/admin/products → create product
   PUT    /api/admin/products/:id → update product
   DELETE /api/admin/products/:id → soft delete (isActive=false)
   ```

   **`src/routes/orders.ts`** (stub):
   ```
   POST /api/orders → returns { message: "Not implemented yet" } with 501
   GET  /api/orders/:id → returns 501
   ```

10. **Create middleware**:

    **`src/middleware/adminAuth.ts`** — Fastify preHandler that checks `Authorization: Bearer <ADMIN_API_KEY>`.
    **`src/middleware/validate.ts`** — Fastify preHandler that takes a Zod schema and validates `request.body`, returning 400 with structured errors.

11. **Write basic tests**: `src/routes/products.test.ts` — test that product list returns correct shape (mock db or use Fastify inject).

12. **Create `tsconfig.json`** extending root base, with `outDir: "./dist"`.

---

### Agent 5: Integration & Verification (runs AFTER Agents 1–4)

**Depends on**: All previous agents must complete first.

**Tasks**:

1. **Install all dependencies**:
   ```bash
   cd ~/workspace/webshop
   pnpm install
   ```

2. **Start Postgres**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

3. **Run database migrations**:
   ```bash
   pnpm --filter backend db:generate
   pnpm --filter backend db:migrate
   ```

4. **Seed database**:
   ```bash
   pnpm --filter backend db:seed
   ```

5. **Verify backend starts**:
   ```bash
   cd packages/backend && pnpm dev &
   # Wait 3 seconds, then:
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/products
   # Should return health OK and 6 seeded products
   ```

6. **Verify frontend starts**:
   ```bash
   cd packages/frontend && pnpm dev &
   # Wait 3 seconds, verify no errors in console
   ```

7. **Run quality checks**:
   ```bash
   cd ~/workspace/webshop
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

8. **Fix any issues** found during verification. Common problems:
   - Import path mismatches between packages
   - Missing peer dependencies
   - TypeScript strict mode errors
   - ESLint config issues
   - Drizzle schema/migration issues
   - CORS misconfiguration

9. **Verify the full `pnpm dev` works** from root:
   ```bash
   pnpm dev
   # Both frontend (5173) and backend (3000) should start
   # Frontend should show the home page with theme applied
   # Navigating to /termekek should show 6 products from the API
   ```

10. **Report final status**: list what works, what doesn't, and any manual steps needed.

---

## Constraints

- Follow ALL conventions in `docs/CODING_GUIDELINES.md` and `.claude/rules/`
- Arrow functions only for components and handlers
- `type` not `interface` for props
- No `any` — use `unknown` or proper types
- All user-facing text in Hungarian
- Prices as integers (HUF, no decimals)
- `data-test-id` in camelCase on key interactive elements
- No JSDoc comments
- No barrel/index.ts re-export files (except `packages/shared/src/index.ts`)
- Keep it minimal — this is a skeleton, not a finished product

## Expected Output

When complete, the developer should be able to:

```bash
cd ~/workspace/webshop
docker compose -f docker-compose.dev.yml up -d
pnpm install
cp .env.example .env
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
pnpm dev
```

Then open `http://localhost:5173` and see:
- A home page with the herbal green theme
- Navigation to `/termekek` showing 6 products fetched from the API
- Products display name and price in HUF format
- Cart functionality (add, remove, persist across refresh)
- All pages routed and rendering (even if some are placeholders)

Spawn Agents 1–4 in parallel, then Agent 5 sequentially after they all complete.
