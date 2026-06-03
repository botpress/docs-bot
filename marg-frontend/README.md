# marg-frontend

Claude.ai-inspired chat UI for the **marg** Botpress docs assistant. Light-first,
Inter Variable, generous whitespace, max-width centered content. Assistant
messages have **no bubble** (text on the page background); user messages get a
soft pill. Single elevated composer at the bottom.

Built to embed as an `<iframe>` on the docs site.

## Stack

- Vite + React 19 + TypeScript
- `@botpress/webchat` (talks to the `marg` bot via `CLIENT_ID`)
- Tailwind CSS v4 with HSL-based light/dark tokens
- Inter Variable (self-hosted via `@fontsource-variable/inter`)
- `react-markdown` + `remark-gfm` for assistant message rendering
- `lucide-react` icons

The bot's answers already include their **References** list as inline markdown,
so the frontend renders message text as-is (no separate citations footer).

## Setup

Set `CLIENT_ID` in `src/config/constants.ts` to the marg bot's webchat client ID
(install the webchat integration on the bot and deploy to obtain it).

## Develop

```bash
bun install
bun run dev      # → http://localhost:5176/docs-bot/marg-frontend/
```

## Build & deploy

```bash
bun run deploy   # → https://botpress.github.io/docs-bot/marg-frontend/
```
