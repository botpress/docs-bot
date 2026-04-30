import { Table, z } from '@botpress/runtime'

export const UnansweredQuestionsTable = new Table({
  name: 'UnansweredQuestionsTable',
  description: 'Tracks questions agent-0 could not answer from the knowledge base',

  columns: {
    question: {
      schema: z.string(),
      searchable: true,
    },
    channel: z.string(),
    userId: z.string(),
    conversationId: z.string(),
    askedAt: z.string().describe('ISO 8601 timestamp'),
    status: z.enum(['pending', 'answered', 'dismissed']).default('pending'),
  },
})
