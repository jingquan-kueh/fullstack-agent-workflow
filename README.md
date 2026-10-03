# Full-stack Development Template and Workflow

A template and workflow for building full-stack TypeScript projects with Claude Code.

Two ways for development:

- locally through a **plan → implement → review → finalize** loop
- unattended through a GitHub issue agent that opens PRs.

Use it to start a new project from a runnable skeleton (Node.js + Postgres + React + MUI), or add the workflow to an existing TypeScript project and keep its stack.

## Development Workflow Overview

[I Will attach my own screenshot here later]

## Commands

Run these in Claude Code. Each stops when done so you can check the result before the next.

| Command                          | What it does                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `/setup-project <description>`   | Once per project: interviews you and fills in `CLAUDE.md` and `context/`              |
| `/plan <goal>`                   | Plans a larger feature (read-only) and saves it to `plans/` once you approve          |
| `/implement <plan, T01 or goal>` | Builds the plan, ticket or small goal with tests on a feature branch                  |
| `/review`                        | Reviews the branch against the guardrails and standards, then fixes what you pick     |
| `/finalize`                      | Commits, pushes and opens a pull request                                              |
| `/create-issue <T01 or goal>`    | Drafts a GitHub issue the agent can finish without asking, and creates it on approval |

## Default Tech Stack

What a new project starts with. An existing project keeps its own stack.

| Layer         | Default                                       |
| ------------- | --------------------------------------------- |
| Language      | TypeScript (strict), Node.js 24               |
| API           | Fastify 5, zod validation                     |
| Database      | Postgres 18 (local via Docker Compose)        |
| Data access   | Drizzle ORM, drizzle-kit migrations           |
| Web app       | React 19, MUI v9, Vite                        |
| Testing       | Vitest (database tests against real Postgres) |
| Lint / format | ESLint, Prettier                              |
| Monorepo      | npm workspaces (`backend/`, `frontend/`)      |
| CI / agent    | GitHub Actions, Claude Code                   |

## Setup

### Start a new project

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
4. Build: `/implement T01` locally, or `/create-issue T01` and label it `agent` for the issue agent.
   The full loop is described in `CLAUDE.md` → "Development workflow".

### Add to an existing project

For a full-stack TypeScript repo that already has its own code, stack and history. Only the
workflow layer is copied; the skeleton and tooling are not.

1. On a branch in the existing repo, copy the workflow files from a checkout of this template.
   `--ignore-existing` never overwrites a file the repo already has; `/setup-project` merges those
   in step 3.

   ```bash
   cd fullstack-agent-template
   rsync -a --ignore-existing --relative \
     CLAUDE.md context plans/.gitkeep .claude/commands .mcp.json \
     .github/agent-prompt.md .github/scripts .github/workflows \
     ../my-app/
   ```

2. Check that `git status` in `my-app` shows only the new files.
3. In Claude Code in `my-app`, run
   `/setup-project <a few sentences about the project>. Template checkout: ../fullstack-agent-template`.
   It reads the codebase first, then asks only what it cannot work out. It fills in `CLAUDE.md`
   (including its "Commands and paths"), `context/` (describing the code as it is), the agent
   prompt and the CI and agent workflows, and merges any file the copy skipped. It keeps the
   project's own README, package names and conventions unless you choose otherwise.
4. Do the one-time GitHub setup below, then start on the first ticket.

### One-time GitHub setup

#### 1. Set up claude auth token

```bash
claude setup-token
gh secret set CLAUDE_CODE_OAUTH_TOKEN
```

#### 2. Create the issue labels

```bash
gh label create agent             --description "Agent picks this up in the nightly sweep"
gh label create agent:execute-now --description "Agent starts on this right away"
gh label create agent:wip         --description "Agent is working on this"
gh label create agent:pr-open     --description "Agent opened a PR"
gh label create agent:needs-info  --description "Agent asked questions; answer, then remove to retry"
gh label create agent:failed      --description "Agent run failed; remove to retry"
```

#### 3. Workflow permissions

Repo Settings → Actions → General → Workflow permissions: **Read and write**, and tick **Allow
GitHub Actions to create and approve pull requests**.
