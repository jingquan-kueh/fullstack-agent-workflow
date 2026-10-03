---
description: Interview the developer and fill in every TODO(setup) marker for a new project
argument-hint: '[short description of the project]'
---

Turn this template into a specific project. `$ARGUMENTS`, if given, is a first description of it.
You fill in documents and names only: no features, no new dependencies, no stack changes. Stack
decisions are recorded here and built later as tickets.

## 1. Find what is left

```
grep -rn "TODO(setup):" --exclude-dir=node_modules --exclude-dir=.git .
```

Every match is a gap to fill. If there are none, say the project is already set up and stop.

## 2. Interview

Ask in rounds, one message per round. Give each question your recommendation (from
`$ARGUMENTS`, the answers so far, and the defaults already in `context/`), so the developer can
reply "yes" to most of it. Do not move on while an answer the documents need is missing.

1. **Product**: name, one-liner, problem, users, goals, non-goals, and the scope of the first
   phase (what the MVP must do, and what it must not).
2. **Guardrails**: domain rules no task may ever break (data that must never leave the system,
   actions that must never happen automatically, environments the agent must never touch).
   Personal or payment data stored? Each guardrail must be checkable in review.
3. **Stack decisions**: every row marked _open_ in `context/architecture.md` → "Stack" (auth,
   hosting and deploy, and anything the product needs: background jobs, email, file storage,
   payments). Recommend one option per row, with one line on why. "Decide later" is a valid
   answer: the row stays open and becomes an **Open** item on the ticket that first needs it.
   The filled-in rows (Fastify, Drizzle, React + MUI, …) are template defaults: keep them unless
   the developer asks to swap one, which is then its own early ticket.
4. **UI**: the screens of the first phase, navigation (tabs for a few screens, a router beyond
   that), domain display rules (money, dates and time zones, units, status colours), and any design
   reference (Figma, screenshots, an existing product to match).
5. **Tickets**: propose the first phase as tickets in `context/progress-tracker.md` format (see
   its "How to use"): one ticket per PR, dependencies, owner (`agent` or `human`), and **Open**
   items. Adopting each decided stack choice (e.g. auth) is its own early ticket. Revise until
   the developer approves the list.

## 3. Write

- `CLAUDE.md`: title, one-liner, project guardrails (keep the generic ones unless the developer
  drops them).
- `context/project-overview.md`: every section.
- `context/architecture.md`: the stack table (decided rows filled in, undecided ones left _open_),
  status line, and anything decided about boundaries and data flow. Do not describe code that does
  not exist yet; mark planned parts _(planned)_.
- `context/ui-rules.md`: screens, navigation, domain data display rules.
- `context/library-docs.md`: MCP servers or docs sites for the chosen libraries and external APIs.
- `context/progress-tracker.md`: the approved phases and tickets, and the status line.
- `.github/agent-prompt.md`: the screens list, and any project-specific "stop and ask" cases that
  follow from the guardrails.
- `.github/workflows/agent.yml`: the cron schedule, if the developer wants a different time zone.
- Names: the root `package.json` `name`, the `@app/` workspace scope in `backend/package.json` and
  `frontend/package.json` (then run `npm install` so `package-lock.json` follows), the `<title>` in
  `frontend/index.html` and the app bar title in `frontend/src/App.tsx`.
- `README.md`: replace the template's README with a short one for the project (what it is, how to
  run it locally, how work flows: point at `CLAUDE.md`). Keep the "One-time GitHub setup" section
  until the developer confirms it is done.

## 4. Check

- Run the grep from step 1 again. No `TODO(setup):` may remain outside this file.
- `npm run check` passes.

Finish with: what was filled in (per file), the stack decisions recorded and those left open, and
the next steps: the initial commit (a fresh repo has no `main` to open a PR against, so the first
commit is the one that may go straight to `main`), the one-time GitHub setup in `README.md`, then
`/create-issue T01` or `/implement T01`. Do not commit anything yourself.
