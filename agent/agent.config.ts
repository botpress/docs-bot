import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "adk-docs-bot",
  description: "An AI agent built with Botpress ADK",

  defaultModels: {
    autonomous: "openai:gpt-4.1",
    zai: "cerebras:gpt-oss-120b",
  },

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  conversation: {
    tags: {
      chatSummaryTitle: {
        title: "Chat Summary Title",
        description: "A short summary of the conversation topic",
      },
      hasMessages: {
        title: "Has Messages",
        description: "Whether the conversation has messages in it",
      },
    },
  },

  dependencies: {
    integrations: {
      chat: { version: "chat@0.7.3", enabled: true },
      webchat: { version: "webchat@0.3.0", enabled: true },
    },
  },
});
