# agent-0-frontend-design-2

Design 2 — same UI as the default docs assistant (a fork of `docs-bot/frontend/`), but pointed at agent-0 instead of the default docs bot.

Use this slot to compare a more "branded webchat" look (Botpress blue, conversation history, model selector, context attach panel) against the leaner Copilot-style design in `agent-0-frontend-copilot/`.

## What's the same as `docs-bot/frontend/`

Everything — App.tsx, components, hooks, styles. This is a structural fork, not a rebuild.

## What's different

| | `docs-bot/frontend/` | `agent-0-frontend-design-2/` |
|---|---|---|
| `CLIENT_ID` | default docs bot (`5b5e1c06-…`) | agent-0 (`b09761d4-…`) |
| `BOT_CONFIG.name` | "Assistant" | "agent(0)" |
| `BOT_CONFIG.description` | docs-wide | ADK-scoped |
| `ALLOWED_PARENT_ORIGINS` | botpress.com only | also localhost 3000-3003 for dev |
| `vite.config.ts` `base` | `/docs-bot/` | `/docs-bot/agent-0-design-2/` |
| dev port | (default 5173) | pinned 5174 |
| deploy `gh-pages` subpath | root | `agent-0-design-2/` |

## Develop

```bash
bun install
bun run dev      # → http://localhost:5174/docs-bot/agent-0-design-2/
```

## Build & deploy (to your fork's gh-pages)

```bash
bun run deploy   # → https://jacksonyzj.github.io/docs-bot/agent-0-design-2/
```

## Preview against the docs

In `docs/assistant.js`, swap `ADK_BOT_URL` to `http://localhost:5174/docs-bot/agent-0-design-2/`, then `mintlify dev` and visit `/adk/*`.
