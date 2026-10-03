# Full-stack agent template

A starting point for full-stack TypeScript projects (Node.js + Postgres + React + MUI) that are
built with Claude Code: locally through a plan → implement → review → finalize loop, and
unattended through a GitHub issue agent that opens PRs.

## What's in it

| Part                    | Files                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| AI instructions         | `CLAUDE.md` (guardrails + workflow), `context/*.md` (read every session)                                        |
| Local workflow commands | `.claude/commands/`: `/setup-project`, `/implement`, `/review`, `/finalize`, `/create-issue`                    |
| Issue agent             | `.github/workflows/agent.yml`, `.github/agent-prompt.md`, `.github/scripts/screenshot.mjs`                      |
| CI gate                 | `.github/workflows/ci.yml` (`npm run check` with a Postgres service)                                            |
| Tooling                 | npm workspaces, TypeScript strict, ESLint, Prettier, Vitest                                                     |
| Runnable skeleton       | `backend/` (API, `GET /api/health` → Postgres), `frontend/` (React + MUI page showing it), `docker-compose.yml` |
| Docs lookup             | `.mcp.json` (MUI MCP server)                                                                                    |

Project-specific gaps are marked `TODO(setup)`. `/setup-project` fills them in by interviewing
you. The backend defaults to Fastify (HTTP) and Drizzle (data access and migrations). The stack
choices that differ between projects (auth, hosting) are left _open_ in `context/architecture.md`
and decided during setup.

## Start a new project

1. Copy the template (or mark this repo as a GitHub template and use "Use this template"):

   ```bash
   rsync -a --exclude node_modules --exclude .git fullstack-agent-template/ my-app/
   cd my-app && git init -b main
   ```

2. Install and run the skeleton (Node 24, Docker):

   ```bash
   npm install
   cp .env.example .env          # set DB_PORT + DATABASE_URL if 5432 is taken
   npm run db:up
   npm run db:migrate            # apply database migrations
   npm run dev -w backend        # terminal 1: API on :3000
   npm run dev -w frontend       # terminal 2: app on :5173, shows API + database "up"
   npm run check                 # typecheck, lint, format, tests
   ```

3. In Claude Code, run `/setup-project <a few sentences about the project>`. It asks about the
   product, guardrails, stack decisions, screens and first tickets, then fills in `CLAUDE.md`,
   `context/`, the agent prompt, package names and this README.
4. Make the initial commit on `main` (the one commit that skips a PR, since there is nothing to PR
   against yet), create the GitHub repo and push.
5. Do the one-time GitHub setup below.
6. Build: `/implement T01` locally, or `/create-issue T01` and label it `agent` for the issue agent.
   The full loop is described in `CLAUDE.md` → "Development workflow".

## One-time GitHub setup

```bash
claude setup-token                       # then:
gh secret set CLAUDE_CODE_OAUTH_TOKEN
gh label create agent;            gh label create agent:execute-now
gh label create agent:wip;        gh label create agent:pr-open
gh label create agent:needs-info; gh label create agent:failed
```

- Repo Settings → Actions → General → Workflow permissions: **Read and write**, and tick **Allow
  GitHub Actions to create and approve pull requests**.
- Repo Settings → Branches: protect `main` (require a PR and the `CI / check` status).
- In Claude Code, approve the `mui-mcp` server from `.mcp.json` when prompted.

## Changing the template

Improvements found while using it in a project (a better command, a new standard) belong back
here, so the next project starts with them. Keep everything in this repo project-neutral: domain
rules go in a project's own `CLAUDE.md` and `context/`, never in the template.
