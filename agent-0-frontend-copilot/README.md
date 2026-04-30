# agent-0-frontend

A minimal Q&A webchat frontend for **agent-0** (the ADK-section docs bot), styled to match the `agent(0)` Copilot panel from `agent-lack/packages/ui`.

Wraps `@botpress/webchat` to talk to the deployed agent-0 bot. Designed to be embedded as an iframe by the docs site's `assistant.js` when a user is browsing the ADK section.

## Stack

- Vite + React 19 + TypeScript
- `@botpress/webchat` for the bot connection
- Tailwind CSS v4 with warm-charcoal design tokens
- Geist Variable + Geist Mono fonts (self-hosted)
- framer-motion for the animated dot-grid icon

## Develop

```bash
bun install
bun run dev
```

Opens at `http://localhost:5173/docs-bot/agent-0/`.

## Build & deploy

```bash
bun run build      # → dist/
bun run deploy     # publishes dist/ to gh-pages branch under /agent-0/
```

The `deploy` script uses `gh-pages -d dist -e agent-0`, which lands the build at `https://botpress.github.io/docs-bot/agent-0/` while leaving the existing `frontend/` deploy at `https://botpress.github.io/docs-bot/` untouched.

## Wire it up in the docs

After the first successful `bun run deploy`, update `docs/assistant.js`:

```diff
-const ADK_BOT_URL =
-  'https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/04/29/19/20260429192954-V3FCRIPQ.json'
+const ADK_BOT_URL = 'https://botpress.github.io/docs-bot/agent-0/'
```

Once that ships, anyone on `/adk*` pages gets this frontend in the side panel; everywhere else still uses the existing `botpress.github.io/docs-bot/`.

## What's intentionally NOT here

- No model picker (single fixed model — agent-0 deploys with `openai:gpt-4.1`)
- No file attachments
- No slash commands
- No conversation history / session list
- No settings panel
- No tool-call / agent-step renderers
- Custom (non-text) message payloads are filtered out — this is plain Q&A only

If any of those become useful later, they can be added back as separate components without touching the chat shell.

## Bot identity

- `clientId` lives in `src/config/constants.ts`. Sourced from the bot's webchat config at `https://files.bpcontent.cloud/2026/04/29/19/20260429192954-V3FCRIPQ.json`.
- If the bot is redeployed to a new workspace, regenerate the webchat config in the Botpress dashboard and update `CLIENT_ID`.

## Origin allow-list

`src/config/constants.ts` includes localhost ports 3000–3003 alongside `botpress.com` so `mint dev` postMessage forwarding (from the docs site's bottom "Ask a question…" input bubble) works during local development. Strip the localhost entries before shipping if that matters for security.
