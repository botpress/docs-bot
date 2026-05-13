import { Table, z } from '@botpress/runtime'
import { TOPICS } from './ConversationLogsTable'

/**
 * Tracks questions the ADK bot could not answer from the knowledge base.
 *
 * The `question` column is searchable so `findRows({ search })` can do
 * semantic dedup before inserting (a rephrased "How do I create a tool?"
 * shouldn't get logged ten times).
 */
export const UnansweredQuestionsTable = new Table({
  name: 'UnansweredQuestionsTable',
  description: 'Tracks questions the ADK bot could not answer from the knowledge base',

  columns: {
    question: {
      schema: z.string().min(1),
      searchable: true,
    },
    userId: z.string(),
    conversationId: z.string(),
    topic: z.enum(TOPICS),
  },
})
