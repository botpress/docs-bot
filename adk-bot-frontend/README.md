# adk-bot-frontend

Claude.ai / Notion-AI inspired chat UI for the ADK assistant. Light-first, Inter
Variable, generous whitespace, max-width centered content. Assistant messages
have **no bubble** (text on the page background); user messages get a soft pill.
Single elevated composer at the bottom.

Embedded as an `<iframe>` in `docs/assistant.js` on `/adk/*` pages.

## Stack

- Vite + React 19 + TypeScript
- `@botpress/webchat` (talks to `adk-bot` via `CLIENT_ID`)
- Tailwind CSS v4 with HSL-based light/dark tokens
- Inter Variable (self-hosted via `@fontsource-variable/inter`)
- `react-markdown` + `remark-gfm` for assistant message rendering
- `lucide-react` icons

## Develop

```bash
bun install
bun run dev      # → http://localhost:5175/docs-bot/adk-bot-frontend/
```

## Build & deploy

```bash
bun run deploy   # → https://botpress.github.io/docs-bot/adk-bot-frontend/
```

## Preview against the docs

In `docs/assistant.js`, point `ADK_BOT_URL` at
`http://localhost:5175/docs-bot/adk-bot-frontend/`, then run `mintlify dev` and
visit any `/adk/<page>` URL.
