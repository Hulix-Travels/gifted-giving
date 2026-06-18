import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'production' && !env.VITE_STRIPE_PUBLISHABLE_KEY?.trim()) {
    throw new Error(
      'Production build requires VITE_STRIPE_PUBLISHABLE_KEY. ' +
      'Set it in your shell or in client/.env.production (see client/.env.example).'
    )
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: 'localhost',
      proxy: {
        '/api': 'http://localhost:5000'
      }
    },
    build: {
      envPrefix: 'VITE_',
      rollupOptions: {
        output: {
          manualChunks: {
            mui: ['@mui/material', '@mui/icons-material'],
            stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
            router: ['react-router-dom']
          }
        }
      }
    }
  }
})
