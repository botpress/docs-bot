import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Design 2 — clone of docs-bot/frontend's UI (the default docs assistant
// look) but pointed at agent-0's webchat.
// Deploy URL: https://jacksonyzj.github.io/docs-bot/agent-0-design-2/
export default defineConfig({
  base: '/docs-bot/agent-0-design-2/',
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})