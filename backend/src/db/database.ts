import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

/**
 * The only way the rest of the backend reaches Postgres. Grow it as features need queries; tests
 * use an in-memory fake instead.
 */
export type Database = {
  /** Resolves when the database answers a trivial query, rejects otherwise. */
  ping: () => Promise<void>;
  close: () => Promise<void>;
};

const CONNECTION_TIMEOUT_MS = 5_000;

export const createPool = (connectionString: string): pg.Pool => {
  const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: CONNECTION_TIMEOUT_MS });
  // An idle client losing its connection must not crash the process; the next query reconnects.
  pool.on('error', () => console.error('Idle Postgres client lost its connection'));
  return pool;
};

export const createDrizzle = (pool: pg.Pool) =>
  drizzle({ client: pool, schema, casing: 'snake_case' });

export const createDatabase = (connectionString: string): Database => {
  const pool = createPool(connectionString);
  const db = createDrizzle(pool);

  return {
    ping: async () => {
      await db.execute(sql`select 1`);
    },
    close: () => pool.end(),
  };
};
