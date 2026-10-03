import { afterAll, describe, expect, it } from 'vitest';
import { loadEnv } from '../env';
import { createDatabase } from './database';

// Runs against real Postgres (`npm run db:up` locally, the service container in CI). The
// global setup has already applied migrations.
const db = createDatabase(loadEnv().DATABASE_URL);

afterAll(() => db.close());

describe('createDatabase', () => {
  it('answers a ping', async () => {
    await expect(db.ping()).resolves.toBeUndefined();
  });
});
