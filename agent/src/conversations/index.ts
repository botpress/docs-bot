import { Conversation, actions, z } from "@botpress/runtime";
import { KnowledgeDocs } from "../knowledge";

export default new Conversation({
  channel: "*",
  handler: async ({execute, state, message}) => {
    state.context = JSON.parse(message.payload.value).context

    await execute({
      instructions: `
You are the AI Assistant for the Botpress documentation. Give accurate answers to all user questions. Use markdown and subheadings to format your answers (use code blocks for code).

If there are any pages in ${state.context}, prioritize them when generating your answer.

Always include a **Sources** section at the bottom of your answer with markdown links to all the pages you used to answer the question (the link preview should just be the title of the page).
`,
      knowledge: [KnowledgeDocs]
    });

    state.context = []
  },
  state: z.object({
    context: z.array(z.string())
  })
});
