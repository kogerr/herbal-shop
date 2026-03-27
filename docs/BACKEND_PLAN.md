# Backend Plan — Herbal Ointment Webshop

---

## Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js (LTS) + TypeScript |
| Framework | Fastify |
| ORM | Drizzle |
| Database | PostgreSQL |
| Validation | Zod |
| Payment | Barion (`node-barion`) |
| Invoicing | Szamlazz.hu (`szamlazz.js`) |
| Email | Resend |
| Logging | Pino |
| Security | helmet + cors + @fastify/rate-limit |
| Scheduled jobs | node-cron |

---

## Data Models

### Product

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| name | string | Required, max 200 |
| slug | string | Unique, from name |
| description | text | Full description |
| ingredients | text | Required for herbal products |
| priceHuf | integer | Forint, no decimals |
| images | string[] | Array of URLs |
| categoryId | UUID (FK) | References Category |
| stock | integer | Default 0 |
| isActive | boolean | Default true |
| weight | integer | Grams, for shipping |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Category

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | string | e.g. "Ízületekre", "Bőrproblémákra" |
| slug | string | Unique |
| description | text | Optional |
| sortOrder | integer | Display ordering |

### Order

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| orderNumber | string | Unique, e.g. "HO-20260327-001" |
| status | enum | `pending`, `paid`, `shipped`, `delivered`, `cancelled` |
| customerName | string | |
| customerEmail | string | |
| customerPhone | string | |
| shippingName | string | |
| shippingZip | string | 4 digits |
| shippingCity | string | |
| shippingAddress | string | |
| billingName | string | |
| billingZip | string | |
| billingCity | string | |
| billingAddress | string | |
| billingTaxNumber | string? | For business customers (adószám) |
| note | text? | Customer note |
| subtotalHuf | integer | Sum of line items |
| shippingCostHuf | integer | |
| totalHuf | integer | |
| accessToken | string | Random token for order status page auth |
| createdAt | timestamp | |
| updatedAt | timestamp | |

No separate Customer entity for MVP. Customer data is inlined on the Order.

### OrderItem

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| orderId | UUID (FK) | |
| productId | UUID (FK) | |
| productName | string | **Snapshotted** at order time |
| productPriceHuf | integer | **Snapshotted** at order time |
| quantity | integer | |
| lineTotalHuf | integer | price * quantity |

### Payment

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| orderId | UUID (FK) | |
| provider | enum | `barion` |
| providerTransactionId | string? | Set after payment initiation |
| amountHuf | integer | |
| status | enum | `initiated`, `succeeded`, `failed`, `refunded` |
| providerPayload | jsonb? | Raw callback body for debugging |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Invoice

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| orderId | UUID (FK) | |
| szamlazzInvoiceId | string | From API response |
| invoiceNumber | string | |
| pdfData | bytea or string | PDF binary or URL |
| status | enum | `pending`, `created`, `failed` |
| retryCount | integer | Default 0 |
| createdAt | timestamp | |

---

## API Endpoints

### Products (Public)

```
GET  /api/products?category=slug&page=1&limit=20
     → { products: Product[], total: number, page: number }

GET  /api/products/:slug
     → Product with category
```

Cache header: `Cache-Control: public, max-age=300`

### Cart: Client-Side Only

No server-side cart. Backend validates at checkout (product existence, stock, recalculates prices from DB — never trust client prices).

### Orders (Public)

```
POST /api/orders
     Body: { customer info, shipping info, billing info, items: [{productId, quantity}] }
     → { orderId, paymentUrl }

     Steps:
     1. Validate products exist, are active, have stock
     2. Create Order + OrderItems in transaction
     3. Decrement stock
     4. Initiate Barion payment
     5. Return payment redirect URL

GET  /api/orders/:id?token=xxx
     → { order status, payment status, invoice available? }
     Token-based auth: random string on order, "whoever has the link can see it"
```

### Payments

```
POST /api/payments/callback
     Barion IPN webhook. Validated by calling getPaymentState().
     Idempotent on PaymentId.
     → 200 OK

GET  /api/payments/:orderId/status?token=xxx
     For frontend polling after payment redirect.
     → { status: "succeeded" | "pending" | "failed" }
```

