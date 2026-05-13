import { context, user } from '@botpress/runtime'
import { ConversationLogsTable, type ConversationOutcome, type Topic } from '../tables/ConversationLogsTable'

type WeightedPattern = [Topic, RegExp, number]

const QUESTION_TOPIC_PATTERNS: WeightedPattern[] = [
  ['integrations', /\b(integration|integrations|slack|linear|github|notion|zendesk|hubspot|salesforce|whatsapp|telegram|teams|discord|oauth|credentials|webhook url)\b/i, 8],
  ['tables', /\b(table|tables|row|rows|column|columns|record|records|findRows|createRows|updateRows|deleteRows|upsertRows|semantic search|computed column)\b/i, 8],
  ['tools', /\b(tool|tools|tool call|tool calls|execute\(|asTool|autonomous\.tool)\b/i, 8],
  ['workflows', /\b(workflow|workflows|step\(|workflow callback|resume|suspend|schedule|scheduled workflow|long-running)\b/i, 8],
  ['actions', /\b(action|actions|callAction|integration action|custom action)\b/i, 8],
  ['triggers', /\b(trigger|triggers|event|events|webhook event)\b/i, 8],
  ['knowledge_bases', /\b(knowledge base|knowledge bases|kb|rag|search_knowledge|data source|datasource|index|sync documents?|crawl|sitemap)\b/i, 8],
  ['evals', /\b(eval|evals|evaluation|evaluations|assert|assertions|regression|llm_judge|judgePassThreshold)\b/i, 8],
  ['frontend', /\b(frontend|react|component|custom component|webchat|client id|iframe|browser|postMessage|ui|vite)\b/i, 8],
  ['zai', /\b(zai|extract|rewrite|classify|generate object|structured output)\b/i, 8],
  ['agent_config', /\b(agent\.config|defaultModels|model configuration|dependencies|config variable|secret|secrets|environment config)\b/i, 8],
  ['cli', /\b(adk dev|adk build|adk deploy|adk add|adk search|adk list|adk evals|cli|command)\b/i, 7],
  ['debugging', /\b(debug|debugging|trace|traces|logs?|issue|inspect|dev console|agent steps|error)\b/i, 7],
  ['getting_started', /\b(quickstart|getting started|install|installation|init|create.*bot|start.*adk|setup)\b/i, 7],
  ['conversations', /\b(conversation handler|conversations?\.ts|message handler|conversation state|conversation lifecycle|transcript|context api|send message|conversation\.send)\b/i, 8],
  ['conversations', /\b(conversation|conversations|message|messages|chat)\b/i, 2],
]

const ANSWER_TOPIC_PATTERNS: WeightedPattern[] = QUESTION_TOPIC_PATTERNS.map(([topic, pattern, weight]) => [
  topic,
  pattern,
  Math.max(1, Math.floor(weight / 2)),
])

function scorePatterns(text: string, patterns: WeightedPattern[], scores: Map<Topic, number>) {
  for (const [topic, pattern, weight] of patterns) {
    if (!pattern.test(text)) continue
    scores.set(topic, (scores.get(topic) ?? 0) + weight)
  }
}

export function classifyTopic(question: string, answer = ''): Topic {
  const scores = new Map<Topic, number>()
  scorePatterns(question, QUESTION_TOPIC_PATTERNS, scores)
  scorePatterns(answer, ANSWER_TOPIC_PATTERNS, scores)

  let bestTopic: Topic = 'other'
  let bestScore = 0
  for (const [topic, score] of scores) {
    if (score <= bestScore) continue
    bestTopic = topic
    bestScore = score
  }

  return bestScore > 0 ? bestTopic : 'other'
}

export async function logConversationTurn({
  question,
  answer,
  outcome,
  topic,
  wasAnswered,
}: {
  question: string
  answer: string
  outcome?: ConversationOutcome
  topic?: Topic
  wasAnswered?: boolean
}) {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion) return

  const conversation = context.get('conversation', { optional: true })
  const resolvedTopic = topic ?? classifyTopic(trimmedQuestion, answer)
  const resolvedOutcome: ConversationOutcome = outcome ?? (wasAnswered ? 'answered' : 'unanswered')

  await ConversationLogsTable.createRows({
    rows: [
      {
        question: trimmedQuestion,
        answer,
        topic: resolvedTopic,
        userId: user.id,
        conversationId: conversation?.id ?? 'unknown',
        outcome: resolvedOutcome,
        wasAnswered: resolvedOutcome === 'answered',
      },
    ],
  })
}
