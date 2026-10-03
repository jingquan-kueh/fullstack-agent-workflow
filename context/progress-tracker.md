# Progress Tracker

Tracks the current phase defined in `project-overview.md` → "Current phase". Design details live
in `architecture.md`; this file only tracks what is built.

## How to use

- **One checkbox = one ticket = one GitHub issue = one branch = one PR.** A ticket is mergeable to
  `main` on its own with the check command passing, owns one concern (usually one boundary from
  `architecture.md`), ships with its tests, migrations and `context/` updates, and is reviewable in
  one sitting.
- Tick the box in the PR that completes the ticket, and add the PR number: `- [x] **T03 …** (#12)`.
- **Owner:** `agent` = the issue agent can do it unattended. `human` = touches `.github/` (the
  agent's token cannot push workflow changes), needs a secret or an external account, or needs
  someone to run and watch it.
- **Schema change:** the ticket adds or changes a migration. Its issue must spell out the exact
  tables, columns, types, constraints and what happens to existing rows, or the agent will stop
  and ask.
- **Open:** a value, rule or technology choice to settle before (or while) writing the issue.
- If a ticket turns out bigger than one PR, split it here first.

Ticket format:

```
- [ ] **T01 · Short name** — agent · depends on: — · schema change
  - What to build, per file or boundary, with exact values.
  - Done when: checkable outcomes.
  - **Open:** anything still to decide.
```

## Status

TODO(setup): e.g. "Scaffolded. 1 of N tickets done. **Ready now:** T01, T02."

## Done

- [x] **T00 · Scaffold** — human
  - Tooling (TS, ESLint, Prettier, Vitest), npm workspaces, zod env validation, Postgres via
    docker compose, Fastify API with `GET /api/health`, Drizzle data access and migrations,
    React + MUI shell showing it, CI workflow with a Postgres service, issue agent workflow,
    `context/` docs.

## Phase 1

TODO(setup): The first phase's tickets, from `/setup-project`. Adopting each decided stack choice
from `architecture.md` (auth, hosting) is usually its own early ticket.
