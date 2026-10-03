---
description: Fill in every TODO(setup) marker, for a new project or one that adopted this workflow
argument-hint: '[short description of the project] [template checkout path, when adopting]'
---

Turn this template into a specific project. `$ARGUMENTS`, if given, is a first description of it
and, for an existing project, the path of the template checkout it was copied from. You fill in
documents, names and workflow config only: no features, no stack changes. Stack decisions are
recorded here and built later as tickets.

## 1. Find what is left, and which mode

```
grep -rn "TODO(setup):" --exclude-dir=node_modules --exclude-dir=.git .
```

Every match is a gap to fill. If there are none, say the project is already set up and stop.

Then pick the mode, and say which one you picked:

- **New project**: the code is still the template skeleton (`backend/src/health.ts`,
  `frontend/src/pages/HomePage.tsx`, nothing else built).
- **Existing project**: anything else. The workflow files were copied into a codebase that already
  exists (README → "Add to an existing project"). If unsure, ask.

## 2. Survey (existing project only)

Read the codebase before asking anything, so the interview confirms instead of asks. Note the
evidence (file and line) for each finding.

- **Commands**: package manager, workspace layout, and the scripts that typecheck, lint, check
  formatting, test, run migrations, start the database, the API and the web app (with ports).
- **Stack**: every row of `context/architecture.md` → "Stack": runtime and Node version, HTTP
  framework, database, driver, ORM or query builder, migration tool, validation, auth, test
  runner, UI library, routing, hosting.
- **Structure**: folders for API and web app code, how code is grouped (per feature or per
  layer), where data access lives, where env vars are read.
- **Conventions**: sample a few files per area. Where the code consistently differs from
  `context/code-standards.md` or `context/ui-rules.md` (default exports, error format, primary
  keys, styling approach), note it.
- **Existing docs and CI**: README, CONTRIBUTING, `docs/`, existing workflows under
  `.github/workflows/`, Docker or compose files, `.env.example`.
- **Files the copy skipped**: the copy never overwrites, so any workflow file the repo already had
  (`CLAUDE.md`, `.mcp.json`, `.github/workflows/ci.yml`, …) is still the repo's own. Compare each
  with the template checkout (ask for its path if `$ARGUMENTS` does not give it).

## 3. Interview

Ask in rounds, one message per round. Give each question your recommendation (from
`$ARGUMENTS`, the survey, the answers so far, and the defaults already in `context/`), so the
developer can reply "yes" to most of it. Do not move on while an answer the documents need is
missing.

1. **Product**: name, one-liner, problem, users, goals, non-goals, and the scope of the first
   phase (what the MVP must do, and what it must not). For an existing project: what already
   works, and what the next phase adds.
2. **Guardrails**: domain rules no task may ever break (data that must never leave the system,
   actions that must never happen automatically, environments the agent must never touch).
   Personal or payment data stored? Each guardrail must be checkable in review. For an existing
   project, propose the rules already written in its docs or its own `CLAUDE.md`.
3. **Stack decisions**: every row marked _open_ in `context/architecture.md` → "Stack" (auth,
   hosting and deploy, and anything the product needs: background jobs, email, file storage,
   payments). Recommend one option per row, with one line on why. "Decide later" is a valid
   answer: the row stays open and becomes an **Open** item on the ticket that first needs it.
   - New project: the filled-in rows (Fastify, Drizzle, React + MUI, …) are template defaults:
     keep them unless the developer asks to swap one, which is then its own early ticket.
   - Existing project: rows come from the survey; confirm them rather than ask.
4. **Workflow fit** (existing project only):
   - The "Commands and paths" table for `CLAUDE.md`. If no single command runs typecheck, lint,
     format check and tests, propose adding a `check` script that chains the existing ones.
   - Each convention where the code differs from `context/` (step 2): keep the codebase's
     convention (the default; the standard is rewritten to match) or adopt the template's going
     forward (existing code is then left alone until a ticket touches it).
   - CI: adapt the template's `ci.yml`, or keep the existing workflow. The issue agent needs a CI
     workflow it can start with `workflow_dispatch`.
   - The throwaway database the agent and CI need (image, credentials, how migrations run), and
     any dev-only env vars the app needs to start.
5. **UI**: the screens of the first phase, navigation (tabs for a few screens, a router beyond
   that), domain display rules (money, dates and time zones, units, status colours), and any design
   reference (Figma, screenshots, an existing product to match). For an existing project, list the
   screens that exist and how each is reached.
6. **Tickets**: propose the first phase as tickets in `context/progress-tracker.md` format (see
   its "How to use"): one ticket per PR, dependencies, owner (`agent` or `human`), and **Open**
   items. Adopting each decided stack choice (e.g. auth) is its own early ticket. Revise until
   the developer approves the list.

