import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useWebchat } from '@botpress/webchat'
import { CLIENT_ID } from '@/config/constants'
import { useParentWindowMessages } from '@/hooks/useParentWindowMessages'
import { useThemeFromParent } from '@/hooks/useThemeFromParent'
import { HeaderLabel } from '@/components/HeaderLabel'
import { EmptyState } from '@/components/EmptyState'
import { Messages, type ChatMessage } from '@/components/Messages'
import { WorkingIndicator } from '@/components/WorkingIndicator'
import { Composer } from '@/components/Composer'

export default function App() {
  const webchat = useWebchat({ clientId: CLIENT_ID })
  const { client, messages, isTyping, user } = webchat
  const userId = user?.userId

  // Map raw BlockMessages → simple text bubbles. The webchat wraps text
  // blocks inside a `bubble` block, so the actual text is at
  // `m.block.block.text` rather than `m.block.text`.
  // Direction is computed from authorId vs. our own user id (mirrors the
  // existing docs-bot frontend's useEnrichedMessages hook). Non-text blocks
  // are filtered out — this is a plain Q&A UI.
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

  // Queue messages that arrive before the webchat client connects (e.g. the
  // user types in the docs bottom input bubble during the iframe's first
  // mount, before useWebchat has finished its handshake). Flush as soon as
  // the client is ready.
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

  // Forward messages typed in the docs page's bottom input bubble
  useParentWindowMessages(handleSend)

  // Sync the iframe's theme to the docs page's light/dark setting
  useThemeFromParent()

  const hasMessages = chatMessages.length > 0
  const isBusy = Boolean(isTyping)

  return (
    <div className="h-full flex flex-col bg-background-surface">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border flex items-center">
        <HeaderLabel isBusy={isBusy} />
      </header>

      {/* Body — empty state OR messages */}
      {hasMessages ? (
        <Messages
          messages={chatMessages}
          isThinking={isBusy}
          thinkingComponent={<WorkingIndicator />}
        />
      ) : (
        <EmptyState />
      )}

      {/* Composer — always clickable; messages queue locally if webchat
          isn't connected yet and flush as soon as `client` becomes ready */}
      <Composer onSend={handleSend} />
    </div>
  )
}
