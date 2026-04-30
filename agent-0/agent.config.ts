import { z, defineConfig } from '@botpress/runtime'

export default defineConfig({
  name: 'agent-0',
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
