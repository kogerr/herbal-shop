# Phase 0 — Manual Setup Tasks

> Everything you need to register, configure, and decide before coding resumes. Estimated total: 4-6 hours of active work spread over 2-3 days (some registrations have approval wait times).

---

## 1. GitHub Repository (do first — everything else builds on this)

**Why GitHub over GitLab:** GitHub Actions gives **2,000 free CI minutes/month** for private repos (2-core, 7GB RAM runners). GitLab's free tier only gives **400 minutes** on weaker 1-core runners with 1 concurrent job. For your CI pipeline (~3 min per run), GitHub allows ~650 runs/month vs GitLab's ~130. GitHub also has better Playwright support out of the box.

**Steps:**

1. Go to https://github.com/new
2. Create a **private** repository (e.g. `herbal-shop` or `webshop`)
3. Do NOT initialize with README/gitignore (you already have these locally)
4. Connect and push:
   ```bash
   cd ~/workspace/webshop
   git remote add origin git@github.com:YOUR_USERNAME/herbal-shop.git
   git add -A
   git commit -m "Phase 0-1: project skeleton"
   git branch -M main
   git push -u origin main
   ```
5. In repository Settings → Secrets and variables → Actions, add these secrets (you'll fill in real values as you complete the steps below):
   - `DATABASE_URL` — production DB connection string (from step 5)
   - `BARION_POS_KEY` — live Barion key (from step 3)
   - `SZAMLAZZ_API_KEY` — live Szamlazz.hu key (from step 4)
   - `RESEND_API_KEY` — live Resend key (from step 8)
   - `ADMIN_API_KEY` — generate a strong random string: `openssl rand -hex 32`
   - `SENTRY_DSN` — from step 9

**Time: 15 minutes**

---

## 2. Domain Registration

Register before anything else — DNS propagation can take hours, and you'll need the domain for Barion registration and SSL setup.

**Options:**

| Registrar | Domain | Price | Notes |
|---|---|---|---|
| Rackforest | `.hu` | ~3,000-4,000 Ft/year | Hungarian registrar, Hungarian support |
| Dotroll | `.hu` | ~3,500 Ft/year | Hungarian, straightforward |
| Cloudflare Registrar | `.com` / `.eu` | ~$10-12/year | At-cost pricing, built-in DNS+CDN |

**Recommendation:** Register a `.hu` domain if targeting only Hungarian customers (trust signal). If you might expand later, `.com` works too. You can always add both later.

**Steps:**

1. Register domain at your chosen registrar
2. If NOT using Cloudflare Registrar, sign up for free Cloudflare account (https://dash.cloudflare.com/sign-up) and point your domain's nameservers to Cloudflare
3. Note: do NOT configure DNS records yet — you'll do that after hosting is set up (step 6)

**Time: 30 minutes (+ up to 48h for DNS propagation, but usually 1-2h)**

---

## 3. Barion Payment Gateway (do early — approval can take days)

This is the **highest-risk item**. Barion may reject herbal/health product merchants, so apply immediately.

**Steps:**

1. Register at https://secure.barion.com/Registration
2. After registration, go to the **Barion Wallet** and verify your identity (ID + address verification — required before you can accept payments)
3. Navigate to **Shops** → **Create Shop** (this gives you a test POS key for the sandbox)
4. Note your **POSKey** from the shop settings — this is your `BARION_POS_KEY`
5. Start testing immediately with the sandbox (no approval needed for test mode)
6. Apply for **live payment acceptance** — this requires:
   - Company/business registration documents (egyéni vállalkozó or Kft.)
   - Website URL (can be a placeholder "coming soon" page)
   - Product description — **important: describe products as "herbal cosmetic ointments" (gyógynövényes kozmetikai kenőcsök), NOT as medicine or health supplements**. Avoid any health claims.
7. Wait for approval (typically 3-7 business days)

**What you'll get:**
- Test POSKey (immediate) — for development
- Live POSKey (after approval) — for production

**Fallback:** If Barion rejects the application, register with SimplePay (OTP Bank) as backup. SimplePay has no Node.js SDK, so integration takes longer.

**Time: 30 minutes to register + 3-7 days wait for approval**

---

## 4. Szamlazz.hu Invoicing

**Steps:**

1. Register at https://www.szamlazz.hu/regisztracio (choose "Számla Agent" access during or after registration)
2. Complete business setup:
   - Add your company details (name, address, tax number / adószám)
   - Upload your company logo (appears on invoices)
   - Set default invoice language to Hungarian
   - Set default currency to HUF
   - Set default VAT rate to 27% (or whatever your accountant confirms — see step 10)
3. Enable **Számla Agent API** access:
   - Go to Settings → Számla Agent
   - Generate an API key — this is your `SZAMLAZZ_API_KEY`
4. Verify NAV Online Számla connection:
   - Szamlazz.hu handles NAV reporting automatically
   - Check that your NAV technical user credentials are linked (Szamlazz.hu docs walk you through this)
5. Create a test proforma invoice (díjbekérő) manually to verify everything is configured

**No sandbox available** — test with proforma invoices (not legally binding) during development. Switch to real invoices only when going live.

**Time: 45 minutes**

---

## 5. Database Hosting (PostgreSQL)

Choose one:

### Option A: Neon (recommended)

1. Sign up at https://neon.tech (GitHub login works)
2. Create a new project — **select Frankfurt (eu-central-1) region**
3. Create a database called `webshop`
4. Copy the connection string — this is your production `DATABASE_URL`
5. Note: Neon's free tier includes:
   - 0.5 GB storage
   - 1 compute with autoscaling (0.25-2 vCPU)
   - 100 hours active compute/month
   - Automatic daily backups (point-in-time recovery on paid plan)

### Option B: Supabase

1. Sign up at https://supabase.com (GitHub login works)
2. Create a new project — **select Frankfurt region**
3. Set a strong database password
4. Go to Settings → Database → Connection string → copy the URI
5. Free tier includes 500 MB storage, daily backups

**Time: 15 minutes**

---

## 6. Hosting

### Frontend: Vercel (free)

1. Sign up at https://vercel.com (use GitHub login)
2. Import your GitHub repository
3. Configure:
   - Framework Preset: **Vite**
   - Root Directory: **packages/frontend**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
4. Add environment variable: `VITE_API_URL` → your backend URL (you'll set this after Railway)
5. Go to Settings → Domains → add your domain (e.g. `yourdomain.hu`)
6. Vercel will give you DNS records to add in Cloudflare

### Backend: Railway (~$5/month)

1. Sign up at https://railway.app (use GitHub login)
2. Create a new project → Deploy from GitHub repo
3. Configure the service:
   - Root Directory: **packages/backend**
   - Build Command: `pnpm build`
   - Start Command: `pnpm start`
4. Add environment variables (all from your `.env.example`, with production values):
   - `NODE_ENV=production`
   - `DATABASE_URL` — from step 5
   - `FRONTEND_URL` — your Vercel domain (e.g. `https://yourdomain.hu`)
   - `ADMIN_API_KEY` — strong random string
   - `BARION_POS_KEY` — live key from step 3
   - `BARION_ENV=production`
   - `SZAMLAZZ_API_KEY` — from step 4
   - `RESEND_API_KEY` — from step 8
   - `PORT=3000`
5. Go to Settings → Networking → Generate Domain (or add custom domain like `api.yourdomain.hu`)
6. Railway auto-deploys on git push

### Alternative backend: Hetzner VPS (€4.51/month)

Only if you want full control or lower cost. Requires manual server setup (PM2, Nginx, Certbot). Takes 2-4 hours vs 15 minutes with Railway.

### DNS Records (in Cloudflare)

After both are set up, add these DNS records:

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `@` (or `www`) | `cname.vercel-dns.com` | DNS only (grey cloud) |
| CNAME | `api` | `your-app.up.railway.app` | DNS only (grey cloud) |

**Time: 1 hour**

---

## 7. Cloudinary (Image Hosting)

For product images. Not needed immediately (Phase 2+), but quick to set up.

1. Sign up at https://cloudinary.com (free: 25 monthly transformations, 25 GB storage)
2. Note your Cloud Name, API Key, API Secret
3. Create an upload preset for product images (Settings → Upload → Upload presets)
4. Configure: auto-format (WebP), auto-quality, max width 1200px

**Time: 15 minutes (can defer to Phase 2)**

---

## 8. Resend (Email)

1. Sign up at https://resend.com
2. Free tier: 100 emails/day, 3,000/month — plenty for MVP
3. Add and verify your domain (DNS records in Cloudflare):
   - SPF record
   - DKIM record
   - DMARC record (Resend provides all three)
4. Generate an API key — this is your `RESEND_API_KEY`

**Time: 20 minutes**

---

## 9. Monitoring

### Sentry (Error Tracking)

1. Sign up at https://sentry.io (free: 5,000 events/month)
2. Create a new organization and two projects:
   - **herbal-shop-frontend** (platform: React)
   - **herbal-shop-backend** (platform: Node.js/Fastify)
3. Note the DSN for each project — you'll add `@sentry/react` and `@sentry/node` in Phase 4-5

### UptimeRobot (Uptime Monitoring)

1. Sign up at https://uptimerobot.com (free: 50 monitors, 5-min intervals)
2. After deployment, add monitors for:
   - `https://yourdomain.hu` (HTTP, keyword: check for page title)
   - `https://api.yourdomain.hu/api/health` (HTTP, keyword: `"ok"`)
3. Configure alert contacts (your email, optionally Telegram/Slack)

**Time: 20 minutes**

---

## 10. Accountant Consultation (non-negotiable)

Book a 30-minute call with your accountant (könyvelő). This is **critical** — wrong VAT rate means incorrect invoices, which means NAV compliance issues.

**Questions to ask:**

1. **VAT rate for herbal ointments** — Is it 27% (kozmetikum) or 5% (gyógyszer/OGYÉI registered)? Almost certainly 27% unless products have pharmaceutical registration.
2. **Do I need OGYÉI notification?** — Required if products make any health claims. Cosmetic products don't need it.
3. **Szamlazz.hu invoice setup** — Any specific fields required for your business type (egyéni vállalkozó vs Kft.)?
4. **Reverse charge / tax number on invoice** — When is buyer's tax number required? (Answer: B2B invoices over 100,000 HUF VAT)
5. **Shipping as a separate invoice line item** — Should shipping be invoiced with 27% VAT or separately?
6. **Cash accounting (pénzforgalmi elszámolás)** — Does your business use it? Affects invoice wording.

**Time: 30 minutes + scheduling lead time**

---

## 11. Business Email

Set up a dedicated email for the shop (not your personal email):

- `info@yourdomain.hu` — customer-facing, displayed on the website
- `rendeles@yourdomain.hu` — for order notifications (optional)

**Options:**
- **Cloudflare Email Routing** (free) — forwards to your personal email, lets you set up a "from" address
- **Google Workspace** (~€5.75/month) — full inbox, calendar, professional
- **Zoho Mail** (free for 1 user) — basic but works

For MVP, Cloudflare Email Routing is sufficient.

**Time: 15 minutes**

---

## 12. Product Photography

Not a registration, but critical for launch. Bad product photos kill conversions.

**Quick guide:**
- White or light wood background
- Natural light (near a window, no direct sun)
- Consistent angle and framing across all products
- Show the jar/tube label clearly
- Minimum 1200x1200px, square crop
- Upload to Cloudinary (step 7)

**Time: 1-2 hours**

---

## Summary Checklist

| # | Task | Priority | Time | Wait time | Status |
|---|---|---|---|---|---|
| 1 | GitHub private repo | Critical | 15 min | None | ✅ Done — github.com/kogerr/herbal-shop |
| 2 | Domain (temporary) | Critical | 30 min | 1-48h DNS | ✅ Done — using shop.koger.io / shop-api.koger.io for dev. Register dedicated .hu domain before launch. |
| 3 | Barion (temporary sandbox) | Critical | 30 min | **3-7 days approval** | ✅ Done — sandbox keys from existing account. Apply for live approval with final business details before launch. |
| 4 | Szamlazz.hu (temporary) | Critical | 45 min | None | ✅ Done — agent key from existing account. Verify VAT mode (AAM vs 27%) and invoice settings before launch. |
| 5 | Neon database | Critical | 15 min | None | ✅ Done — Neon eu-central-1 (Frankfurt) |
| 6 | Vercel + Railway hosting | Critical | 1 hour | None | ✅ Done — frontend on Vercel, backend on Railway |
| 7 | Cloudinary images | Phase 2 | 15 min | None | ☐ |
| 8 | Resend email service | Phase 3 | 20 min | None | ☐ |
| 9 | Sentry + UptimeRobot | Phase 5 | 20 min | None | ☐ |
| 10 | Accountant call (VAT) | **Before launch** | 30 min | Scheduling | ☐ |
| 11 | Business email | Phase 4 | 15 min | None | ☐ |
| 12 | Product photography | Phase 4 | 1-2 hours | None | ☐ |

### Recommended order (optimized for wait times)

**Day 1 (morning):**
1. Register domain (DNS propagation starts)
2. Register Barion (approval clock starts — this is the longest wait)
3. Create GitHub repo and push code

**Day 1 (afternoon):**
4. Szamlazz.hu account + API key
5. Neon/Supabase database
6. Vercel + Railway hosting + DNS records

**Day 2:**
7. Verify domain DNS propagated
8. Schedule accountant call
9. Set up Resend + verify domain DNS records
10. Everything else as needed

**Day 3+:**
- Wait for Barion approval
- Accountant call
- Product photos
- Continue coding (Phase 2 can proceed without Barion live keys — sandbox works)
