import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildApp } from '../app';
import { createFakeDatabase } from '../testing/fake-database';

const buildAppWithEchoRoute = () => {
  const app = buildApp({ db: createFakeDatabase() });
  app.post(
    '/api/echo',
    { schema: { body: z.object({ name: z.string().min(1), age: z.number().int() }) } },
    (request) => ({ greeting: `Hello ${request.body.name}`, nextAge: request.body.age + 1 }),
  );
  return app;
};

describe('zod request validation', () => {
  it('passes a valid body through to the handler', async () => {
    const response = await buildAppWithEchoRoute().inject({
      method: 'POST',
      url: '/api/echo',
      payload: { name: 'Ada', age: 36 },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ greeting: 'Hello Ada', nextAge: 37 });
  });

  it('rejects an invalid body with 400 naming the field', async () => {
    const response = await buildAppWithEchoRoute().inject({
      method: 'POST',
      url: '/api/echo',
      payload: { name: 'Ada', age: 'not-a-number' },
    });
    expect(response.statusCode).toBe(400);
    const { error } = response.json<{ error: string }>();
    expect(error).toMatch(/^Invalid request: /);
    expect(error).toContain('body/age');
    expect(error).not.toContain('not-a-number');
  });

  it('rejects malformed JSON with 400', async () => {
    const response = await buildAppWithEchoRoute().inject({
      method: 'POST',
      url: '/api/echo',
      headers: { 'content-type': 'application/json' },
      payload: '{"name":',
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('error');
  });
});
