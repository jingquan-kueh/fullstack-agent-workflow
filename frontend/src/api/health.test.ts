import { describe, expect, it } from 'vitest';
import { fetchHealth } from './health';

const respondWith =
  (status: number, body: unknown): typeof fetch =>
  () =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));

describe('fetchHealth', () => {
  it('returns the health of a healthy API', async () => {
    const health = await fetchHealth(respondWith(200, { status: 'ok', database: 'up' }));
    expect(health).toEqual({ status: 'ok', database: 'up' });
  });

  it('reads a 503 as a degraded API, not an error', async () => {
    const health = await fetchHealth(respondWith(503, { status: 'degraded', database: 'down' }));
    expect(health).toEqual({ status: 'degraded', database: 'down' });
  });

  it('fails on other HTTP errors', async () => {
    await expect(fetchHealth(respondWith(500, { error: 'boom' }))).rejects.toThrow('HTTP 500');
  });

  it('fails on a body of the wrong shape', async () => {
    await expect(fetchHealth(respondWith(200, { status: 'great' }))).rejects.toThrow(
      'unexpected body'
    );
  });
});
