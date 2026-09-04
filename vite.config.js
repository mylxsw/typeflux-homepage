import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest transpiles JSX with esbuild directly (the React plugin does not
  // apply there); match the build's automatic runtime so tests don't need a
  // global React in scope.
  esbuild: { jsx: 'automatic' },
})
