import { cwd } from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), 'VITE_')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080'

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/d/': { target: apiTarget, changeOrigin: true },
        '/go/': { target: apiTarget, changeOrigin: true },
      },
    },
    // Vitest transpiles JSX with esbuild directly (the React plugin does not
    // apply there); match the build's automatic runtime so tests don't need a
    // global React in scope.
    esbuild: { jsx: 'automatic' },
  }
})
