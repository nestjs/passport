import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
    },
    pool: 'forks',
  },
});
