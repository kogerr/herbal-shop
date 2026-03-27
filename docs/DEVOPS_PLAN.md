# DevOps Plan — Herbal Ointment Webshop

---

## Local Development

### Monorepo: pnpm workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

Structure: `packages/frontend`, `packages/backend`, `packages/shared`

### Dev Server

Root script runs both concurrently:
```json
"dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\""
```

- Frontend: Vite HMR (zero config)
- Backend: `tsx --watch` (TypeScript directly, replaces nodemon + ts-node)

### Local Database

Single-service Docker Compose:

```yaml
# docker-compose.dev.yml
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

### Environment Variables

- `.env.example` checked into git with placeholder values
- `.env` gitignored, copied from `.env.example`
- One root `.env` for both frontend (Vite dotenv) and backend (Node `--env-file`)

```env
# .env.example
NODE_ENV=development
DATABASE_URL=postgresql://webshop:webshop@localhost:5432/webshop
PORT=3000
FRONTEND_URL=http://localhost:5173
ADMIN_API_KEY=change-me
BARION_POS_KEY=test-key
BARION_ENV=test
SZAMLAZZ_API_KEY=test-key
RESEND_API_KEY=re_test_xxx
```

---

## Environments

**Local and production only.** No staging for MVP — doubles infrastructure cost for a solo dev. Test locally, deploy to production.

| Variable | Local | Production |
|---|---|---|
| NODE_ENV | development | production |
| DATABASE_URL | local Docker Postgres | Managed Postgres URL |
| ADMIN_API_KEY | any string | Strong random value |
| BARION_POS_KEY | sandbox key | Live key |
| SZAMLAZZ_API_KEY | test key | Live key |
| FRONTEND_URL | http://localhost:5173 | https://yourdomain.hu |

---

## Deployment

### Recommended: PaaS (Railway + Vercel)

| Service | Platform | Cost | Region |
|---|---|---|---|
| Frontend | Vercel (free) | $0 | Frankfurt CDN |
| Backend | Railway ($5/mo) | $5 | Amsterdam |
| Database | Neon or Supabase (free) | $0 | Frankfurt |

Total: ~$5/month.

- Git-push deploys (both platforms integrate with GitHub)
- Automatic SSL
- Built-in logs
- EU regions selected explicitly

### Fallback: Hetzner VPS

- CX22: 2 vCPU, 4GB RAM, 40GB SSD — €4.51/month
- German datacenter (EU data residency)
- PM2 for Node.js process management
- Nginx reverse proxy
- Let's Encrypt via Certbot
- Setup time: 2-4 hours

---

## CI/CD — GitHub Actions

Single workflow, ~30 lines:

```yaml
# .github/workflows/ci.yml
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

Deployment is automatic via Vercel/Railway GitHub integrations — no deploy step in CI.

---

## Domain & SSL

- Register `.hu` domain via Rackforest or Dotroll (~€10-15/year)
- Or `.com`/`.eu` via Cloudflare Registrar
- DNS: Cloudflare (free) — CDN, DDoS protection, DNS management
- SSL: automatic on Vercel/Railway. Certbot on VPS.
- DNS records:
  - Root domain → Vercel (frontend)
  - `api.yourdomain.hu` → Railway (backend)

---

## Monitoring

| Concern | Tool | Cost | Setup |
|---|---|---|---|
| Uptime | UptimeRobot | Free (50 monitors) | 5 min |
| Errors | Sentry | Free (5K events/mo) | 30 min |
| Logging | Pino (structured JSON) | Free | 15 min |
| Log viewing | Railway built-in | Included | 0 min |

- Monitor `https://yourdomain.hu` and `https://api.yourdomain.hu/health`
- Sentry: `@sentry/node` (backend) + `@sentry/react` (frontend)

### Post-MVP (not now)
- APM (Datadog, New Relic)
- Log aggregation (Loki, Logtail)
- Analytics (Plausible or Umami self-hosted)

---

## Backups

- **Managed DB (Neon/Supabase)**: automatic daily backups on paid tiers
- **Additional**: daily `pg_dump` via GitHub Actions scheduled workflow → Backblaze B2 (free <10GB)
- **Retention**: 7 daily + 4 weekly
- **Test restores**: once per quarter
- **Secrets**: keep copy in password manager (Bitwarden), not in backup bucket

---

## Security

- **HTTP headers**: Helmet.js (one middleware call)
- **Rate limiting**: `@fastify/rate-limit` — 100/min global, 5/min auth, 10/min orders
- **DDoS**: Cloudflare free tier (proxy all traffic, hide origin IP)
- **Dependencies**: GitHub Dependabot with auto-merge for patch updates
- Never store card numbers — Barion handles PCI compliance
- Parameterized queries via Drizzle
- HttpOnly, Secure, SameSite cookies for any future auth
- Validate all input with Zod

---

## Setup Checklist

| Step | Task | Time |
|---|---|---|
| 1 | Set up pnpm workspace, project structure, dev scripts | 2h |
| 2 | Create `.env.example`, configure dotenv | 30min |
| 3 | Set up Vercel (frontend) and Railway (backend + DB) | 1h |
| 4 | Register domain, set up Cloudflare DNS | 1h |
| 5 | Write GitHub Actions CI workflow | 1h |
| 6 | Add helmet, rate limiting, Sentry, Pino | 1h |
| 7 | Set up UptimeRobot monitors | 15min |
| 8 | Configure database backups | 30min |

**Total ops setup: ~7 hours.** After that, push to `main` and it deploys.
