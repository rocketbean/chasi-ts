/// <reference types="vitest" />
import { defineConfig} from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig({
  test: {
    exclude: ['dist/*', "node_modules"],
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    env: loadEnv('test', process.cwd() + "/test", "")
  },
})