---
description: Review this branch's changes before finalizing
---

Review everything on this branch that is not on `main`: `git diff main...HEAD` plus uncommitted
and untracked changes. Check, in this order:

1. **Guardrails** in `CLAUDE.md`: every project guardrail, no secrets in output or client code,
   schema changes only through migrations.
2. **Security**: input validated at the boundary, queries parameterised (no SQL built from
   strings), every endpoint that reads or writes user data checks who is asking, errors returned to
   clients carry no internals.
3. **Data safety**: migrations are new files (never edits to merged ones), safe to run on a table
   with data (defaults for new `NOT NULL` columns, no silent data loss), multi-statement writes in
   a transaction, external side effects idempotent.
4. **Correctness**: bugs, unhandled cases, time zone, rounding and off-by-one mistakes, race
   conditions between concurrent requests.
5. **The spec**: the plan (latest matching file in `plans/`) or the ticket named in the branch
   (`feat/t01-…` → T01 in `context/progress-tracker.md`), if any: anything missing, or built
   beyond it.
6. **Standards**: `context/code-standards.md`, plus `context/ui-rules.md` for web app code.
7. **Tests**: business logic covered, tests named after behaviour, database code tested against
   real Postgres where a fake would hide the bug.

Run the check command (`CLAUDE.md` → "Commands and paths") and include the result.

Report findings ranked most severe first, each with `file:line`, what is wrong and a concrete
failure case. Then ask which to fix. Do not change code until the developer answers.
