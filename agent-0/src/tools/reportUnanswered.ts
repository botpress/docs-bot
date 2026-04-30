import { Autonomous, z, user, context } from '@botpress/runtime'
import { UnansweredQuestionsTable } from '../tables/UnansweredQuestionsTable'

export const reportUnanswered = new Autonomous.Tool({
  name: 'reportUnanswered',
  description:
    'Use this tool when you cannot find the answer to a question in the knowledge base. It logs the question for the team to review.',

  input: z.object({
    question: z.string().describe('The question that could not be answered'),
  }),

  output: z.string(),

  handler: async ({ question }) => {
    const conversation = context.get('conversation', { optional: true })

    await UnansweredQuestionsTable.createRows({
      rows: [
        {
          question,
          channel: 'webchat',
          userId: user.id,
          conversationId: conversation?.id ?? 'unknown',
          askedAt: new Date().toISOString(),
          status: 'pending',
        },
      ],
    })

    return 'Question has been logged for the team to review.'
  },
})
