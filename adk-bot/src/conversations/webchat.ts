import { Autonomous, Conversation, z, user, context, secrets } from '@botpress/runtime'
import { WebsiteKB } from '../knowledge'
import { FeedbackTable } from '../tables/FeedbackTable'
import { reportUnanswered } from '../tools/reportUnanswered'
import { getConversationTurnCounts, getRecentConversationContext } from '../utils/conversationContext'
import { logConversationTurn } from '../utils/conversationLogs'
import { greetingReply, isSimpleGreeting } from '../utils/greetings'
import { makeGuardrails } from '../utils/guardrails'
import { sanitizeAnswer } from '../utils/sanitizeAnswer'
import { appendRelevantScreenshot } from '../utils/screenshots'
import { checkAdkQuestionScope } from '../utils/scope'

const FEEDBACK_PREFIX = 'ADK_FEEDBACK:'
const ACTIVE_USER_MESSAGE_THRESHOLD = 5

type FeedbackReason = 'unanswered' | 'active_conversation'

async function sendFeedbackPrompt(
  conversation: { send: (message: { type: 'custom'; payload: { name: string; url: string; data: { question: string; reason: FeedbackReason } } }) => Promise<unknown> },
  data: { question: string; reason: FeedbackReason },
) {
  await conversation.send({
    type: 'custom',
    payload: {
      name: 'adk.feedbackPrompt',
      url: '',
      data,
    },
  })
}

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
    unanswered: z.boolean().default(false).describe('True only when the knowledge base could not answer the user question.'),
    unansweredQuestion: z.string().optional().describe('The original user question when unanswered is true.'),
  }),
})

export const Webchat = new Conversation({
  channel: ['webchat.channel'] as const,
  state: z.object({
    activeFeedbackPromptSent: z.boolean().default(false),
  }),

  async handler({ message, execute, conversation, state }) {
    const question = message?.type === 'text' ? message.payload.text.trim() : ''

    if (!question) {
      await conversation.send({
        type: 'text',
        payload: { text: 'Send me a text question about Botpress ADK and I can help.' },
      })
      return
    }

    if (question.startsWith(FEEDBACK_PREFIX)) {
      try {
        const { question: origQuestion, feedback, reason, rating } = JSON.parse(question.slice(FEEDBACK_PREFIX.length))
        if (typeof origQuestion !== 'string' || !origQuestion.trim()) {
          throw new Error('Invalid feedback payload')
        }
        const feedbackReason: FeedbackReason = reason === 'active_conversation' ? 'active_conversation' : 'unanswered'
        const parsedRating = typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : undefined
        const feedbackText = typeof feedback === 'string' ? feedback.trim() : ''
        if (!feedbackText && parsedRating === undefined) {
          throw new Error('Invalid feedback payload')
        }
        const conv = context.get('conversation', { optional: true })
        await FeedbackTable.createRows({
          rows: [
            {
              question: origQuestion.trim(),
              feedback: feedbackText,
              reason: feedbackReason,
              rating: parsedRating,
              userId: user.id,
              conversationId: conv?.id ?? 'unknown',
              status: 'new',
            },
          ],
        })
        await fetch('https://api.anthropic.com/v1/claude_code/routines/trig_01Khn7iqcNN6EMU6WUNXxXxf/fire', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secrets.CLAUDE_ROUTINE_TOKEN}`,
            'anthropic-version': '2023-06-01',
            'anthropic-beta': 'experimental-cc-routine-2026-04-01',
          },
          body: JSON.stringify({
            text: JSON.stringify({
              question: origQuestion.trim(),
              feedback: feedbackText,
              rating: parsedRating,
              conversationId: conv?.id ?? 'unknown',
            }),
          }),
        }).catch(() => {})
        await conversation.send({
          type: 'text',
          payload: { text: 'Thanks — your feedback was sent to the ADK docs team.' },
        })
      } catch {
        await conversation.send({
          type: 'text',
          payload: { text: "Sorry, I couldn't save that feedback. Please try again." },
        })
      }
      return
    }

    if (isSimpleGreeting(question)) {
      const answer = greetingReply()
      await conversation.send({
        type: 'text',
        payload: { text: answer },
      })
      await logConversationTurn({ question, answer, outcome: 'answered', topic: 'getting_started' })
      return
    }

    const recentContext = await getRecentConversationContext(question)
    const turnCounts = await getConversationTurnCounts(question)
    const scope = checkAdkQuestionScope(question, recentContext)
    if (!scope.allowed) {
      const answer = scope.response ?? 'Ask me a Botpress ADK docs question and I can help.'
      await conversation.send({
        type: 'text',
        payload: { text: answer },
      })
      await logConversationTurn({ question, answer, outcome: 'unrelated', topic: 'other' })
      return
    }

    const result = await execute({
      hooks: makeGuardrails(),
      instructions: `You are the Botpress ADK assistant.

## Role
You help developers build with the Botpress Agent Development Kit (ADK). You answer questions about ADK concepts, project structure, integrations, workflows, conversations, tables, tools, actions, triggers, knowledge bases, Zai, the CLI, and related topics.

## Current user question
Answer this exact question: ${JSON.stringify(question)}

## Recent conversation context
Use this only to resolve follow-up references in the current question. It is not a source of truth.
${recentContext || 'No prior conversation context available.'}

## How to answer
- Always search the knowledge base before answering. Base your responses only on what you find there.
- Use recent conversation context to understand follow-up questions, but only answer with information supported by the knowledge base search results.
- Never make up or guess information. If the knowledge base does not contain the answer, use the reportUnanswered tool and let the user know.
- Include code examples when they help clarify. Use TypeScript and follow ADK conventions (import from @botpress/runtime, etc.).
- Keep responses clear and practical. Be friendly but not over-the-top.
- When relevant, mention which ADK primitive or file location applies (e.g. "this goes in src/tools/").
- For broad "how do I..." questions, include at most one short code example. Do not append extra pattern examples unless the user explicitly asks for examples, patterns, edge cases, or negative tests.
- If the knowledge base provides a screenshot URL for a UI feature, include it inline in your answer using markdown: ![description](url).
- Never link to raw.githubusercontent.com or any skills reference URL. Only link to botpress.com/docs pages.
- Do not add any "References", "Sources", "Key references used", or similar section at the end of your answer. Source citations are displayed to the user separately.

## When you don't know
If you search the knowledge base and cannot find a confident answer:
1. Call the reportUnanswered tool with the user's question.
2. Exit with unanswered=true and unansweredQuestion set to the user's original question.
3. Keep the answer brief: "Sorry, I don't have an answer for that one."

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
    const answer = appendRelevantScreenshot(sanitizeAnswer(result.output.answer), question)
    await conversation.send({
      type: 'text',
      payload: { text: answer + sourcesTag },
    })
    await logConversationTurn({
      question,
      answer,
      outcome: result.output.unanswered ? 'unanswered' : 'answered',
    })

    if (result.output.unanswered) {
      await sendFeedbackPrompt(conversation, {
        question: result.output.unansweredQuestion ?? question,
        reason: 'unanswered',
      })
      return
    }

    const hasActiveConversation = turnCounts.userMessages >= ACTIVE_USER_MESSAGE_THRESHOLD
      && turnCounts.assistantMessages + 1 >= ACTIVE_USER_MESSAGE_THRESHOLD
    if (!state.activeFeedbackPromptSent && hasActiveConversation) {
      state.activeFeedbackPromptSent = true
      await sendFeedbackPrompt(conversation, {
        question: question,
        reason: 'active_conversation',
      })
    }
  },
})
