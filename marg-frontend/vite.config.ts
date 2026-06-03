import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// `base` matches the gh-pages subpath where this frontend will be deployed.
// Claude.ai-inspired clean modern chat (Inter, generous whitespace,
// max-width centered content, no bubble for assistant messages).
export default defineConfig({
  plugins: [react()],
  base: '/docs-bot/marg-frontend/',
  server: { port: 5176, strictPort: true },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
