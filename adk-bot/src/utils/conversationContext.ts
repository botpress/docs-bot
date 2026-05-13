import { context } from '@botpress/runtime'

type TranscriptItem = {
  role?: string
  content?: string
  createdAt?: string
}

type ChatContext = {
  fetchTranscript: () => Promise<TranscriptItem[]>
}

const DEFAULT_LIMIT = 8
const DEFAULT_MAX_CHARS = 2400
const MAX_MESSAGE_CHARS = 360

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

function cleanTranscriptContent(content: string) {
  return content
    .replace(/\n?<!--SOURCES:[\s\S]+?-->$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, maxChars: number) {
  return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1).trim()}...`
}

export async function getRecentConversationContext(
  currentQuestion: string,
  options: { limit?: number; maxChars?: number } = {},
) {
  const limit = options.limit ?? DEFAULT_LIMIT
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS

  try {
    const chat = context.get('chat', { optional: true }) as ChatContext | null | undefined
    if (!chat?.fetchTranscript) return ''

    const transcript = await chat.fetchTranscript()
    const messages = transcript
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .map((item) => ({
        role: item.role === 'user' ? 'User' : 'Assistant',
        content: cleanTranscriptContent(item.content ?? ''),
        createdAt: item.createdAt,
      }))
      .filter((item) => item.content.length > 0)

    const last = messages.at(-1)
    if (last?.role === 'User' && normalizeText(last.content) === normalizeText(currentQuestion)) {
      messages.pop()
    }

    const recent = messages.slice(-limit)
    if (recent.length === 0) return ''

    let output = ''
    for (const item of recent) {
      const line = `${item.role}: ${truncate(item.content, MAX_MESSAGE_CHARS)}`
      if (output.length + line.length + 1 > maxChars) break
      output += output ? `\n${line}` : line
    }

    return output
  } catch {
    return ''
  }
}

export async function getConversationTurnCounts(currentQuestion: string) {
  try {
    const chat = context.get('chat', { optional: true }) as ChatContext | null | undefined
    if (!chat?.fetchTranscript) return { userMessages: 1, assistantMessages: 0 }

    const transcript = await chat.fetchTranscript()
    const messages = transcript
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .map((item) => ({
        role: item.role,
        content: cleanTranscriptContent(item.content ?? ''),
      }))
      .filter((item) => item.content.length > 0 && !item.content.startsWith('ADK_FEEDBACK:'))

    const userMessages = messages.filter((item) => item.role === 'user').length
    const assistantMessages = messages.filter((item) => item.role === 'assistant').length
    const hasCurrentUserMessage = messages.some(
      (item) => item.role === 'user' && normalizeText(item.content) === normalizeText(currentQuestion),
    )

    return {
      userMessages: userMessages + (hasCurrentUserMessage ? 0 : 1),
      assistantMessages,
    }
  } catch {
    return { userMessages: 1, assistantMessages: 0 }
  }
}
