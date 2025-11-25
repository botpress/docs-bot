import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/docs-bot/', // Replace with your actual repository name
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})