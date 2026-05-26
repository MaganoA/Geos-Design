import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    // Playwright owns ./tests/e2e and ./tests/visual — these can't run
    // under vitest (they need a browser context). Keep them out of the
    // unit-test sweep.
    exclude: ['node_modules', 'dist', 'tests/e2e/**', 'tests/visual/**'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
