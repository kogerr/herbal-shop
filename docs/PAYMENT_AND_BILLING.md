# Payment & Billing — Hungarian Webshop

---

## Payment Providers Comparison

### Barion (Recommended for MVP)

| Aspect | Details |
|---|---|
| **API** | REST v2, JSON payloads, well-documented at docs.barion.com |
| **Flow** | Server calls `Payment/Start` → redirect to Barion gateway → callback on completion → verify with `Payment/GetPaymentState` |
| **Node.js SDK** | `node-barion` (npm) — 17 GitHub stars, actively maintained, covers all endpoints, async/await |
| **TypeScript** | No native types — write your own `.d.ts` if needed |
| **Fees** | ~1% Barion Wallet, ~2.4-2.9% card payments, no monthly fee |
| **Sandbox** | Instant access upon registration, no contract needed |
| **Settlement** | Wallet: instant. Cards: T+1 to T+3 |
| **Card types** | Visa, Mastercard, Barion Wallet, Google Pay, Apple Pay |
| **Multi-currency** | HUF, EUR, USD, CZK, PLN, RON |
| **Locales** | Hungarian, English, German, Czech, Slovak, Slovenian, Spanish, French |

### SimplePay (by OTP Bank)

| Aspect | Details |
|---|---|
| **API** | REST v2 (mandatory since Nov 2022), Hungarian + English docs |
| **Node.js SDK** | **No official SDK. No quality community package.** Manual REST integration required (HMAC signatures, JSON payloads). Adds 2-5 days of effort vs node-barion. |
| **Fees** | Not published — negotiated per merchant. Typically 1.5-3.5% |
| **Sandbox** | Available only after contract execution — cannot test before signing |
| **Settlement** | T+1 to T+3 (OTP account holders may see faster) |
| **Market share** | Arguably most recognized in Hungary. 3M+ Simple ecosystem users |

### Stripe (in Hungary)

- Available for Hungarian merchants
- Fees: 1.5% + €0.25 (European cards), 3.25% + €0.25 (non-European)
- Best-in-class DX, excellent TypeScript SDK
- Less brand recognition among Hungarian consumers
- Settlement in EUR — currency conversion overhead for HUF-focused business
- **Risk**: May flag herbal/health products as "restricted"

### PayPal

- Available but rarely used for Hungarian domestic e-commerce
- Higher fees (~3.4% + fixed)
- Not recommended as primary gateway

### Recommendation

**MVP: Barion** — Node.js SDK exists, instant sandbox, HUF-native, competitive fees, good docs.
**Phase 2: Add SimplePay** for broader reach (3M+ user base).

---

## Szamlazz.hu (Invoicing)

### Overview

Hungary's dominant online invoicing platform (886K+ organizations, 1.1M+ users). Provides **Számla Agent** — a non-browser API that accepts XML messages.

### Integration

| Aspect | Details |
|---|---|
| **API** | XML-based (not REST/JSON) — main friction point |
| **Node.js SDK** | `szamlazz.js` on npm — wraps XML API into JS-friendly interface |
| **NAV reporting** | **Automatic** — handles all NAV Online Számla submissions |
| **PDF generation** | Automatic for every invoice, downloadable via API |
| **Customer email** | Can auto-send invoice PDF to customer |
| **Sandbox** | No dedicated sandbox. Test with proforma invoices (not legally binding) |
| **Pricing** | Free tier for basic usage, sufficient for MVP |

### Required Invoice Data (Hungarian Law)

Per VAT Act (2007. évi CXXVII. törvény):

1. Invoice number (sequential, unique)
2. Invoice date (kiállítás dátuma)
3. Fulfillment date (teljesítés dátuma)
4. Payment deadline (fizetési határidő)
5. Seller: name, address, tax number
6. Buyer: name, address (tax number if B2B and VAT ≥ 100,000 HUF)
7. Line items: description, quantity, unit, unit price, VAT rate, net/gross amounts
8. VAT summary (net, VAT, gross per rate)
9. Currency (if not HUF, exchange rate required)
10. Payment method

Szamlazz.hu enforces most fields as required — you get validation for free.

---

## VAT Rates for Herbal Products

| Classification | Rate | Applies when |
|---|---|---|
| **Cosmetic product** (kozmetikai termék) | **27%** | Most herbal ointments without pharma registration |
| **Medicinal product** (gyógyszer) with OGYÉI registration | **5%** | Products with official pharmaceutical classification |
| **Dietary/nutritional supplement** with OÉTI notification | **5%** (maybe) | Depends on classification |
| **Medical device** (orvostechnikai eszköz) | **5%** | Registered medical devices |

**Default assumption: 27%.** Verify with accountant before launch.

---

## Order Lifecycle & State Machine

```
CREATED  →  PAYMENT_PENDING  →  PAYMENT_RECEIVED  →  INVOICED  →  CONFIRMED  →  SHIPPED  →  DELIVERED
                  │                      │
                  ▼                      ▼
            PAYMENT_FAILED        INVOICE_FAILED (*)
                  │                      │
                  ▼                      ▼
             CANCELLED            CONFIRMED (retry succeeded)
```

### Detailed Flow

```
 1. Customer fills checkout form
 2. POST /api/orders → validate products, stock, recalculate prices
 3. DB transaction: create Order (pending), OrderItems (snapshotted prices), decrement stock, create Payment (initiated)
 4. Call Barion startPayment() → receive PaymentId + GatewayUrl
 5. Return { orderId, paymentUrl } to frontend
 6. Frontend redirects to Barion
 7. Customer pays (or cancels)
 8. Barion sends IPN callback → POST /api/payments/callback
 9. Backend calls getPaymentState() to VERIFY (never trust callback alone)
10. Update Payment.status + Order.status
11. If paid → call Szamlazz.hu API → generate invoice → store PDF
12. Send confirmation email (order summary + invoice PDF)
13. Customer returns to confirmation page, frontend polls status
```

### Error Handling

| Scenario | Action |
|---|---|
| Barion API fails at order creation | Roll back transaction, return 502 |
| Customer abandons payment | 30-min timeout job cancels order, restores stock |
| Barion callback says failed | Update order to cancelled, restore stock |
| Payment succeeds, invoice fails | Retry with backoff (5 attempts). After 5 failures → alert owner |
| Barion callback never arrives | Poll `getPaymentState()` after 5min. Mark TIMEOUT after 30min |
| Duplicate callback | Idempotency check on PaymentId. Ignore if already processed |
| Refund requested | Create storno invoice in Szamlazz.hu, then process refund in Barion |

---

## NAV Online Számla Requirements

- Since July 1, 2020, **ALL invoices** issued by Hungarian VAT-registered entities must be reported to NAV in real-time
- Applies to B2B and B2C invoices alike, regardless of amount
- **Using Szamlazz.hu eliminates this entirely** — they handle all NAV reporting automatically
- Verify in Szamlazz.hu dashboard that invoices are being reported correctly
