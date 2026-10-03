import type { Database } from '../db/database';

/** In-memory Database for unit tests. */
export const createFakeDatabase = ({ isReachable = true } = {}): Database => ({
  ping: () => (isReachable ? Promise.resolve() : Promise.reject(new Error('connect ECONNREFUSED'))),
  close: () => Promise.resolve(),
});
