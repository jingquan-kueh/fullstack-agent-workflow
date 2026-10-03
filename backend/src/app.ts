import Fastify, { type FastifyError } from 'fastify';
import type { Database } from './db/database';
import { getHealth } from './health';
import { type ZodTypeProvider, zodValidatorCompiler } from './http/zod';

type Dependencies = { db: Database; logger?: boolean };

const isClientError = (error: FastifyError) =>
  error.statusCode !== undefined && error.statusCode >= 400 && error.statusCode < 500;

export const buildApp = ({ db, logger = false }: Dependencies) => {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(zodValidatorCompiler);

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      // e.g. "body/email Invalid email address": names the fields, never the values.
      return reply.status(400).send({ error: `Invalid request: ${error.message}` });
    }
    if (isClientError(error)) {
      // Fastify's own 4xx errors (malformed JSON, body too large, …).
      return reply.status(error.statusCode ?? 400).send({ error: error.message });
    }
    // Only the error name: driver messages can name hosts, users or query values.
    request.log.error(`${request.method} ${request.routeOptions.url} failed: ${error.name}`);
    return reply.status(500).send({ error: 'Internal server error' });
  });

  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ error: 'Not found' }));

  app.get('/api/health', async (_request, reply) => {
    const health = await getHealth(db);
    return reply.status(health.status === 'ok' ? 200 : 503).send(health);
  });

  return app;
};
