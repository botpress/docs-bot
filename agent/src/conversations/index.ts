import { Conversation } from "@botpress/runtime";

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: `You are a helpful AI assistant built with Botpress ADK. You can assist users with their questions and tasks.`,
    });
  },
});
