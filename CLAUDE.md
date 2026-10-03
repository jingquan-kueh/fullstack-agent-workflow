# TODO(setup): Project name

TODO(setup): One sentence on what this is and who it is for.

Full-stack TypeScript: Node.js API (`backend/`), Postgres, React + MUI web app (`frontend/`).

## Read first

Before starting any task, read the `context/` files in this order:

- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/ui-rules.md` (for any `frontend/` work)
- `context/library-docs.md` (before using any MCP server or looking up library / API docs)

If a request conflicts with these files, point out the conflict before proceeding. When a change
alters the architecture, scope or conventions, update the relevant `context/` file in the same
change.

If any file still contains `TODO(setup)` markers, the project has not been set up yet: suggest
`/setup-project` before building features.

## Guardrails (never break)

<!-- Project-specific rules that no task may break, each one checkable in review. /setup-project
fills these in. Keep the generic ones below unless you have a reason to drop them. -->

- TODO(setup): Domain guardrails (e.g. "Never send real emails outside production", "Never store
  card numbers").
- **No secrets in output.** Never print secrets, connection strings, tokens or raw payloads that
  may hold personal data in logs, errors, issues or PRs. Never put secrets in `VITE_*` variables or
  client code.
- **Database changes go through migrations.** Never change a schema by hand or run destructive SQL
  (`DROP`, `TRUNCATE`, unscoped `DELETE`/`UPDATE`) against any database other than a local or CI
  one.
- **Never commit or push to `main`.** Everything reaches `main` through a reviewed pull request.

## Development workflow

Work happens in one of two ways. Both end in a pull request to `main`. Never commit or push to
`main` directly: `main` only receives code that passed CI (`.github/workflows/ci.yml`).

"Done" always means `npm run check` passes (typecheck, lint, format check, tests).

### 0. New project

`/setup-project` interviews the developer and fills in every `TODO(setup)` marker: this file, the
`context/` docs, the first tickets in `context/progress-tracker.md` and the package names. Run it
once, right after creating the repo from this template.

### 1. Local session (Claude Code in the IDE)

Every change goes through the same steps, one command each. Stop after each step for the
developer.

- **Small change** (one ticket from `context/progress-tracker.md`, or a fix or tweak with an
  obvious approach): skip the plan. Start at step 2 with the ticket or goal, e.g. `/implement T01`.
- **Larger feature** (the approach needs agreeing first): start at step 1.

1. **`/plan <goal>`**: Claude Code's built-in plan mode (read-only). Write a plan with these
   sections: Goal, Context read, Approach, Files to change (per file), Database changes
   (migrations, data backfills, or "none"), Tests, Impact (schema, existing data, security,
   guardrails checked), Out of scope, Open questions. Once the developer approves it, save it to
   `plans/YYYY-MM-DD-<slug>.md` and **stop**. Do not start coding.
2. **`/implement <plan file | ticket | goal>`**: build exactly what the plan, ticket or goal says,
   with tests, on a feature branch. Uncommitted until step 4.
3. **`/review`**: review the branch against the guardrails, data safety, the plan or ticket and
   the `context/` standards. Report findings, then fix only the ones the developer picks.
4. **`/finalize`**: commit on the feature branch, push, open a PR (plan file included). Never
   merge.

The command definitions live in `.claude/commands/`.

### 2. GitHub issue agent (unattended)

`.github/workflows/agent.yml` runs Claude Code in GitHub Actions against one issue at a time:

1. Picks an issue: the nightly sweep takes the oldest open issue labelled `agent`, or an issue
   runs at once when labelled `agent:execute-now`.
2. The agent reads the issue, then either asks questions (`agent:needs-info`) or implements it on
   `agent/issue-<n>-<slug>` with tests and `npm run check`.
3. If the diff touches `frontend/`, it screenshots the affected screens (desktop + mobile). The
   workflow publishes them to the orphan `screenshots` branch and links them on the PR.
4. The agent opens a PR, then the workflow triggers CI on that branch.

The agent's full instructions are in `.github/agent-prompt.md`. Write issues the agent can finish
without asking: exact behaviour, exact values (names, limits, wording, columns) and what "done"
looks like. `/create-issue <ticket | goal>` drafts one in that shape and creates it on GitHub only
after the developer approves.

**Agent safety.** The agent job gets a throwaway Postgres service container and no production
credentials. It must never print env values, connect to any other database, or merge. A human
reviews and merges every PR.
