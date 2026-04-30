import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useWebchat } from '@botpress/webchat'
import { CLIENT_ID } from '@/config/constants'
import { useParentWindowMessages } from '@/hooks/useParentWindowMessages'
import { useThemeFromParent } from '@/hooks/useThemeFromParent'
import { Header } from '@/components/Header'
import { EmptyState } from '@/components/EmptyState'
import { Messages, type ChatMessage } from '@/components/Messages'
import { WorkingIndicator } from '@/components/WorkingIndicator'
import { Composer } from '@/components/Composer'

export default function App() {
  const webchat = useWebchat({ clientId: CLIENT_ID })
  const { client, messages, isTyping, user } = webchat
  const userId = user?.userId

  // Map raw BlockMessages → text-only bubbles. Webchat wraps text inside a
  // `bubble` block, so the path is `m.block.block.text`.
  const chatMessages: ChatMessage[] = useMemo(
    () =>
      messages
        .map((m) => {
          const outer = m.block as { type?: string; block?: { type?: string; text?: string } }
          const inner = outer?.type === 'bubble' ? outer.block : outer
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
      if (!client) {
        pendingRef.current.push(text)
        return
      }
      void client.sendMessage({ type: 'text', text })
    },
    [client],
  )

  useEffect(() => {
    if (!client || pendingRef.current.length === 0) return
    const queue = pendingRef.current
    pendingRef.current = []
    for (const text of queue) {
      void client.sendMessage({ type: 'text', text })
    }
  }, [client])

  useParentWindowMessages(handleSend)
  useThemeFromParent()

  const hasMessages = chatMessages.length > 0
  const isBusy = Boolean(isTyping)

  return (
    <div className="h-full flex flex-col bg-background">
      <Header />

      {hasMessages ? (
        <Messages
          messages={chatMessages}
          isThinking={isBusy}
          thinkingComponent={<WorkingIndicator />}
        />
      ) : (
        <EmptyState onPick={handleSend} />
      )}

      <Composer onSend={handleSend} />
    </div>
  )
}
