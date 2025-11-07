import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    threads: false,
    setupFiles: [path.resolve(__dirname, 'src', 'setupTests.js')],
    include: ['src/__tests__/**'],
  }
})
