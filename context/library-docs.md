# Library Docs

How to look up library and API docs during development. Read this before using any MCP server.

## Rules

- Write code for the versions pinned in `package.json`, not from memory of older versions. When
  unsure about an API, look it up first (MCP server, docs site, or the installed package's types).
- MCP servers are for development only. The app never depends on them.
- MCP servers that need credentials are added with local scope
  (`claude mcp add <name> --scope local …`), never in `.mcp.json`, so keys are never committed.
  Use development or read-only credentials only.
- Don't repeat secrets, personal data or raw payloads from tool output.

## MCP servers

- **MUI MCP** (`mui-mcp`, in `.mcp.json`): MUI component and theme docs. Use it as described in
  `context/ui-rules.md` → "Looking things up".
- TODO(setup): One entry per further MCP server (name, what it is for, how it is added, limits on
  its use), or "None".

## Docs sites

- Postgres: https://www.postgresql.org/docs/current/
- node-postgres (`pg`): https://node-postgres.com/
- Fastify: https://fastify.dev/docs/latest/ (type providers, validation, error handling)
- Drizzle ORM + drizzle-kit: https://orm.drizzle.team/docs/overview (LLM-friendly:
  https://orm.drizzle.team/llms.txt)
- zod: https://zod.dev/
- Vite: https://vite.dev/guide/
- Vitest: https://vitest.dev/guide/
- TODO(setup): Docs for the libraries chosen in `architecture.md` (auth, and anything else the
  project adds) and any external APIs. Prefer `llms.txt` or Markdown versions where a site
  offers them.
