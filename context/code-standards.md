# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

## Principles

Operate as a senior software engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Clarity over cleverness.** Code is read far more often than it is written. Prefer the obvious
  solution unless there is a measured reason not to.
- **Small, focused units.** A function does one thing; a module owns one concern. If a name needs
  "and" in it, split it.
- **Make illegal states unrepresentable.** Use types, enums and validation to rule out bad data
  instead of checking for it everywhere.
- **Pure core, thin shell.** Keep business logic in pure functions (no network, filesystem, clock
  or randomness). Push I/O to the edges and pass its results in. This keeps logic testable.
- **Depend on interfaces at boundaries.** External services (APIs, databases, email, payment
  providers) sit behind a small interface so they can be faked in tests or swapped later.
- **YAGNI.** Build what the current phase needs. No speculative abstractions, config flags or
  plugin systems "for later".

## Naming

- Names describe intent, not implementation: `activeUsers`, not `filteredList`.
- Booleans read as questions: `isOpen`, `hasFilled`, `shouldRetry`.
- Functions are verbs (`createInvoice`), values are nouns (`invoice`).
- Include units in names when a number has one: `timeoutMs`, `priceUsd`, `discountPct`.
- Avoid abbreviations unless they are standard in the domain.

## Functions and modules

- Prefer named exports. Avoid default exports.
- Prefer plain functions and data over classes, unless a class clearly helps (e.g. encapsulating
  a stateful client).
- Keep functions short enough to read without scrolling. Extract when a block needs a comment to
  explain what it does.
- Limit parameters; pass an options object when there are more than ~3 or when args are easy to
  mix up.
- No hidden side effects. A function named `getX` must not write anything.

## Types and validation

- Avoid escape hatches (`any`, unchecked casts, `# type: ignore`). If one is unavoidable, isolate
  it and leave a comment explaining why.
- **Validate all external input at the boundary**: environment variables, config files, API
  responses, user input, files read from disk. Parse into typed values once; trust them inside.
- Derive types from schemas where possible so the two cannot drift.

## Error handling

- Fail loudly and early. Do not swallow errors or return silent defaults.
- Throw/return errors with enough context to debug (what was attempted, with which identifiers),
  but never include secrets.
- Handle errors at the level that can do something useful about them; otherwise let them
  propagate.
- Top-level entrypoints catch everything, log it, record it, and exit non-zero.
- Retries are explicit, bounded, and only for operations that are safe to repeat.

## Side effects and reliability

- Operations that change external state (payments, emails, webhooks, writes) must be
  **idempotent** or guarded so a retry cannot double-apply them.
- Prefer deterministic IDs for external writes so duplicates can be detected.
- Be explicit about time zones. Store timestamps in UTC (ISO 8601); convert only for display or
  where domain logic requires a specific zone.
- Never use floating point for money without an explicit rounding rule.

## Testing

- Every change to business logic comes with tests.
- Test pure logic with unit tests using small, synthetic, hand-readable inputs.
- Test behaviour, not implementation details. A refactor should not break tests.
- Name tests after the behaviour: `"rejects a booking that overlaps an existing one"`.
- Fake external services through their interface; do not hit real services in unit tests.
- Code whose correctness depends on SQL (queries, constraints, transactions, migrations) is tested
  against real Postgres (`npm run db:up` locally, the service container in CI), not a fake. Each
  test owns its data: create what it needs and clean up, or run inside a rolled-back transaction.
- A bug fix starts with a failing test that reproduces it.

## Database (Postgres)

- **Schema changes only through migrations**, committed with the code that needs them. Never edit
  a migration that has been merged; add a new one.
- Migration workflow (Drizzle): change `backend/src/db/schema.ts`, run `npm run db:generate`,
  read the generated SQL in `backend/drizzle/` (add backfills or split steps by hand there before
  it is merged), commit both, then `npm run db:migrate`. Never use `drizzle-kit push`; it changes
  the schema without a migration file.
- Migrations must be safe on a table that already has rows: a new `NOT NULL` column gets a default
  or a backfill, renames and drops happen in steps (add, migrate, then remove in a later change).
- Let the database enforce invariants it can: `NOT NULL`, foreign keys, `UNIQUE`, `CHECK`.
  Application checks alone are not enough under concurrent requests.
- Queries are always parameterised. Use the Drizzle query builder, or the `` sql`…` `` template
  (which parameterises `${values}`) when the builder cannot express it. Never pass input to
  `sql.raw` or build SQL by concatenating strings.
- Writes that must succeed or fail together run in one transaction.
- Only the data-access layer (see `architecture.md` → "System Boundaries") talks to Postgres.
  Route handlers and business logic go through it.
- Primary keys: one convention for the whole schema, recorded in `architecture.md`.
- Timestamps: `timestamptz`, stored in UTC. Money: `numeric` (or integer minor units), never
  `float`/`real`.
- Name tables and columns in `snake_case`; map to `camelCase` at the data-access boundary. Drizzle
  does this: declare columns in camelCase in `schema.ts` and the `snake_case` casing option names
  them in Postgres.
- Watch for N+1 queries in list endpoints; fetch related rows in one query.

## HTTP API

- Validate every request (params, query, body) at the route with a schema; reject with `400` and
  a message naming the invalid fields. In Fastify, declare zod schemas in the route's `schema`
  option (`params`, `querystring`, `body`); the validator in `backend/src/http/zod.ts` types the
  request and the central error handler in `app.ts` sends the `400`.
- Validate responses from third-party APIs the same way before using them.
- Status codes mean what they say: `400` bad input, `401` not signed in, `403` not allowed, `404`
  not found, `409` conflict, `500` our bug. Error bodies are JSON (`{ "error": "..." }`) and never
  include stack traces, SQL or driver messages. Throw from handlers and let the central error
  handler in `app.ts` map unexpected errors to `500`; do not catch-and-reply in each route.
- Every endpoint that reads or writes user data checks who is asking, on the server. Hiding a
  button in the UI is not authorisation.
- The frontend calls the API through same-origin `/api/...` paths; it never talks to Postgres or
  holds secrets.

## Comments and documentation

- Comments explain **why**, not what. The code says what.
- Explain non-obvious domain logic, workarounds, and anything that looks wrong but is intentional.
- Delete commented-out code; version control remembers it.
- Keep `README` / `context/` docs updated in the same change that makes them stale.

## Dependencies

- Add a dependency only when it saves meaningful effort or risk. Prefer the standard library and
  well-maintained, widely used packages.
- Pin versions via the lockfile; commit the lockfile.
- Note why a non-obvious dependency was added (commit message or doc).

## Security and secrets

- Secrets live in environment variables or a secret manager, never in code, never committed.
- Commit an `.env.example` with keys and empty values; git-ignore the real `.env`.
- Never log secrets, tokens, full account numbers, or raw payloads that may contain them.
- Never expose secrets to client-side code.
- Least privilege: grant CI jobs, tokens and API keys only the permissions they need.

## Formatting and tooling

- Use the project's formatter and linter; do not hand-format or argue style in review.
- Code must pass typecheck, lint and tests before it is considered done.

## Git and commits

- Small, focused commits. One logical change per commit.
- Commit messages: imperative summary line (`Add retry to webhook delivery`), then a body explaining
  why if it is not obvious.
- Do not commit generated files, build output, or local environment files unless the project
  explicitly says so.
