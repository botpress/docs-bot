# agent-0-frontend (Design 2)

Placeholder folder for the second design direction. Awaiting design specs.

When direction is decided, scaffold:
- Same `@botpress/webchat` connection logic as `agent-0-frontend-copilot/`
- Same `useParentWindowMessages` hook for the docs integration
- Same `CLIENT_ID` (agent-0's webchat config)
- Different visual layer

Conventions for this slot:
- **Vite dev port**: `5174`
- **Vite `base`**: `/docs-bot/agent-0-design-2/`
- **gh-pages deploy path**: `https://jacksonyzj.github.io/docs-bot/agent-0-design-2/`

To preview against the docs site, swap `ADK_BOT_URL` in `docs/assistant.js` to `http://localhost:5174/docs-bot/agent-0-design-2/`.
