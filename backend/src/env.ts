import { z } from 'zod';

// Keys copied from .env.example (or unset GitHub variables) arrive as '', which means "not set".
const emptyAsUnset = (value: unknown) => (value === '' ? undefined : value);

const EnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  PORT: z.preprocess(emptyAsUnset, z.coerce.number().int().min(1).max(65535).default(3000)),
});

export type Env = z.infer<typeof EnvSchema>;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    // zod messages name the failed keys and expected types, never the values (DATABASE_URL holds
    // a password).
    throw new Error(`Invalid environment: ${z.prettifyError(result.error)}`);
  }
  return result.data;
};
