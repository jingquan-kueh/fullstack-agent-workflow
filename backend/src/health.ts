import type { Database } from './db/database';

export type Health = {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
};

export const getHealth = async (db: Database): Promise<Health> => {
  try {
    await db.ping();
    return { status: 'ok', database: 'up' };
  } catch {
    // The error is not returned: driver messages can name hosts and users.
    return { status: 'degraded', database: 'down' };
  }
};
