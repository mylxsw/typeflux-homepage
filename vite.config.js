import { cwd } from 'node:process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const prerenderedRoutes = {
  name: 'preview-prerendered-routes',
  configurePreviewServer(server) {
    const outDir = resolve(server.config.root, server.config.build.outDir)
    server.middlewares.use((req, _res, next) => {
      if (req.method === 'GET' || req.method === 'HEAD') {
        const { pathname, search } = new URL(req.url, 'http://localhost')
        // Match directory indexes before Vite uses the SPA fallback for a
        // slashless URL. The browser keeps the requested path and query.
        if (pathname.startsWith('/') && !pathname.endsWith('/') &&
            existsSync(resolve(outDir, `.${pathname}`, 'index.html'))) {
          req.url = `${pathname}/index.html${search}`
        }
      }
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), 'VITE_')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080'

  return {
    plugins: [react(), prerenderedRoutes],
    build: { rollupOptions: { input: { main: 'index.html', auth: 'auth.html' } } },
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
    test: { maxWorkers: 2 },
    oxc: { jsx: { runtime: 'automatic' } },
  }
})
