import { defineConfig } from 'drizzle-kit';

// Used only by `npm run db:generate`, which diffs schema.ts against the migrations already in
// ./drizzle and needs no database connection. Migrations are applied by src/db/migrate.ts.
// drizzle-kit requires a default export.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  casing: 'snake_case',
});
