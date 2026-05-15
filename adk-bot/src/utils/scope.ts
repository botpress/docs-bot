const STRONG_ADK_RE =
  /\b(?:botpress|adk|agent development kit|botpress cloud|webchat|zai|autonomous|@botpress\/runtime|dev console|bp client|bpclient)\b/i

const DOCS_CONCEPT_RE =
  /\b(?:action|actions|agent|agents|asset|assets|bot|bots|channel|channels|cli|component|components|conversation|conversations|deploy|deployment|eval|evals|event|events|file|files|hook|hooks|integration|integrations|knowledge base|knowledge bases|message|messages|mcp|node|runtime|state|table|tables|tag|tags|tool|tools|trace|traces|trigger|triggers|workflow|workflows)\b/i

const DOCS_CONCEPT_TERMS = [
  'action',
  'agent',
  'asset',
  'bot',
  'channel',
  'cli',
  'component',
  'conversation',
  'deploy',
  'deployment',
  'eval',
  'event',
  'file',
  'hook',
  'integration',
  'message',
  'mcp',
  'node',
  'runtime',
  'state',
  'table',
  'tag',
  'tool',
  'trace',
  'trigger',
  'workflow',
  'knowledge',
  'base',
]

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

function singularizeToken(token: string) {
  return token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token
}

function editDistanceAtMost(a: string, b: string, maxEdits: number) {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > maxEdits) return false

  const previous = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    let rowMin = current[0]

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      )
      rowMin = Math.min(rowMin, current[j])
    }

    if (rowMin > maxEdits) return false
    previous.splice(0, previous.length, ...current)
  }

  return previous[b.length] <= maxEdits
}

function hasFuzzyDocsConcept(question: string) {
  const tokens = question
    .toLowerCase()
    .match(/[a-z][a-z/-]*/g)
    ?.flatMap((token) => token.split(/[/-]/))
    .map(singularizeToken)
    .filter((token) => token.length >= 4) ?? []

  return tokens.some((token) =>
    DOCS_CONCEPT_TERMS.some((term) => editDistanceAtMost(token, term, term.length >= 10 ? 3 : term.length >= 7 ? 2 : 1)),
  )
}

export function checkAdkQuestionScope(question: string, recentContext: string): ScopeDecision {
  const hasStrongSignal = STRONG_ADK_RE.test(question)
  const hasDocsConcept = DOCS_CONCEPT_RE.test(question) || hasFuzzyDocsConcept(question)
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
