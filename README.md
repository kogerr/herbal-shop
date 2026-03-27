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
