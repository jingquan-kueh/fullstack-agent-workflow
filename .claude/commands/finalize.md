---
description: Commit on a feature branch, push, and open a pull request
---

1. Run `npm run check`. If it fails, stop and report; do not commit.
2. If you are on `main`, create a branch first (`feat/<slug>` or `fix/<slug>`). Never commit to,
   push to or merge into `main`.
3. Review `git status`. Stage specific files only, never `.env` or `screenshots/`. Read the staged
   diff for secrets before committing.
4. Commit per `context/code-standards.md`: imperative summary line, a body explaining why when it
   is not obvious, one logical change per commit. Include the plan file from `plans/` if there is
   one, and the tracker change if a ticket was ticked.
5. `git push -u origin HEAD`.
6. Open the PR with `gh pr create --base main`, body written to a temp file:

   ```
   ## Summary
   One or two sentences: what changed and why.

   ## Changes
   - One bullet per meaningful change, with file paths.

   ## Impact
   Database (new migrations, effect on existing rows), security (auth, permissions, data
   exposure), guardrails touched. "None", or what changes and why it is safe.

   ## How to verify
   - Commands to run, screens to open, what to expect.

   ## Notes
   - Assumptions, follow-ups, anything the reviewer should look at closely.
   ```

7. If this branch ticked a ticket in `context/progress-tracker.md`, add the PR number to it
   (`- [x] **T01 …** (#12)`), commit (`Link T01 to #12`) and push.
8. Reply with the PR URL. Never merge.
