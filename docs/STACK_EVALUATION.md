# Stack Evaluation & Alternatives

> Detailed comparison of each technology choice for the herbal ointment webshop MVP.

---

## 1. Backend Runtime

| Criterion | Node.js | Bun | Deno | Go |
|---|---|---|---|---|
| Ecosystem maturity | Excellent — largest npm ecosystem, 15+ years | Young — 1.0 in 2023, edge cases remain | Maturing — Deno 2.0 has npm compat | Excellent — different ecosystem entirely |
| TypeScript support | Via tsx; well-understood | Native TS, very fast | Native TS — best-in-class DX | No TS — different language |
| Hungarian payment SDKs | `node-barion`, SimplePay libs exist on npm | Mostly npm compatible, some native addon gaps | npm compat layer works for most | REST APIs only, no ready SDKs |
| Deployment simplicity | Runs everywhere — every PaaS, every VPS | Fewer PaaS options natively | Deno Deploy is easy; others limited | Single binary, but different toolchain |
| Solo dev productivity | Highest — most tutorials, SO answers, AI help | Good when it works, painful at compat gaps | Good DX, smaller community | Higher learning curve for web CRUD |

**Decision: Node.js** — safest, most productive, universally supported.

---

## 2. Database

| Criterion | MongoDB | PostgreSQL | SQLite |
|---|---|---|---|
| Data model fit | Awkward — orders/line items/products are relational | Excellent — FK, joins, constraints model e-commerce naturally | Good for small scale — same relational SQL |
| Transaction support | Bolted-on multi-document transactions | Native ACID — critical for payment/order flows | Full ACID within single process |
| Query flexibility | Aggregation pipeline is verbose for relational queries | SQL is gold standard for reporting, filtering, joins | Same SQL capabilities |
| Operational complexity | Requires replica set for transactions; Atlas adds cost | Managed options everywhere (Neon, Supabase, Railway) | Zero ops — it's a file |
| Hosting cost | Atlas free: 512MB, then ~$9+/mo | Neon/Supabase free: 500MB; very competitive | Free — embedded |
| Migration path | Harder to migrate from document model | Easy to scale up | Easy to migrate to Postgres later |

**Decision: PostgreSQL** — relational data fits perfectly, ACID for payments, managed free tiers available.

---

## 3. Containerization

| Criterion | Docker + Compose | PaaS (Railway/Render/Fly.io) | VPS + PM2 |
|---|---|---|---|
| Ops complexity for solo dev | Medium — Dockerfiles, networking, volumes | Low — git push to deploy | Low-Medium — initial setup, then PM2 handles it |
| Cost (MVP) | Depends on hosting | Railway: ~$5/mo | Hetzner: €4.51/mo |
| Deployment speed | Slower — build image, push, restart | Fastest — push and done | Medium — ssh, pull, restart |
| EU data residency | You choose server location | Railway: Amsterdam. Render: Frankfurt | Hetzner: Germany/Finland |

**Decision: Skip Docker for MVP.** Use PaaS (Railway + Vercel) or Hetzner VPS. Add Docker when needed.

---

## 4. Web Framework

| Criterion | Express | Fastify | Hono | NestJS |
|---|---|---|---|---|
| Maturity | 13+ years, massive middleware | 8+ years, production-proven | Newer (2022), rapidly growing | Mature, enterprise-grade |
| Performance | Adequate | 2-3x faster than Express | Fastest of the four | Comparable to Express |
| Built-in validation | No | Yes — JSON Schema, generates OpenAPI | Minimal | Yes — class-validator |
| TypeScript DX | Types are afterthought | Good native TS | Excellent TS-first | Excellent — TS mandatory |
| Right for MVP? | Yes | Yes | Yes | No — too much ceremony |

**Decision: Fastify** — schema validation for payment webhooks, better performance, same learning curve as Express.

---

## 5. ORM / Database Client

| Criterion | Prisma | Drizzle | Kysely | Raw queries |
|---|---|---|---|---|
| Type safety | Excellent (generated client) | Excellent (schema-as-code, inferred) | Excellent (query builder inference) | None unless manual |
| Migration workflow | Built-in `prisma migrate` | Built-in `drizzle-kit` | No built-in migrations | Manual SQL files |
| Query flexibility | Limited — complex queries need `$queryRaw` | High — SQL-like syntax | High — typed query builder | Unlimited |
| Performance overhead | Noticeable — Rust engine binary, cold starts | Minimal | Minimal | None |
| Bundle size | Large (~15MB engine) | Small | Small | Tiny |

**Decision: Drizzle** — Prisma-level type safety without the engine binary. Better for PaaS cold starts.

---

## 6. Frontend Build Tool

**Vite** — no debate. Industry standard in 2026 for React. Near-instant HMR, optimized builds. No alternative (Webpack, Parcel, Turbopack) offers better DX-to-capability ratio.

---

## 7. Hosting

| Platform | Monthly Cost | EU Region | Managed DB | Deploy | Notes |
|---|---|---|---|---|---|
| **Vercel** (FE) | Free | Frankfurt CDN | No | Git push | Designed for frontend/SSR |
| **Railway** (BE) | ~$5 | Amsterdam | Yes | Git push | Good free→paid transition |
| **Fly.io** | ~$5-10 | Frankfurt | Yes (Fly Postgres) | Dockerfile | Slight learning curve |
| **Render** | Free-$7 | Frankfurt | Yes | Git push | Free tier sleeps after 15min |
| **Hetzner VPS** | €4.51 | Nuremberg/Helsinki | Self-managed | Manual/Coolify | Cheapest, full control, EU-native |
| **Neon** (DB) | Free | Frankfurt | Postgres | — | Serverless, auto-scaling |
| **Supabase** (DB) | Free | Frankfurt | Postgres + auth + storage | — | More features, slightly heavier |

**Decision: Vercel (frontend) + Railway (backend) + Neon/Supabase (database).** All with EU regions selected. Fallback to Hetzner VPS if cost matters.
