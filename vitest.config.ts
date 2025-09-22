/// <reference types="vitest" />
import { defineConfig} from 'vitest/config'
import { loadEnv } from 'vite'
import { resolve, dirname } from "node:path";

export default defineConfig({
  resolve: {},
  test: {
    exclude: ["dist", "node_modules", "src"],
    includeSource: ["src/types"],
    globals: true,
    environment: "node",
    env: loadEnv("test", process.cwd() + "/test", ""),
    testTimeout: 20000,
    typecheck: {
      enabled: false,
      ignoreSourceErrors: true,
      tsconfig: "tsconfig.json",
    },
  },
});