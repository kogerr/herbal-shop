# Claude Code Guidelines — Herbal Ointment Webshop

## Project Overview

A webshop for herbal ointments targeting the Hungarian market. React + Vite + MUI frontend, Fastify + TypeScript backend, PostgreSQL database, Barion payment, Szamlazz.hu invoicing.

## Monorepo Structure

```
packages/
├── frontend/    # React + Vite + MUI
├── backend/     # Fastify + TypeScript
└── shared/      # Shared types, Zod schemas
```

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (LTS) + TypeScript |
| Frontend | React 19, Vite, MUI v7, React Router v7 |
| Backend | Fastify |
| Database | PostgreSQL + Drizzle ORM |
| Server state | TanStack Query v5 |
| Client state | Zustand (cart, persisted to localStorage) |
| Validation | Zod (shared schemas) |
| Payment | Barion (`node-barion`) |
| Invoicing | Szamlazz.hu (`szamlazz.js`) |
| Email | Resend |
| Testing | Vitest + Testing Library (unit), Playwright (e2e) |
| Package manager | pnpm |

## Code Style

Follow the coding guidelines in `.claude/rules/` and `docs/CODING_GUIDELINES.md`.

Key rules:
- Always use arrow functions for components, handlers, and helpers
- Use `type` over `interface` for props
- Never use `any` — use `unknown` or specific types
- Destructure props in function signatures
- `data-test-id` values use camelCase
- Event handler props: `on*`. Handler functions: `handle*`
- Functions: `verbNoun` naming (`getProducts`, not `productData`)
- Always use braces in `if`/`else`, even single-line
- No JSDoc comments — code should be self-documenting
- Remove all dead code (unused imports, variables, functions)
- Use `sx` prop instead of `style` prop for MUI components

## Commits

- Ask before committing; do not commit automatically
- Never push without explicit permission
- Prefer revert commits over force-push / rewriting history

## After Each Significant Change

- Run ESLint: `pnpm lint`
- Run TypeScript check: `pnpm typecheck`

## Hungarian-Specific Notes

- All user-facing text is in Hungarian (no i18n for MVP)
- Currency: HUF (Hungarian Forint), stored as integer (no decimals)
- Format prices with `Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 })`
- Zip codes: exactly 4 digits
- Phone: accept +36 or 06 prefix
- VAT: 27% standard rate (verify with accountant)

## Key Documentation

- `docs/MVP_PLAN.md` — Full MVP plan, architecture, scope, roadmap
- `docs/STACK_EVALUATION.md` — Technology comparisons and decisions
- `docs/PAYMENT_AND_BILLING.md` — Barion, Szamlazz.hu, compliance details
- `docs/CODING_GUIDELINES.md` — Detailed coding conventions
