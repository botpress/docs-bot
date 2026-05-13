import { Table, z } from '@botpress/runtime'

export const FeedbackTable = new Table({
  name: 'FeedbackTable',
  description: 'User-submitted feedback on questions the ADK bot could not answer',

  columns: {
    question: {
      schema: z.string().min(1),
      searchable: true,
    },
    feedback: {
      schema: z.string().min(1),
      searchable: true,
    },
    reason: z.enum(['unanswered', 'active_conversation']).default('unanswered'),
    userId: z.string(),
    conversationId: z.string(),
    status: z.enum(['new', 'reviewed', 'dismissed']).default('new'),
  },
})
