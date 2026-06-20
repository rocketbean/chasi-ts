/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

/**
 * Dedicated Vitest config for the deep-test suite.
 *
 * Run from the project root:
 *   npx vitest run --config ./deep-test/vitest.deep.config.ts            # unit + (skipped) integration
 *   DEEP_INTEGRATION=1 npx vitest run --config ./deep-test/vitest.deep.config.ts   # include live tier
 *
 * Two tiers:
 *   - deep-test/unit/**        always runs, no infrastructure (mock-first).
 *   - deep-test/integration/** opt-in; suites self-skip unless DEEP_INTEGRATION=1
 *     (use describe.skipIf(!process.env.DEEP_INTEGRATION) inside them).
 */
export default defineConfig({
  test: {
    root: process.cwd(),
    include: [
      "deep-test/unit/**/*.test.ts",
      "deep-test/integration/**/*.test.ts",
    ],
    exclude: ["dist", "node_modules"],
    globals: true,
    environment: "node",
    env: loadEnv("test", process.cwd() + "/deep-test", ""),
    setupFiles: ["deep-test/harness/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    typecheck: {
      enabled: false,
      ignoreSourceErrors: true,
      tsconfig: "tsconfig.json",
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "deep-test/.coverage",
      include: ["src/package/**", "src/container/**", "src/config/**"],
      exclude: ["src/container/html/**", "**/*.d.ts"],
    },
  },
});
