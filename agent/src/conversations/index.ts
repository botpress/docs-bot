import { Conversation, actions, z } from "@botpress/runtime";
import { KnowledgeDocs } from "../knowledge";

export default new Conversation({
  channel: ["webchat.channel"],
  handler: async ({execute, state, message, conversation}) => {
    if (message?.payload && 'type' in message.payload && message.payload.type === 'text' && 'value' in message.payload && message.payload.value) {
      const parsed = JSON.parse(message.payload.value)
      const contextToAdd = parsed.currentContext?.map((item: { title: string; path: string }) => item.path) || []

      if (contextToAdd.length > 0) {
        console.log(contextToAdd)
        state.context = contextToAdd
      }
    }

    if (message) {
      actions.webchat.startTypingIndicator({
        conversationId: conversation.id,
        messageId: message?.id
      })
    }

    await execute({
      instructions: `
You are the AI Assistant for the Botpress documentation. Give accurate answers to all user questions. Use markdown and subheadings to format your answers (use code blocks for code).

If there are any pages in ${state.context}, prioritize them when generating your answer.

Always include a **Sources** section at the bottom of your answer with markdown links to all the pages you used to answer the question (the link preview should just be the title of the page).
`,
      knowledge: [KnowledgeDocs],
    });

    if (message) {
      actions.webchat.stopTypingIndicator({
        conversationId: conversation.id,
        messageId: message?.id
      })
    }

    state.context = []
  },
  state: z.object({
    context: z.array(z.string())
  })
});