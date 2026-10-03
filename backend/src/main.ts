import { buildApp } from './app';
import { createDatabase } from './db/database';
import { loadEnv } from './env';

// Wiring only: load env, build dependencies, start the server, shut down cleanly.
const env = loadEnv();
const db = createDatabase(env.DATABASE_URL);
const app = buildApp({ db, logger: true });

// '::' listens on every interface, IPv4 and IPv6, like node:http's default.
await app.listen({ port: env.PORT, host: '::' });

const shutdown = () => {
  app
    .close()
    .then(() => db.close())
    .then(
      () => process.exit(0),
      () => process.exit(1)
    );
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