## 4. Write

Both modes:

- `CLAUDE.md`: title, one-liner, the stack line under it, project guardrails (keep the generic
  ones unless the developer drops them).
- `context/project-overview.md`: every section.
- `context/architecture.md`: the stack table (decided rows filled in, undecided ones left _open_),
  status line, and anything decided about boundaries and data flow.
- `context/ui-rules.md`: screens, navigation, domain data display rules.
- `context/library-docs.md`: MCP servers or docs sites for the chosen libraries and external APIs.
- `context/progress-tracker.md`: the approved phases and tickets, and the status line.
- `.github/agent-prompt.md`: the screens list, and any project-specific "stop and ask" cases that
  follow from the guardrails.
- `.github/workflows/agent.yml`: the cron schedule, if the developer wants a different time zone.

New project only:

- `context/architecture.md`: do not describe code that does not exist yet; mark planned parts
  _(planned)_.
- Names: the root `package.json` `name`, the `@app/` workspace scope in `backend/package.json` and
  `frontend/package.json` (then run `npm install` so `package-lock.json` follows), the `<title>` in
  `frontend/index.html` and the app bar title in `frontend/src/App.tsx`.
- `README.md`: replace the template's README with a short one for the project (what it is, how to
  run it locally, how work flows: point at `CLAUDE.md`). Keep the "One-time GitHub setup" section
  until the developer confirms it is done.

Existing project only. Every library, command and path in the copied files is the template's
default until you rewrite it to match this codebase:

- `CLAUDE.md`: the "Commands and paths" table and the stack line. If the repo had its own
  `CLAUDE.md`, merge it into the template's structure: its rules go to Guardrails,
  `context/code-standards.md` or the section they belong to; nothing is dropped without asking.
- `context/architecture.md`: describe the code as it is: folder structure from the real tree,
  boundaries and data flow as they actually work, env vars from the code. Where the code does not
  follow a boundary, say so plainly; fixing it is a ticket, not part of setup.
- `context/code-standards.md`: keep the general sections; rewrite the library-specific parts
  ("Database" migration workflow and query rules, "HTTP API", test database setup) for this
  codebase's libraries, and apply the convention decisions from step 3.
- `context/ui-rules.md`: rewrite "Versions", "Looking things up", "Theme", "Styling" and
  "Components" for the UI library in use, and any MUI component named in the other sections.
- `context/library-docs.md` and `.mcp.json`: the docs and MCP servers for the libraries in use.
  Drop `mui-mcp` if the project does not use MUI; merge with an existing `.mcp.json`.
- `context/progress-tracker.md`: replace "T00 · Scaffold" with "T00 · Existing codebase": a short
  summary of what exists on the day of adoption.
- `.github/agent-prompt.md`: the environment section (runtime, database) to match `agent.yml`.
- `.github/workflows/ci.yml` and `agent.yml`: Node version source, package manager install and
  cache, database service and `DATABASE_URL` (or what the app uses instead), other dev-only env,
  and the CI workflow file `agent.yml` starts. If the repo keeps its own CI, delete the template's
  `ci.yml` and add `workflow_dispatch` to the existing one.
- `playwright`: the screenshot helper imports it. Add it as a pinned dev dependency at the
  workspace root if the repo does not have it; this is the one dependency setup may add.
- `.gitignore`: add `screenshots/`.
- `README.md`: keep the project's README. Add a short "Development workflow" section pointing at
  `CLAUDE.md`, and the template's "One-time GitHub setup" section until the developer confirms it
  is done.

## 5. Check

- Run the grep from step 1 again. No `TODO(setup):` may remain outside this file.
- Existing project: every match of the line below must be true of this codebase (or be this
  file); rewrite the ones that are not.

  ```
  grep -rnE "Drizzle|drizzle|Fastify|MUI|@mui|Vite|Vitest|npm (run|ci)|-w (backend|frontend)|backend/|frontend/|Postgres|5173|\.nvmrc" CLAUDE.md context .claude/commands .github .mcp.json
  ```

- The check command passes.

Finish with: the mode, what was filled in (per file), the stack decisions recorded and those left
open, and the next steps:

- New project: the initial commit (a fresh repo has no `main` to open a PR against, so the first
  commit is the one that may go straight to `main`), the one-time GitHub setup in `README.md`, then
  `/create-issue T01` or `/implement T01`.
- Existing project: `main` already exists, so the adoption goes through a pull request like any
  other change (`/finalize`). Then the one-time GitHub setup, then the first ticket.

Do not commit anything yourself.
