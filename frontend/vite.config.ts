import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_API_PORT = '3000';

export default defineConfig(({ mode }) => {
  // The '' prefix loads every key from the root .env into this Node process only. Only VITE_*
  // keys ever reach the browser; never put secrets in them.
  const env = loadEnv(mode, REPO_ROOT, '');
  const apiPort = env.PORT || DEFAULT_API_PORT;

  return {
    plugins: [react()],
    server: {
      // The browser calls same-origin /api/...; the dev server forwards it to the backend.
      proxy: { '/api': `http://localhost:${apiPort}` },
    },
  };
});
