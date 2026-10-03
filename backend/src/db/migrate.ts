import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { loadEnv } from '../env';
import { createDrizzle, createPool } from './database';

const MIGRATIONS_FOLDER = fileURLToPath(new URL('../../drizzle', import.meta.url));

/** Applies every migration in `backend/drizzle/` that has not run yet. */
export const runMigrations = async (connectionString: string): Promise<void> => {
  const pool = createPool(connectionString);
  try {
    await migrate(createDrizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await pool.end();
  }
};

// CLI entry (`npm run db:migrate`).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations(loadEnv().DATABASE_URL).then(
    () => console.log('Migrations applied'),
    (error: unknown) => {
      // The message names the failing statement; the connection string never appears in it.
      console.error('Migration failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    },
  );
}
