import { Conversation, z, adk } from "@botpress/runtime";
import { KnowledgeDocs } from "../knowledge/docs";
import { makeGuardrails } from "./extensions/guardrails";

export default new Conversation({
  channel: ["webchat.channel"],
  handler: async ({ execute, state, message, conversation, client }) => {
    console.log("Called handler, starting execution", {
      message,
      tags: JSON.stringify(conversation.tags),
    });

    let selectedModel;
    let messageText = "";

    console.log(`Tags before validation: ${JSON.stringify(conversation.tags)}`);

    if (message && message.direction === "incoming") {
      console.log(
        `Handler received an incoming message: ${JSON.stringify(message)}`
      );

      if (conversation.tags.hasMessages === undefined) {
        console.log("hasMessages not assigned yet, setting to true");
        conversation.tags.hasMessages = "true";
      } else {
        console.log("hasMessages already assigned, skipping update");
      }
    } else {
      console.log("skipping tag update");
    }

    console.log(
      `Validation done, tags after validation: ${JSON.stringify(conversation.tags)}`
    );

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

      if (parsed.model) {
        selectedModel = parsed.model;
      }

      if ("text" in message.payload) {
        messageText = message.payload.text;
      }

      if (contextToAdd.length > 0) {
        state.context = contextToAdd;
        conversation.send({
          type: "custom",
          payload: { url: "", name: "Reading context..." },
        });
      } else {
        conversation.send({
          type: "custom",
          payload: { url: "", name: "Thinking..." },
        });
      }
    }

    const { onBeforeToolGuard } = makeGuardrails(message);

    let lastYieldedMessage = "";

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
        onTrace: ({ trace }) => {
          if (trace.type === "yield" && trace.value?.children) {
            const textContent = trace.value.children
              .filter((child: unknown) => typeof child === "string")
              .join(" ")
              .trim();
            if (textContent) {
              lastYieldedMessage = textContent;
            }
          }
        },
      },
    });

    if (!conversation.tags.title && lastYieldedMessage) {
      let title: string;
      try {
        title = await adk.zai.rewrite(
          lastYieldedMessage,
          "Use this message to generate a summary of the chat as a 1-5 word title without punctuation. Use sentence case",
          { length: 15 }
        );
        title = title.trim().slice(0, 50);
      } catch {
        title =
          lastYieldedMessage.slice(0, 30) +
          (lastYieldedMessage.length > 30 ? "..." : "");
      }

      conversation.tags.title = title;

      await client.callAction({
        type: "webchat:customEvent",
        input: {
          conversationId: conversation.id,
          event: JSON.stringify({ type: "conversationTitle", title }),
        },
      });
    }

    state.context = [];
  },
  state: z.object({
    context: z.array(z.string()),
  }),
});
