import { z } from 'zod';

const HealthSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  database: z.enum(['up', 'down']),
});

export type Health = z.infer<typeof HealthSchema>;

const REQUEST_TIMEOUT_MS = 10_000;
// 503 still carries a health body: the API is up, something behind it is not.
const HEALTH_STATUS_CODES = new Set([200, 503]);

/** Validates a GET /api/health body. */
export const toHealth = (body: unknown): Health => {
  const result = HealthSchema.safeParse(body);
  if (!result.success) {
    // zod messages name the failed fields and expected types, never the values.
    throw new Error(
      `GET /api/health returned an unexpected body: ${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
};

export const fetchHealth = async (fetchFn: typeof fetch = fetch): Promise<Health> => {
  const response = await fetchFn('/api/health', {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!HEALTH_STATUS_CODES.has(response.status)) {
    throw new Error(`GET /api/health failed with HTTP ${response.status}`);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // The parser's own message can quote the body.
    throw new Error('GET /api/health returned a body that is not JSON');
  }
  return toHealth(body);
};
