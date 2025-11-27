import { Conversation, z } from "@botpress/runtime";
import { KnowledgeDocs } from "../knowledge/docs";
import { makeGuardrails } from "./extensions/guardrails";

export default new Conversation({
  channel: ["webchat.channel"],
  handler: async ({ execute, state, message, conversation }) => {
    let selectedModel;

    if (
      message?.payload &&
      "type" in message.payload &&
      message.payload.type === "text" &&
      "value" in message.payload &&
      message.payload.value
    ) {
      const parsed = JSON.parse(message.payload.value);
      const contextToAdd =
        parsed.currentContext?.map(
          (item: { title: string; path: string }) => item.path
        ) || [];

      // Extract the selected model from the payload
      if (parsed.model) {
        selectedModel = parsed.model;
      }

      if (contextToAdd.length > 0) {
        state.context = contextToAdd;
        conversation.send({
          type: "custom",
          payload: {
            url: "",
            name: `Reading context...`,
          },
        });
      } else {
        conversation.send({
          type: "custom",
          payload: {
            url: "",
            name: "Thinking...",
          },
        });
      }
    }

    const { onBeforeToolGuard } = makeGuardrails(message);

    await execute({
      instructions: `
You are the AI Assistant for the Botpress documentation. Give concise, accurate answers to all user questions. Use markdown with subheadings to format your answers (use code blocks for code).

If there are any pages in ${state.context}, prioritize them when generating your answer.

Don't use emojis or inline citations.
`,
      knowledge: [KnowledgeDocs],
      model: selectedModel || "auto",
      hooks: {
        onBeforeTool: async (event) => {
          await onBeforeToolGuard(event);
          if (event.tool.name === "search_knowledge") {
            conversation.send({
              type: "custom",
              payload: {
                url: "",
                name: `Searching documentation...`,
              },
            });
          }
        },
      },
    });
    state.context = [];
  },
  state: z.object({
    context: z.array(z.string()),
  }),
});
