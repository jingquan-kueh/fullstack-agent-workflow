import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Loads .env and applies migrations once, before any test file runs.
    globalSetup: ['./src/testing/global-setup.ts'],
  },
});
