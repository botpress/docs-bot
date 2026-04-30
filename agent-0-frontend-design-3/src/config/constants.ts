// agent-0's webchat client ID — sourced from the bot's webchat config at
// https://files.bpcontent.cloud/2026/04/29/19/20260429192954-V3FCRIPQ.json
export const CLIENT_ID = 'b09761d4-52ba-40f1-be61-b1e7ac09956f'

// Origins allowed to drive this iframe via postMessage. Localhost is included
// so dev preview at mintlify dev (localhost:3002) works during development.
export const ALLOWED_PARENT_ORIGINS: string[] = [
  'https://botpress.com',
  'https://www.botpress.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
]
