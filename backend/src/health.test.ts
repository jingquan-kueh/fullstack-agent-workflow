import { describe, expect, it } from 'vitest';
import { getHealth } from './health';
import { createFakeDatabase } from './testing/fake-database';

describe('getHealth', () => {
  it('is ok when the database answers', async () => {
    expect(await getHealth(createFakeDatabase())).toEqual({ status: 'ok', database: 'up' });
  });

  it('is degraded when the database does not answer', async () => {
    const db = createFakeDatabase({ isReachable: false });
    expect(await getHealth(db)).toEqual({ status: 'degraded', database: 'down' });
  });
});
