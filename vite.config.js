import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // use a small local stub for lottie-web to avoid importing the runtime in tests/dev server
      'lottie-web': resolve(__dirname, 'src/mocks/lottie-web.js')
    }
  }
})
