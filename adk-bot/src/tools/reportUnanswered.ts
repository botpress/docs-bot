import { Autonomous, z, user, context } from '@botpress/runtime'
import { UnansweredQuestionsTable } from '../tables/UnansweredQuestionsTable'

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000 // 24h
const DEDUP_SIMILARITY = 0.85

type ChannelTag = 'webchat' | 'chat' | 'unknown'

function channelOf(channelString: string | undefined): ChannelTag {
  // conversation.channel is e.g. "webchat.channel" or "chat.channel".
  const head = channelString?.split('.')[0]
  return head === 'webchat' || head === 'chat' ? head : 'unknown'
}

/**
 * Tool the model calls when the knowledge base doesn't contain an answer.
 *
 * Before inserting, runs a semantic search on the searchable `question`
 * column scoped to the same userId in the last 24 hours. If a
 * sufficiently similar question is already pending, we skip the write so
 * the table doesn't fill up with rephrasings of the same gap.
 */
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
    const channel = channelOf(conversation?.channel)
    const askedAt = new Date().toISOString()
    const since = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString()

    // Semantic dedup against the same user's recent pending questions.
    try {
      const recent = await UnansweredQuestionsTable.findRows({
        filter: {
          userId: user.id,
          status: 'pending',
          askedAt: { $gte: since },
        },
        search: question,
        limit: 5,
      })
      const dup = recent.rows.find((r) => r.similarity >= DEDUP_SIMILARITY)
      if (dup) {
        return 'A similar unanswered question is already logged for this user — skipped duplicate.'
      }
    } catch {
      // Search is best-effort. If it fails (e.g. empty table on first run),
      // fall through and insert normally.
    }

    await UnansweredQuestionsTable.createRows({
      rows: [
        {
          question,
          channel,
          userId: user.id,
          conversationId: conversation?.id ?? 'unknown',
          askedAt,
          status: 'pending',
        },
      ],
    })

    return 'Question logged for the team to review.'
  },
})
