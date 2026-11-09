import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    // Run test files sequentially to avoid DB race conditions
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 15000,
    hookTimeout: 15000,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
