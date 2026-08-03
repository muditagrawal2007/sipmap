import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        'src/index.js',
        'src/**/*.config.js',
      ],
      thresholds: {
        // Realistic thresholds given that command/encouragement/automation handlers
        // require full Probot event simulation for full branch coverage.
        // The core logic (utils, process, maintainers) is covered > 75%.
        // See docs/testing.md for the coverage improvement roadmap.
        lines: 45,
        branches: 65,
        functions: 25,
        statements: 45,
      },
    },
    setupFiles: ['test/setup.js'],
  },
});
