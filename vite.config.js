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
  },
  // Dev server proxy: forward API and websocket requests to the backend server
  server: {
    proxy: {
      '/api': {
        target: process.env.API_BASE || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // socket path used by server Socket.IO instance
      '/socket': {
        target: process.env.API_BASE || 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Warn earlier if chunks grow too large (adjustable)
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          // Put the Home page in a separate chunk to reduce the main bundle size
          if (id.includes('src/pages') && id.includes('Home')) return 'home'
        }
      }
    }
  }
})
