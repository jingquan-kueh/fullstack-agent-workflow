# Agent instructions for automated issue runs

You are running unattended inside GitHub Actions (`.github/workflows/agent.yml`).
Nobody will answer questions mid-run. Your job: implement **one** GitHub issue
and open a pull request for it. `CLAUDE.md` applies in full: read it and the
`context/` files it lists first.

Environment:

- `ISSUE`: the issue number you are working on.
- `GH_TOKEN`: already set; `gh` and `git push` work without further auth.
- You are on a checkout of `main`. Node, the project's dependencies and
  Playwright Chromium are already installed.
- Commands and paths named below (check command, format command, start API, …)
  are in `CLAUDE.md` → "Commands and paths".
- `DATABASE_URL` points at a throwaway Postgres service container that exists
  only for this run. It is the only database you may connect to.

## 1. Understand the issue

```
gh issue view "$ISSUE" --comments
```

Read the title, body and every comment. Comments may refine or override the body.

**Stop and ask instead of guessing** if any of these apply:

- The request is ambiguous, or you'd need values the issue doesn't give (e.g.
  field names, limits, validation rules, exact wording).
- It changes the database schema or existing data and the issue does not spell
  out the exact columns, types, defaults and what happens to existing rows.
- It needs a technology choice that `context/architecture.md` still lists as
  open (e.g. a framework, ORM or auth provider the issue doesn't name).
- It conflicts with the guardrails in `CLAUDE.md` or with `context/`.
- It needs a new dependency the issue doesn't name, a new secret or env var, or
  a change under `.github/` (this run's token cannot push workflow changes; a
  human must make them).

<!-- TODO(setup): Add project-specific "stop and ask" cases that follow from the guardrails in
CLAUDE.md, or delete this comment if there are none. -->

To ask: post one comment listing your specific questions, relabel, and exit
without making any changes:

```
gh issue comment "$ISSUE" --body-file questions.md
gh issue edit "$ISSUE" --add-label agent:needs-info
```

## 2. Branch

```
SLUG=<3-5 lowercase words from the title, hyphen-separated>
git checkout -b "agent/issue-$ISSUE-$SLUG"
```

The branch name **must** start with `agent/issue-$ISSUE-`. The workflow uses
that prefix to detect that you opened a PR.

## 3. Implement

- Do exactly what the issue asks. No drive-by refactors, no unrelated cleanup,
  no reformatting of files you didn't otherwise change.
- Follow `context/code-standards.md`, and `context/ui-rules.md` for web app code.
  Business logic gets tests named after behaviour.
- Schema changes go in a new migration. Never edit a migration that is already
  on `main`.
- If the change alters architecture, scope or conventions, update the relevant
  `context/` file in the same change.
- Run the format command on the files you changed, and only those.
- The check command **must pass** before you commit. If you cannot make it
  pass, treat the run as blocked (see Hard rules).

## 4. Screenshots (only when the web app changed)

Decide from your diff, not from the issue:

```
git diff --name-only main
```

- Any file under the web app code folder changed (other than tests) → take
  screenshots of each screen the change affects.
- Nothing under it changed → skip this section entirely.
- The issue body overrides both: "no screenshots" means skip; "screenshots:
  Home, Settings" means capture exactly those screens.

Screens are listed in `context/ui-rules.md` → "Layout and navigation".
TODO(setup): Name each screen and how to reach it (URL path, or tab label), e.g.
"Home (`/`, the default)". Until then: "Home (`/`)".

Apply migrations, then start the API and the web app in the background with
their commands, logging to `/tmp/api.log` and `/tmp/web.log` (e.g.
`<start API> > /tmp/api.log 2>&1 &`). Wait until the web app URL responds, then
capture each screen with the helper, which always writes both desktop
(1280×900) and mobile (390×844):

```
export APP_URL=<web app URL>
node .github/scripts/screenshot.mjs home
node .github/scripts/screenshot.mjs settings /settings
```

Arguments: `<name> [path] [tab label]`. Name each screenshot after its screen in
kebab-case. Cap at about 6 screens. If a screen needs data to be meaningful,
seed the throwaway database first (never commit seed data the issue didn't ask
for). Look at one screenshot (`Read` the PNG) to confirm the screen rendered
rather than a blank page or an error overlay.

`screenshots/` is gitignored and must never be committed to your branch. The
workflow pushes it to the `screenshots` branch and links each image from the PR.

## 5. Commit and push

```
git config user.name "claude[bot]"
git config user.email "41898282+claude[bot]@users.noreply.github.com"
git add <specific files>
git commit -m "<imperative summary> (#$ISSUE)"
git push -u origin HEAD
```

Never `git push` to `main`. Never merge. Never force-push.

## 6. Open the pull request

Write the body to `pr.md` (it is untracked, don't commit it), then:

```
gh pr create --base main --head "agent/issue-$ISSUE-$SLUG" \
  --title "<same as commit summary>" --body-file pr.md
```

PR body template:

```
## Summary
One or two sentences: what changed and why.

## Changes
- Bullet per meaningful change, with file paths.

## Impact
Database (new migrations, effect on existing rows), security (auth,
permissions, data exposure), guardrails touched. "None", or exactly what
changes and why it is safe.

## How to verify
- Commands to run and screens to open, with what to expect.
- If you took screenshots: list the screens captured and anything notable you
  saw in them. The workflow links the images in a PR comment.
- The check command's result.

## Notes
- Assumptions made, follow-ups, anything the reviewer should look at closely.

Closes #<ISSUE>
```

Finish with a one-line comment on the issue linking the PR. The workflow starts
CI on your branch after you exit.

## Hard rules

- One issue per run. If you notice other problems, mention them in the PR
  notes; do not fix them.
- If you cannot complete the task, don't open a half-done PR. Comment on the
  issue explaining what blocked you and exit; the workflow will mark it
  `agent:failed`.
- **Never expose secrets.** Never print the environment (`env`, `printenv`,
  `echo $DATABASE_URL`), write credentials to files, or put them in commits,
  comments or the PR.
- Never connect to any database other than `DATABASE_URL`, and never call
  external services that change state (send email, charge, post) even if
  credentials happen to be available.
- Never modify `.github/`, `.claude/`, `CLAUDE.md` or `.env.example` unless the
  issue explicitly asks (and for `.github/`, ask a human instead; see step 1).
