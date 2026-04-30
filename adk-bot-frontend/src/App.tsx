import { useCallback, useEffect, useMemo, useRef } from 'react'
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

  // Map raw BlockMessages → text-only bubbles. Webchat wraps text inside a
  // `bubble` block, so the path is `m.block.block.text`.
  const chatMessages: ChatMessage[] = useMemo(
    () =>
      messages
        .map((m) => {
          const outer = m.block as { type?: string; block?: { type?: string; text?: string }; text?: string }
          const inner = (outer?.type === 'bubble' ? outer.block : outer) as
            | { type?: string; text?: string }
            | undefined
          if (inner?.type !== 'text' || typeof inner.text !== 'string') return null
          return {
            id: m.id,
            direction: m.authorId === userId ? ('outgoing' as const) : ('incoming' as const),
            text: inner.text,
          }
        })
        .filter((m): m is ChatMessage => m !== null),
    [messages, userId],
  )

  // Queue messages that arrive before webchat connects; flush when ready.
  const pendingRef = useRef<string[]>([])

  const handleSend = useCallback(
    (text: string) => {
      if (!isReady) {
        pendingRef.current.push(text)
        return
      }
      void sendMessage({ type: 'text', text })
    },
    [isReady, sendMessage],
  )

  useEffect(() => {
    if (!isReady || pendingRef.current.length === 0) return
    const queue = pendingRef.current
    pendingRef.current = []
    for (const text of queue) {
      void sendMessage({ type: 'text', text })
    }
  }, [isReady, sendMessage])

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
  const isBusy = Boolean(isTyping)

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

      {hasMessages ? (
        <Messages
          messages={chatMessages}
          isThinking={isBusy}
          thinkingComponent={<WorkingIndicator />}
          conversationId={conversationId}
        />
      ) : (
        <EmptyState onPick={handleSend} conversationId={conversationId} />
      )}

      <Composer onSend={handleSend} />
    </div>
  )
}