### Invoices

```
GET  /api/invoices/:orderId/download?token=xxx
     → PDF file (Content-Type: application/pdf)
```

### Admin (API key auth)

```
GET    /api/admin/orders?status=paid&page=1
POST   /api/admin/orders/:id/ship
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id          (soft delete: isActive=false)
```

All require `Authorization: Bearer <ADMIN_API_KEY>`.

---

## Order & Payment Flow

```
 1. Customer fills checkout form
 2. POST /api/orders with customer data + cart items
 3. Backend validates: products exist, active, in stock. Recalculates prices.
 4. DB transaction: create Order (pending), OrderItems (snapshotted prices), decrement stock, create Payment (initiated)
 5. Call Barion startPayment() → receive PaymentId + GatewayUrl
 6. Update Payment.providerTransactionId. Return { orderId, paymentUrl }.
 7. Frontend redirects customer to Barion.
 8. Customer pays (or cancels).
 9. Barion IPN → POST /api/payments/callback
10. Backend calls getPaymentState() to VERIFY. Updates Payment + Order status.
11. If paid → Szamlazz.hu API → generate invoice → store PDF.
12. Send confirmation email (Resend): order summary + invoice PDF attached.
13. Customer returns to redirect URL. Frontend polls payment status. Shows confirmation or failure.
```

### Stock Handling

Decrement at order creation (step 4), not at payment. If payment fails/abandoned, a cron job (every 10 min) finds orders >30 min old still `pending`, cancels them, restores stock.

---

## Error Handling

| Scenario | Action |
|---|---|
| Barion API fails at order creation | Roll back transaction, return 502 |
| Customer abandons payment | 30-min timeout cron cancels order, restores stock |
| Barion callback says failed | Update order to cancelled, restore stock |
| Payment succeeds, invoice fails | Retry with backoff (5 attempts). After failures → alert owner |
| Barion callback never arrives | Poll getPaymentState() after 5min. Mark TIMEOUT after 30min |
| Duplicate callback | Idempotency on PaymentId. Ignore if already processed |

---

## Validation — Zod

Shared schemas in `packages/shared/`:

```ts
const CreateOrderSchema = z.object({
    customerName: z.string().min(1).max(200),
    customerEmail: z.string().email(),
    customerPhone: z.string().regex(/^\+?[0-9\s\-]{7,15}$/),
    shippingZip: z.string().regex(/^[0-9]{4}$/),  // Hungarian zip
    // ...
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
    })).min(1).max(50),
});
```

Fastify validation middleware: takes Zod schema, validates `req.body`, returns 400 with errors.

---

## Security

- **CORS**: explicit allowlist (frontend domain only)
- **Helmet**: HTTP security headers (one middleware call)
- **Rate limiting**: 100 req/min global, 10 req/min on POST /api/orders
- **Admin auth**: API key in `Authorization: Bearer` header
- **Input sanitization**: Zod + Drizzle parameterized queries
- **CSRF**: Not a concern — stateless API, no cookies for auth
- **HTTPS**: enforced at reverse proxy / hosting level

---

## Email

- **Resend** (free tier: 100/day)
- Order confirmation email: sent after payment confirmed
- Contains: customer name, order number, items, total, shipping address, invoice PDF
- Plain HTML template literal — no templating engine needed for MVP

---

## Project Structure

```
packages/backend/src/
├── index.ts              # Fastify app setup, middleware
├── config.ts             # Typed environment variables
├── routes/
│   ├── products.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── invoices.ts
│   └── admin.ts
├── services/
│   ├── barion.ts         # Barion API integration
│   ├── szamlazz.ts       # Szamlazz.hu integration
│   ├── email.ts          # Email sending via Resend
│   └── stock.ts          # Stock management
├── middleware/
│   ├── validate.ts       # Zod validation
│   ├── adminAuth.ts      # API key check
│   └── errorHandler.ts   # Global error handler
├── jobs/
│   ├── cleanupPendingOrders.ts
│   └── retryInvoices.ts
└── db/
    ├── schema.ts         # Drizzle schema
    ├── migrations/
    └── queries/
```
