# agent-0-frontend-design-3

Design 3 — Claude.ai / Notion-AI inspired clean modern chat. Light-first, Inter Variable, generous whitespace, max-width centered content. Assistant messages have **no bubble** (just text on the page background); user messages get a soft pill. Single elevated composer at the bottom.

## What makes this design distinct

| | Design 1 (`copilot`) | Design 2 (`design-2`) | **Design 3 (`design-3`)** |
|---|---|---|---|
| Vibe | Dev-tool, austere | Branded webchat, feature-rich | Consumer-AI, calm |
| Default theme | Dark | Dark | Light |
| Font | Geist + Geist Mono | Inter | Inter |
| Empty state | Tiny "ask agent(0)" prompt | Avatar + suggestion pills + model pill | Big greeting + 4 prompt suggestions |
| Assistant text | Bubble | Bubble | No bubble (just text) |
| User text | Bubble | Bubble | Soft pill bubble |
| Composer | Simple bar with arrow | With model selector + mic | Big rounded card with circular send |
| Header | "agent(0)" monospace | Avatar + name + dropdown | Tiny "ADK assistant" label |
| Width | Full panel | Full panel | Centered, max-width 672px |

## Stack

- Vite + React 19 + TypeScript
- `@botpress/webchat` (talks to agent-0 via `CLIENT_ID`)
- Tailwind CSS v4 with HSL-based light/dark tokens
- Inter Variable (self-hosted via `@fontsource-variable/inter`)
- lucide-react icons

## Develop

```bash
bun install
bun run dev      # → http://localhost:5175/docs-bot/agent-0-design-3/
```

## Build & deploy

```bash
bun run deploy   # → https://jacksonyzj.github.io/docs-bot/agent-0-design-3/
```

## Preview against the docs

In `docs/assistant.js`, swap `ADK_BOT_URL` to `http://localhost:5175/docs-bot/agent-0-design-3/`, then `mintlify dev` and visit `/adk/*`.
