import { z, defineConfig } from '@botpress/runtime'

export default defineConfig({
  // Internal Botpress identifier — what the bot is registered as in the
  // workspace. The customer-facing brand for this same agent is "ADK
  // assistant" / "adk-bot" (see README and frontend copy).
  name: 'Marg',
  description: 'Botpress ADK assistant for the ADK section of the docs (webchat-only)',

  defaultModels: {
    autonomous: 'openai:gpt-4.1-2025-04-14',
    zai: 'openai:gpt-4.1-2025-04-14',
  },

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  dependencies: {
    integrations: {
      chat: 'chat@1.0.0',
      webchat: 'webchat@0.3.0',
    },
  },
})
