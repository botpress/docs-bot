const STRONG_ADK_RE =
  /\b(?:botpress|adk|agent development kit|botpress cloud|webchat|zai|autonomous|@botpress\/runtime|dev console|bp client|bpclient)\b/i

const DOCS_CONCEPT_RE =
  /\b(?:action|actions|agent|agents|asset|assets|bot|bots|channel|channels|cli|component|components|conversation|conversations|deploy|deployment|eval|evals|event|events|file|files|hook|hooks|integration|integrations|knowledge base|knowledge bases|message|messages|mcp|node|runtime|state|table|tables|tag|tags|tool|tools|trace|traces|trigger|triggers|workflow|workflows)\b/i

const FOLLOW_UP_RE =
  /\b(?:it|its|that|this|these|those|there|they|them|previous|above|same|instead|also|what about|how about|show me|example|code|file|where|why|how|difference|compare)\b/i

const OBVIOUS_OFF_TOPIC_RE =
  /\b(?:capital of|weather|forecast|stock price|bitcoin|crypto|recipe|cook|bake|restaurant|hotel|flight|travel|football|basketball|baseball|soccer|nba|nfl|mlb|movie|song|lyrics|dating|medical|doctor|lawyer|legal advice|tax advice|homework|math problem|solve for|president|prime minister|election|news|translate this|write a poem|write a story)\b/i

const REFUSAL =
  "I'm here specifically for Botpress ADK docs questions. Ask me about ADK tools, workflows, conversations, integrations, knowledge bases, deployment, Webchat, or debugging."

export type ScopeDecision = {
  allowed: boolean
  response?: string
}

function hasRecentInScopeUserContext(recentContext: string) {
  return recentContext
    .split('\n')
    .filter((line) => line.startsWith('User:'))
    .some((line) => STRONG_ADK_RE.test(line) || DOCS_CONCEPT_RE.test(line))
}

function isLikelyFollowUp(question: string) {
  const normalized = question.trim()
  return normalized.length <= 140 || FOLLOW_UP_RE.test(normalized)
}

export function checkAdkQuestionScope(question: string, recentContext: string): ScopeDecision {
  const hasStrongSignal = STRONG_ADK_RE.test(question)
  const hasDocsConcept = DOCS_CONCEPT_RE.test(question)
  const isObviousOffTopic = OBVIOUS_OFF_TOPIC_RE.test(question)

  if (isObviousOffTopic && (!hasStrongSignal || !hasDocsConcept)) {
    return { allowed: false, response: REFUSAL }
  }

  if (hasStrongSignal || hasDocsConcept) return { allowed: true }

  if (hasRecentInScopeUserContext(recentContext) && isLikelyFollowUp(question) && !isObviousOffTopic) {
    return { allowed: true }
  }

  return { allowed: false, response: REFUSAL }
}
