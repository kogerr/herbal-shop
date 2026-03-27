# Domain Setup — koger.io subdomains

> Using subdomains of your existing `koger.io` domain for the webshop. The root domain and its VPS remain untouched.

---

## Subdomain Plan

| Subdomain | Service | Platform |
|---|---|---|
| `shop.koger.io` | Frontend (React SPA) | Vercel |
| `shop-api.koger.io` | Backend (Fastify API) | Railway |

The root `koger.io` continues pointing to your existing VPS.

---

## Step 1: Add subdomain to Vercel

1. In Vercel, go to your project → **Settings → Domains**
2. Add `shop.koger.io`
3. Vercel will show you a DNS record to create:

| Type | Name | Value |
|---|---|---|
| CNAME | `shop` | `cname.vercel-dns.com` |

4. Add this record in your DNS provider (Cloudflare, or wherever `koger.io` is managed)
5. If using Cloudflare: set the proxy to **DNS only** (grey cloud) — Vercel handles its own SSL

---

## Step 2: Add subdomain to Railway

1. In Railway, go to your backend service → **Settings → Networking → Custom Domain**
2. Add `shop-api.koger.io`
3. Railway will show you a DNS record to create:

| Type | Name | Value |
|---|---|---|
| CNAME | `shop-api` | `<your-service>.up.railway.app` |

(Railway gives you the exact value when you add the custom domain)

4. Add this record in your DNS provider
5. If using Cloudflare: set the proxy to **DNS only** (grey cloud) — Railway handles SSL

---

## Step 3: Update Railway environment variables

In Railway → your backend service → **Variables**, update:

| Variable | New Value |
|---|---|
| `FRONTEND_URL` | `https://shop.koger.io` |

This controls the CORS allowed origin — the backend will only accept requests from the frontend domain.

---

## Step 4: Configure Vercel API rewrites

The frontend makes API calls to `/api/*` (relative paths). In production, these need to be proxied to the Railway backend. Create a `vercel.json` in `packages/frontend/`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://shop-api.koger.io/api/:path*" }
  ]
}
```

This way the frontend code doesn't need to know the backend URL — it just calls `/api/products` and Vercel routes it to Railway.

---

## Step 5: Update Barion callback URLs

When integrating Barion (Phase 3), the payment callbacks need real URLs:

| Barion parameter | Value |
|---|---|
| `RedirectUrl` | `https://shop.koger.io/rendeles-visszaigazolas/{orderId}` |
| `CallbackUrl` | `https://shop-api.koger.io/api/payments/callback` |

These are set in the `startPayment()` API call from the backend, not in the Barion dashboard.

---

## DNS Summary

After both steps, your DNS should have these records (in addition to existing `koger.io` records):

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `shop` | `cname.vercel-dns.com` | DNS only |
| CNAME | `shop-api` | `<service>.up.railway.app` | DNS only |

Existing records for `koger.io` (A record to VPS, etc.) remain unchanged.

---

## Later: Dedicated domain for launch

When you register a `.hu` domain (e.g. `herbalshop.hu`), you can either:

1. **Replace** the subdomains — point the new domain to Vercel/Railway directly
2. **Redirect** — keep subdomains working and add redirects from the new domain
3. **Switch fully** — move everything to the new domain, redirect `shop.koger.io` there

This is a DNS-only change — no code modifications needed.
