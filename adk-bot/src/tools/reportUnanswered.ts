import { Autonomous, z, user, context } from '@botpress/runtime'
import { UnansweredQuestionsTable } from '../tables/UnansweredQuestionsTable'
import { classifyTopic } from '../utils/conversationLogs'

const DEDUP_SIMILARITY = 0.85

export const reportUnanswered = new Autonomous.Tool({
  name: 'reportUnanswered',
  description:
    'Log a user question that the knowledge base could not answer, so the team can review. Call this only for genuine ADK/Botpress questions you tried to answer but failed — not for off-topic or trivial chit-chat. The handler dedupes against recent similar questions automatically.',

  input: z.object({
    question: z.string().min(1).describe("The user's original question, verbatim"),
  }),

  output: z.string(),

  handler: async ({ question }) => {
    const conversation = context.get('conversation', { optional: true })

    try {
      const recent = await UnansweredQuestionsTable.findRows({
        filter: {
          userId: user.id,
        },
        search: question,
        limit: 5,
      })
      const dup = recent.rows.find((r) => r.similarity >= DEDUP_SIMILARITY)
      if (dup) {
        return 'A similar unanswered question is already logged for this user — skipped duplicate.'
      }
    } catch {
      // Search is best-effort; fall through and insert normally.
    }

    await UnansweredQuestionsTable.createRows({
      rows: [
        {
          question,
          userId: user.id,
          conversationId: conversation?.id ?? 'unknown',
          topic: classifyTopic(question),
        },
      ],
    })

    return 'Question logged for the team to review.'
  },
})
