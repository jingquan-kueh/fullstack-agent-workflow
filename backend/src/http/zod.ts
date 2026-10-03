import type {
  FastifySchemaCompiler,
  FastifySchemaValidationError,
  FastifyTypeProvider,
} from 'fastify';
import { z } from 'zod';

/**
 * Lets routes declare zod schemas: `schema: { body: z.object(...) }` validates the request and
 * types `request.body`. Register with `app.withTypeProvider<ZodTypeProvider>()`.
 *
 * Only `params`, `querystring`, `body` and `headers` are supported; `response` schemas would go
 * to Fastify's JSON-schema serializer, which does not understand zod.
 */
export interface ZodTypeProvider extends FastifyTypeProvider {
  validator: this['schema'] extends z.ZodType ? z.output<this['schema']> : unknown;
  serializer: this['schema'] extends z.ZodType ? z.input<this['schema']> : unknown;
}

const toValidationError = (issue: z.core.$ZodIssue): FastifySchemaValidationError => ({
  keyword: issue.code,
  instancePath: issue.path.map((segment) => `/${String(segment)}`).join(''),
  schemaPath: '',
  params: {},
  // zod messages describe what was expected, never the value that was sent.
  message: issue.message,
});

export const zodValidatorCompiler: FastifySchemaCompiler<z.ZodType> =
  ({ schema }) =>
  (data: unknown) => {
    const result = schema.safeParse(data);
    return result.success
      ? { value: result.data }
      : { error: result.error.issues.map(toValidationError) };
  };
