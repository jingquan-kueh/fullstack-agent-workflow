# Architecture

> Status: **template skeleton**. A Fastify API with `GET /api/health` backed by Postgres (via
> Drizzle), and a React + MUI app that shows it. TODO(setup): Replace with the project's status, and keep this line
> current as tickets land. Items marked _(proposed)_ are sensible defaults not yet confirmed;
> items marked _open_ are decisions not yet made (ask before building anything that needs one).

## Stack

| Layer          | Tool                                   | Purpose                                                     |
| -------------- | -------------------------------------- | ----------------------------------------------------------- |
| Runtime        | Node.js 24 (LTS)                       | API server, tooling, dev servers                            |
| Language       | TypeScript 6.0 strict                  | Throughout. Pinned < 6.1 for typescript-eslint support      |
| Monorepo       | npm workspaces (`backend`, `frontend`) | One root `package.json` + `package-lock.json`               |
| TS runner      | tsx                                    | Run `backend/src/*.ts` without a build step                 |
| Database       | Postgres 18                            | Primary data store. Local via `docker-compose.yml`          |
| DB driver      | `pg` (node-postgres)                   | Connection pool used by Drizzle                             |
| Data access    | Drizzle ORM                            | Schema + queries, behind `Database` in `backend/src/db/`    |
| Migrations     | drizzle-kit + Drizzle migrator         | `npm run db:generate` writes SQL, `npm run db:migrate` runs |
| HTTP framework | Fastify 5                              | Routes, zod request validation, central error handling      |
| Auth           | _open_                                 | TODO(setup): sessions, JWT, a provider, or none             |
| Validation     | zod                                    | Env vars, request bodies, API responses                     |
| Testing        | Vitest                                 | Unit tests; DB tests against real Postgres                  |
| Frontend       | Vite + React 19 + MUI v9               | Web app; dev server proxies `/api` to the backend           |
| Lint / format  | ESLint (typescript-eslint) + Prettier  | `npm run lint`, `npm run format:check`                      |
| CI             | GitHub Actions                         | `npm run check` with a Postgres service container           |
| Hosting/deploy | _open_                                 | TODO(setup): where the API, database and frontend run       |

Conventions to record once decided: primary key type (TODO(setup): e.g. `uuid` via
`gen_random_uuid()`, or `bigint` identity).

Migrations: edit `backend/src/db/schema.ts`, run `npm run db:generate` (writes a SQL file to
`backend/drizzle/`, no database needed), review and commit it, then `npm run db:migrate` applies
pending migrations to `DATABASE_URL`. Tests apply them automatically before running.

---

## Folder Structure

