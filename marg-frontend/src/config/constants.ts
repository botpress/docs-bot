// marg's webchat client ID. Set VITE_CLIENT_ID at build time to rotate it
// without a code change; otherwise falls back to the current ID.
export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || '50e37fd0-1cd7-4522-a925-e44c4d764f94'
export const WEBCHAT_STORAGE_KEY = `marg-webchat-${CLIENT_ID}`

// Origins allowed to drive this iframe via postMessage. Localhost is included
// so dev preview works during development.
export const ALLOWED_PARENT_ORIGINS: string[] = [
  'https://botpress.com',
  'https://www.botpress.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
]
