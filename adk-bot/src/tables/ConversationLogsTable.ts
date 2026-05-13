import { Table, z } from '@botpress/runtime'

export const TOPICS = [
  'conversations',
  'workflows',
  'tools',
  'actions',
  'triggers',
  'knowledge_bases',
  'tables',
  'integrations',
  'cli',
  'debugging',
  'evals',
  'frontend',
  'zai',
  'agent_config',
  'getting_started',
  'other',
] as const

export type Topic = (typeof TOPICS)[number]
export const CONVERSATION_OUTCOMES = ['answered', 'unanswered', 'unrelated'] as const
export type ConversationOutcome = (typeof CONVERSATION_OUTCOMES)[number]

export const ConversationLogsTable = new Table({
  name: 'ConversationLogsTable',
  description: 'Logs all user questions and bot answers with topic classification for analysis',

  columns: {
    question: {
      schema: z.string().min(1),
      searchable: true,
    },
    answer: z.string(),
    topic: z.enum(TOPICS),
    userId: z.string(),
    conversationId: z.string(),
    outcome: z.enum(CONVERSATION_OUTCOMES).default('answered'),
    wasAnswered: z.boolean().default(true),
  },
})
