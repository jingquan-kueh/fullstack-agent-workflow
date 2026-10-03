---
description: Draft a GitHub issue from a tracker ticket or a goal, then create it once approved
argument-hint: '<T02 | goal>'
---

Draft a GitHub issue for `$ARGUMENTS`, show it, and create it only after the developer approves.
Write it so the issue agent (`.github/agent-prompt.md`) can finish it without asking: exact
behaviour, exact values (names, limits, columns, wording) and a checkable definition of done.

## 1. Gather

- **Tracker ticket** (`T02`, "T02 from the progress tracker"): the ticket in
  `context/progress-tracker.md` is the starting point (scope, "Done when", dependencies, Open
  items).
- **Goal** in plain words: read the code it touches, so the draft names real files and values. If
  it is bigger than one ticket (see the tracker's "How to use"), propose a split instead.
- If it conflicts with the guardrails in `CLAUDE.md` or with `context/`, stop and say so.
- Find related issues: `gh issue list --state all --limit 200 --json number,title,state`. Tracker
  tickets are matched by the ID at the start of the title (`T01 · …`).
- Anything the agent would have to guess (including a ticket's **Open** items, and any technology
  choice `context/architecture.md` still lists as open): ask first, in one message, each question
  with your recommendation. Do not draft around a gap.

## 2. Draft

Show the draft in exactly this shape. Create nothing yet.

```
Title: <ticket: "T02 · <ticket name>"; goal: imperative summary, under 70 characters>
Labels: none

Description:

## Goal
What changes and why, in a few sentences, with the exact values. If it changes the database
schema or existing data, say so and spell out the migration.

## Definition of done
- [ ] Checkable outcomes, one per line.
- [ ] The check command passes.
- [ ] (web app changes) Desktop + mobile screenshots of: <screens>.

## Out of scope
- Related work this issue must not do (often the next tickets).

## Design reference
Links, Figma frames, screenshots, or the `context/ui-rules.md` sections that apply. "None" if not
applicable.

## Blocks / Blocked by
- Blocked by #<n> (<title>), or "T01 (no issue yet)".
- Blocks #<n> (<title>), or "T05 (no issue yet)".
"None" if nothing.
```

Labels default to none. Mention the alternatives: `agent` (the nightly sweep picks it up) and
`agent:execute-now` (the agent starts on it immediately).

## 3. Revise, then create

- Wait for an explicit yes. If anything changes, show the full revised draft again.
- On approval: write the body to a temp file and run
  `gh issue create --title "<title>" --body-file <file>`, with `--label` for each label in the
  draft. If a label does not exist (`gh label list`), ask rather than create it.
- If `gh` is not logged in or the repo has no GitHub remote, say so and stop; the draft stays in
  the conversation for later.
- Reply with the issue URL. Change nothing else (no code, no tracker edits).
