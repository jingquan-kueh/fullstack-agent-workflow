import { describe, expect, it } from 'vitest';
import { loadEnv } from './env';

const validEnv = {
  DATABASE_URL: 'postgres://app:app@localhost:5432/app',
  PORT: '4000',
};

describe('loadEnv', () => {
  it('accepts a Postgres URL and a port', () => {
    expect(loadEnv(validEnv)).toEqual({ DATABASE_URL: validEnv.DATABASE_URL, PORT: 4000 });
  });

  it('defaults the port to 3000 when it is empty', () => {
    expect(loadEnv({ ...validEnv, PORT: '' }).PORT).toBe(3000);
  });

  it('refuses a database URL that is not Postgres', () => {
    expect(() => loadEnv({ ...validEnv, DATABASE_URL: 'mysql://app:app@localhost/app' })).toThrow(
      'DATABASE_URL'
    );
  });

  it('does not echo input values in validation errors', () => {
    const secret = 'do-not-print-me';
    let message = '';
    try {
      loadEnv({ ...validEnv, DATABASE_URL: secret });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain('DATABASE_URL');
    expect(message).not.toContain(secret);
  });
});
