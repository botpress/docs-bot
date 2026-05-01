import { Autonomous, Conversation, z } from '@botpress/runtime'
import { WebsiteKB } from '../knowledge'
import { reportUnanswered } from '../tools/reportUnanswered'
import { greetingReply, isSimpleGreeting } from '../utils/greetings'
import { makeGuardrails } from '../utils/guardrails'
import { sanitizeAnswer } from '../utils/sanitizeAnswer'

const AnswerExit = new Autonomous.Exit({
  name: 'answer',
  description: 'Call this when you have a final answer ready for the user.',
  schema: z.object({
    answer: z
      .string()
      .describe(
        'Your complete formatted answer in markdown. If the knowledge base includes a screenshot URL for this topic, embed it inline using markdown image syntax: ![description](url).',
      ),
    usedSources: z
      .array(z.object({ title: z.string(), url: z.string() }))
      .describe(
        'KB pages you actually consulted. Use exact titles and URLs from the search results — never invent or modify URLs. Include only pages you cited in your answer. Leave empty [] for greetings and off-topic replies.',
      ),
  }),
})

export const Webchat = new Conversation({
  channel: ['webchat.channel'] as const,

  async handler({ message, execute, conversation }) {
    const question = message?.type === 'text' ? message.payload.text.trim() : ''

    if (!question) {
      await conversation.send({
        type: 'text',
        payload: { text: 'Send me a text question about Botpress ADK and I can help.' },
      })
      return
    }

    if (isSimpleGreeting(question)) {
      await conversation.send({
        type: 'text',
        payload: { text: greetingReply() },
      })
      return
    }

    const result = await execute({
      hooks: makeGuardrails(),
      instructions: `You are the Botpress ADK assistant.

## Role
You help developers build with the Botpress Agent Development Kit (ADK). You answer questions about ADK concepts, project structure, integrations, workflows, conversations, tables, tools, actions, triggers, knowledge bases, Zai, the CLI, and related topics.

## Current user question
Answer this exact question: ${JSON.stringify(question)}

## How to answer
- Always search the knowledge base before answering. Base your responses only on what you find there.
- Never make up or guess information. If the knowledge base does not contain the answer, use the reportUnanswered tool and let the user know.
- Include code examples when they help clarify. Use TypeScript and follow ADK conventions (import from @botpress/runtime, etc.).
- Keep responses clear and practical. Be friendly but not over-the-top.
- When relevant, mention which ADK primitive or file location applies (e.g. "this goes in src/tools/").
- If the knowledge base provides a screenshot URL for a UI feature, include it inline in your answer using markdown: ![description](url).
- Do not add any "References", "Sources", "Key references used", or similar section at the end of your answer. Source citations are displayed to the user separately.

## When you don't know
If you search the knowledge base and cannot find a confident answer:
1. Call the reportUnanswered tool with the user's question.
2. Exit via the answer exit with something like: "I don't have a solid answer for that one. I've flagged it for the team — they'll follow up with an answer."

## Scope
- Only answer questions related to Botpress and the ADK.
- If someone asks something off-topic, politely let them know you're here specifically for Botpress ADK help and suggest where they might find what they need. Do NOT use the reportUnanswered tool for off-topic questions — only report genuine ADK/Botpress questions you couldn't answer.`,
      knowledge: [WebsiteKB],
      tools: [reportUnanswered],
      exits: [AnswerExit],
      mode: 'worker',
    })

    if (!result.is(AnswerExit)) {
      await conversation.send({ type: 'text', payload: { text: "I ran into an issue processing that. Could you try rephrasing your question?" } })
      return
    }

    const sources = result.output.usedSources ?? []
    const sourcesTag = sources.length > 0 ? `\n<!--SOURCES:${JSON.stringify(sources)}-->` : ''
    await conversation.send({ type: 'text', payload: { text: sanitizeAnswer(result.output.answer) + sourcesTag } })
  },
})
