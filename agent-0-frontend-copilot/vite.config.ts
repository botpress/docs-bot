import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// `base` matches the gh-pages subpath where this frontend will be deployed.
// Design 1 ("Copilot" — agent-lack-style warm charcoal):
// https://jacksonyzj.github.io/docs-bot/agent-0-copilot/
export default defineConfig({
  plugins: [react()],
  base: '/docs-bot/agent-0-copilot/',
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
