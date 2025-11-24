import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "agent",
  description: "An AI agent built with Botpress ADK",

  defaultModels: {
    autonomous: "anthropic:claude-sonnet-4-5-20250929",
    zai: "cerebras:gpt-oss-120b",
  },

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  dependencies: {
    integrations: {
      chat: { version: "chat@0.7.3", enabled: true },
      webchat: { version: "webchat@0.3.0", enabled: true },
    },
  },
});
