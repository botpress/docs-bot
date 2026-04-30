import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  direction: 'incoming' | 'outgoing'
  text: string
}

interface MessagesProps {
  messages: ChatMessage[]
  isThinking: boolean
  thinkingComponent?: React.ReactNode
}

/**
 * Plain text message bubbles. Outgoing (user) sit right with a subtle
 * elevated background; incoming (assistant) flow left at the same surface
 * as the panel.
 */
export function Messages({ messages, isThinking, thinkingComponent }: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new content
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isThinking])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {isThinking && thinkingComponent}
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.direction === 'outgoing'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-5 whitespace-pre-wrap break-words',
          isUser
            ? 'bg-background-elevated text-foreground'
            : 'text-foreground',
        )}
      >
        {message.text}
      </div>
    </div>
  )
}
