import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useActiveConversation,
  useConversationList,
  useConversations,
  useUser,
  useWebchatContext,
} from '@botpress/webchat'
import { CLIENT_ID } from '@/config/constants'
import { useParentWindowMessages } from '@/hooks/useParentWindowMessages'
import { useThemeFromParent } from '@/hooks/useThemeFromParent'
import { Header } from '@/components/Header'
import { EmptyState } from '@/components/EmptyState'
import { Messages, type ChatMessage } from '@/components/Messages'
import { WorkingIndicator } from '@/components/WorkingIndicator'
import { Composer } from '@/components/Composer'

function parseCitations(raw: string): { title: string; url: string }[] | undefined {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return undefined
    return parsed.filter(
      (item): item is { title: string; url: string } =>
        typeof item?.title === 'string' && typeof item?.url === 'string',
    )
  } catch {
    return undefined
  }
}

export default function App() {
  const { messages, sendMessage, status, isTyping, conversationId } = useActiveConversation()
  const { userCredentials } = useUser()
  const userId = userCredentials?.userId
  const { listConversations, openConversation } = useConversations()
  const { client } = useWebchatContext()
  const { conversations, isLoading: isListLoading, refresh } = useConversationList({
    clientId: CLIENT_ID,
    listConversations,
    userCredentials,
  })

  // Fetch the first user message of a conversation — used by the dropdown
  // as a "title" since the API doesn't provide one. Paginates from newest
  // to oldest until the user's earliest message is found, capped at a few
  // pages so very long conversations don't block the UI.
  const fetchConversationTitle = useCallback(
    async (id: string): Promise<string | undefined> => {
      if (!client || !userId) return undefined
      type Msg = {
        userId?: string
        createdAt?: string
        payload?: { type?: string; text?: string }
      }
      const all: Msg[] = []
      let nextToken: string | undefined = undefined
      let pages = 0
      do {
        const res = (await client.listConversationMessages({
          conversationId: id,
          ...(nextToken ? { nextToken } : {}),
        })) as { messages: Msg[]; meta?: { nextToken?: string } }
        all.push(...res.messages)
        nextToken = res.meta?.nextToken
        pages += 1
      } while (nextToken && pages < 5)
      all.sort(
        (a, b) =>
          new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
      )
      const firstUser = all.find(
        (m) => m.userId === userId && m.payload?.type === 'text' && m.payload.text,
      )
      return firstUser?.payload?.text
    },
    [client, userId],
  )

  const isReady = status === 'connected'

  // Map raw BlockMessages → chat bubbles. Webchat wraps text inside a
  // `bubble` block, so the path is `m.block.block.text`.
  // Bot messages may contain a hidden <!--SOURCES:[...]--> marker appended
  // after the answer text — we strip it and expose citations separately.
  // Custom feedback prompt messages are mapped to frontend feedback cards.
  const chatMessages: ChatMessage[] = useMemo(
    () =>
      messages
        .map((m) => {
          const outer = m.block as { type?: string; block?: unknown; text?: string; name?: string; data?: unknown }
          const inner = (outer?.type === 'bubble' ? outer.block : outer) as
            | {
                type?: string
                text?: string
                name?: string
                data?: Record<string, unknown>
                payload?: { name?: string; data?: Record<string, unknown> }
              }
            | undefined
          const direction = m.authorId === userId ? 'outgoing' : 'incoming'

          if (inner?.type === 'text' && typeof inner.text === 'string') {
            const rawText = inner.text
            // Filter structured feedback submissions from the visible chat history
            if (direction === 'outgoing' && rawText.startsWith('ADK_FEEDBACK:')) return null

            const match = rawText.match(/\n?<!--SOURCES:([\s\S]+?)-->$/)
            const rawCitations = match ? parseCitations(match[1]) : undefined
            const citations = rawCitations?.filter(
              (s) =>
                s.url.startsWith('http') &&
                !s.title.startsWith('data_source://') &&
                !s.url.includes('raw.githubusercontent.com'),
            )
            const text = match ? rawText.slice(0, rawText.length - match[0].length).trim() : rawText
            const msg: ChatMessage = {
              id: m.id,
              direction,
              kind: 'text',
              text,
              ...(citations !== undefined && { citations }),
            }
            return msg
          }

          const customName = inner?.name ?? inner?.payload?.name
          if (direction === 'incoming' && inner?.type === 'custom' && customName === 'adk.feedbackPrompt') {
            const data = inner.data ?? inner.payload?.data ?? {}
            const question = typeof data.question === 'string' ? data.question : ''
            const reason = data.reason === 'active_conversation' ? 'active_conversation' : 'unanswered'
            if (!question) return null
            return {
              id: m.id,
              direction,
              kind: 'feedbackPrompt',
              question,
              reason,
            }
          }

          return null
        })
        .filter((m): m is ChatMessage => m !== null),
    [messages, userId],
  )

  const latestIncomingMessageId = useMemo(
    () => [...chatMessages].reverse().find((m) => m.direction === 'incoming')?.id,
    [chatMessages],
  )
  const latestIncomingMessageIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    latestIncomingMessageIdRef.current = latestIncomingMessageId
  }, [latestIncomingMessageId])

  // Queue messages that arrive before webchat connects; flush when ready.
  const pendingRef = useRef<string[]>([])
  const pendingBaselineIncomingIdRef = useRef<string | undefined>(undefined)
  const [pendingResponse, setPendingResponse] = useState(false)

  const handleSend = useCallback(
    (text: string) => {
      if (!isReady) {
        console.warn('[adk-bot-frontend] Webchat is not connected; queueing message', { status })
        pendingRef.current.push(text)
        return
      }
      if (!text.startsWith('ADK_FEEDBACK:')) {
        pendingBaselineIncomingIdRef.current = latestIncomingMessageIdRef.current
        setPendingResponse(true)
      }
      void sendMessage({ type: 'text', text }).catch((error) => {
        console.error('[adk-bot-frontend] Failed to send message', { status, conversationId, error })
        setPendingResponse(false)
      })
    },
    [conversationId, isReady, sendMessage, status],
  )

  const feedbackPendingRef = useRef(false)

  const handleFeedbackSubmit = useCallback(
    (question: string, feedback: string, reason: 'unanswered' | 'active_conversation', rating?: number) => {
      feedbackPendingRef.current = true
      handleSend(`ADK_FEEDBACK:${JSON.stringify({ question, feedback, reason, rating })}`)
    },
    [handleSend],
  )

  useEffect(() => {
    if (!isTyping) feedbackPendingRef.current = false
  }, [isTyping])

  useEffect(() => {
    if (!isReady || pendingRef.current.length === 0) return
    const queue = pendingRef.current
    pendingRef.current = []
    for (const text of queue) {
      if (!text.startsWith('ADK_FEEDBACK:')) {
        pendingBaselineIncomingIdRef.current = latestIncomingMessageIdRef.current
        setPendingResponse(true)
      }
      void sendMessage({ type: 'text', text }).catch((error) => {
        console.error('[adk-bot-frontend] Failed to send queued message', { status, conversationId, error })
        setPendingResponse(false)
      })
    }
  }, [conversationId, isReady, sendMessage, status])

  useEffect(() => {
    if (
      pendingResponse &&
      latestIncomingMessageId &&
      latestIncomingMessageId !== pendingBaselineIncomingIdRef.current
    ) {
      setPendingResponse(false)
    }
  }, [latestIncomingMessageId, pendingResponse])

  useEffect(() => {
    if (!pendingResponse) return
    const timeout = window.setTimeout(() => setPendingResponse(false), 30000)
    return () => window.clearTimeout(timeout)
  }, [pendingResponse])

  const handleSwitchConversation = useCallback(
    (id: string) => {
      openConversation(id)
    },
    [openConversation],
  )

  const handleNewConversation = useCallback(() => {
    openConversation()
    void refresh()
  }, [openConversation, refresh])

  useParentWindowMessages(handleSend)
  useThemeFromParent()

  const hasMessages = chatMessages.length > 0
  const isBusy = (Boolean(isTyping) || pendingResponse) && !feedbackPendingRef.current

  const [fading, setFading] = useState(false)
  const prevConvoId = useRef(conversationId)
  useEffect(() => {
    if (prevConvoId.current === conversationId) return
    const prev = prevConvoId.current
    prevConvoId.current = conversationId
    if (prev === undefined) return  // initial connection — no fade
    setFading(true)
    const t = setTimeout(() => setFading(false), 100)
    return () => clearTimeout(t)
  }, [conversationId])

  return (
    <div className="h-full flex flex-col bg-background">
      <Header
        conversations={conversations}
        isLoading={isListLoading}
        currentConversationId={conversationId}
        onSwitchConversation={handleSwitchConversation}
        onNewConversation={handleNewConversation}
        onRefresh={refresh}
        getTitle={fetchConversationTitle}
      />

      <div
        className="flex-1 flex flex-col min-h-0"
        style={{
          opacity: fading ? 0 : 1,
          transition: fading ? 'opacity 80ms ease-in' : 'opacity 200ms ease-out',
        }}
      >
        {hasMessages ? (
          <Messages
            messages={chatMessages}
            isThinking={isBusy}
            thinkingComponent={<WorkingIndicator />}
            conversationId={conversationId}
            onSubmitFeedback={handleFeedbackSubmit}
          />
        ) : (
          <EmptyState onPick={handleSend} conversationId={conversationId} />
        )}
      </div>

      <Composer onSend={handleSend} disabled={isBusy} />
    </div>
  )
}
