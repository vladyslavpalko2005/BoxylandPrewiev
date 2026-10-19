import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const proxy = {
    '/api/internal': {
      target: env.LOCKER_API_TARGET || 'http://10.42.0.1:5000',
      changeOrigin: true,
    },
  }
  return {
    plugins: [react()],
    base: './',
    build: {
      target: ['safari15.4', 'chrome100'],
      cssTarget: ['safari15.4', 'chrome100'],
    },
    server: { proxy },
    preview: { proxy },
  }
})
