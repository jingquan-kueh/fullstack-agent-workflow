import { describe, expect, it } from 'vitest';
import { buildApp } from './app';
import { createFakeDatabase } from './testing/fake-database';

describe('GET /api/health', () => {
  it('returns 200 when the database is up', async () => {
    const app = buildApp({ db: createFakeDatabase() });
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', database: 'up' });
  });

  it('returns 503 when the database is down', async () => {
    const app = buildApp({ db: createFakeDatabase({ isReachable: false }) });
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: 'degraded', database: 'down' });
  });
});

describe('unknown routes', () => {
  it('return 404 as JSON', async () => {
    const app = buildApp({ db: createFakeDatabase() });
    const response = await app.inject({ method: 'GET', url: '/api/nope' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Not found' });
  });
});

describe('unexpected errors', () => {
  it('return 500 without the error message', async () => {
    const app = buildApp({ db: createFakeDatabase() });
    app.get('/api/boom', () => {
      throw new Error('password authentication failed for user "app"');
    });
    const response = await app.inject({ method: 'GET', url: '/api/boom' });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: 'Internal server error' });
  });
});
