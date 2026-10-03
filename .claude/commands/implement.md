---
description: Implement a plan, a tracker ticket or a small goal on a feature branch
argument-hint: '[plans/<file>.md | T01 | <goal>]'
---

Implement `$ARGUMENTS`. It is one of:

- **A plan file** (`plans/<file>.md`): the plan is the spec.
- **A tracker ticket** (`T01`, or "T01 from the progress tracker"): the ticket in
  `context/progress-tracker.md` is the spec (scope, "Done when", dependencies).
- **A goal** in plain words: a small fix or tweak, with no plan.
- **Nothing**: use the most recently modified file in `plans/` and say which one you picked.

1. Read the spec. Stop and say so before writing code if:
   - the spec conflicts with the guardrails or `context/`;
   - a ticket depends on tickets not yet ticked, or has an **Open** item that neither
     `$ARGUMENTS` nor this conversation settles (ask it, with your recommendation);
   - a goal turns out bigger than one ticket, or the approach is not obvious (suggest `/plan`);
   - it needs a technology choice that `context/architecture.md` still lists as open (ask, with
     your recommendation, and record the decision there).
2. If you are on `main`, create a branch first: `feat/<plan-slug>` for a plan, `feat/t01-<slug>`
   for a ticket (keep the ticket ID in the name), `fix/<slug>` or `feat/<slug>` for a goal. Never
   commit to `main` unless explicitly told so.
3. Build exactly what the spec says. If it turns out to be wrong or incomplete, stop and explain
   rather than improvising. A small, obvious gap may be filled if you call it out.
4. Schema changes go in a new migration (see `context/code-standards.md` → "Database"). Never edit
   a migration that has already been merged.
5. Add tests for all business logic, named after behaviour (see `context/code-standards.md`).
6. If the change alters architecture, scope or conventions, update the relevant `context/` file.
7. Run `npm run check` and fix until it passes.
8. For `frontend/` changes, run the app (`npm run db:up`, `npm run db:migrate`,
   `npm run dev -w backend`, `npm run dev -w frontend`) and look at the affected screens.
9. Tick off what is done: completed items in the plan file, or the ticket's checkbox in the
   tracker. For a ticket, replace any **Open** item you settled with the decision.

Finish with: what changed (per file), any deviations from the spec, and the `npm run check`
result. Do not commit; that is `/finalize`.