```
/
├── CLAUDE.md                     → AI instructions + guardrails
├── README.md
├── context/
│   ├── project-overview.md       → What and why
│   ├── architecture.md           → This file: stack, structure, boundaries, data flow
│   ├── code-standards.md         → Coding, database and API conventions
│   ├── ui-rules.md               → MUI usage rules for frontend/
│   ├── progress-tracker.md       → Tickets: one checkbox per issue/PR
│   └── library-docs.md           → MCP servers + where to look up library/API docs
├── plans/
│   └── YYYY-MM-DD-<slug>.md      → Approved feature plans (from /plan)
├── .claude/
│   └── commands/                 → /setup-project, /implement, /review, /finalize, /create-issue
├── .github/
│   ├── agent-prompt.md           → Instructions for the issue agent
│   ├── scripts/
│   │   └── screenshot.mjs        → Desktop + mobile screenshots of a screen
│   └── workflows/
│       ├── ci.yml                → npm run check on PRs, main and dispatch
│       └── agent.yml             → Issue agent: issue → branch + PR (+ screenshots)
├── .mcp.json                     → Project MCP servers (MUI docs)
├── docker-compose.yml            → Local Postgres
├── .env.example                  → Same keys as .env, empty or local-only values
├── .nvmrc                        → Node 24
├── tsconfig.base.json            → Shared strict compiler options
├── eslint.config.js              → Lint rules for backend + frontend
├── .prettierrc.json              → Formatting (single quotes, 100 cols)
├── package.json                  → Root; declares workspaces + shared scripts
├── backend/
│   ├── package.json
│   ├── drizzle.config.ts         → drizzle-kit config (used by db:generate)
│   ├── vitest.config.ts          → Test config: global setup loads .env, applies migrations
│   ├── drizzle/                  → Generated SQL migrations + drizzle-kit metadata (committed)
│   └── src/
│       ├── main.ts               → Entrypoint: env → db → Fastify app; graceful shutdown
│       ├── env.ts                → zod-validated env vars (+ test)
│       ├── app.ts                → buildApp: Fastify instance, error handling, routes (+ test)
│       ├── health.ts             → Health check logic (+ test)
│       ├── http/
│       │   └── zod.ts            → zod validator + type provider for route schemas (+ test)
│       ├── db/
│       │   ├── database.ts       → Database interface + Drizzle implementation (+ test)
│       │   ├── schema.ts         → Drizzle table definitions (source of truth for migrations)
│       │   └── migrate.ts        → Applies pending migrations (npm run db:migrate)
│       └── testing/
│           ├── fake-database.ts  → In-memory Database for unit tests
│           └── global-setup.ts   → Vitest global setup
└── frontend/
    ├── package.json
    ├── index.html
    ├── tsconfig*.json            → app (browser) + node (vite config) projects
    ├── vite.config.ts            → Dev server; proxies /api to the backend
    └── src/
        ├── main.tsx              → Root: ThemeProvider + CssBaseline
        ├── theme.ts              → MUI theme (see ui-rules.md)
        ├── App.tsx               → App shell
        ├── api/
        │   ├── health.ts         → GET /api/health, validated (+ test)
        │   └── useHealth.ts      → Hook: loading / error / success state
        └── pages/
            └── HomePage.tsx      → Placeholder: API + database status
```

As features land, the backend grows per feature or per layer (TODO(setup): pick one, e.g.
`backend/src/<feature>/{routes,service,repository}.ts`), and the frontend gets one
`api/<resource>.ts` + hook and one page per screen.

---

## System Boundaries

| Folder / module                   | Owns                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `backend/src/main.ts`             | Wiring only: load env, build dependencies, start the server.                                   |
| `backend/src/app.ts` (routes)     | HTTP only (Fastify): validate the request with zod, call logic, map result to response.        |
| Business logic (e.g. `health.ts`) | Rules and decisions. Depends on interfaces like `Database`, never on Drizzle, `pg` or Fastify. |
| `backend/src/db/` (data access)   | The only code that talks to Postgres (Drizzle). Queries, transactions, row mapping.            |
| `backend/src/env.ts`              | The only code that reads `process.env`.                                                        |
| `frontend/src/api/`               | The only frontend code that calls the API. Validates every response with zod.                  |
| `frontend/src/pages/`, components | Presentational. Get data from hooks in `api/`, never call `fetch` directly.                    |

---

## Data Flow

### Request

```
Browser → GET /api/... (same origin)
        ↓  Vite dev server proxy (dev) / TODO(setup): reverse proxy or host (prod)
backend: Fastify route (app.ts) → zod validates request (400 on failure)
        ↓
business logic (pure where possible)
        ↓
db/database.ts → Drizzle → Postgres (parameterised, in a transaction when several writes)
        ↓
JSON response → frontend/src/api/<resource>.ts validates → hook state → page renders
```

### Local development

```
npm run db:up             → Postgres in Docker (docker-compose.yml)
npm run db:migrate        → Apply pending migrations
npm run dev -w backend    → API on PORT (default 3000), restarts on change
npm run dev -w frontend   → Vite on 5173, proxies /api → API
```

---

## Environments and secrets

| Variable       | Used by        | Notes                                                         |
| -------------- | -------------- | ------------------------------------------------------------- |
| `DATABASE_URL` | backend        | Required. Holds a password: never log it.                     |
| `PORT`         | backend, Vite  | API port, default 3000. Vite reads it to know where to proxy. |
| `DB_PORT`      | docker compose | Host port for local Postgres, default 5432.                   |

Validated at startup by `backend/src/env.ts`. Add each new variable here and to
`.env.example` in the change that introduces it.
