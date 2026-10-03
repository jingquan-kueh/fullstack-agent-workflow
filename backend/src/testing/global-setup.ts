import { existsSync } from 'node:fs';
import { runMigrations } from '../db/migrate';
import { loadEnv } from '../env';

const ROOT_ENV_FILE = new URL('../../../.env', import.meta.url);

export const setup = async () => {
  // Tests read DATABASE_URL like the app does: from the root .env locally, from the environment
  // in CI. loadEnvFile never overrides variables that are already set.
  if (existsSync(ROOT_ENV_FILE)) process.loadEnvFile(ROOT_ENV_FILE);
  await runMigrations(loadEnv().DATABASE_URL);
};
