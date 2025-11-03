import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    // Ensure environment variables are properly handled in production
    envPrefix: 'VITE_'
  }
})
