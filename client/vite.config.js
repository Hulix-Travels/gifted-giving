import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    // Ensure environment variables are properly handled in production
    envPrefix: 'VITE_'
  },
  define: {
    // Fallback for production builds when no .env file is present
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://gifted-givings.onrender.com/api')
  }
})
