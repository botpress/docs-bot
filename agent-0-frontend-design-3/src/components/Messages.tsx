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
 * Centered max-width column. User messages get a soft pill; assistant
 * messages have NO bubble — just text on the page background, like
 * Claude / ChatGPT. Auto-scrolls to bottom on new content.
 */
export function Messages({ messages, isThinking, thinkingComponent }: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isThinking])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl w-full px-5 py-6 space-y-5">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
        {isThinking && thinkingComponent}
      </div>
    </div>
  )
}

function MessageRow({ message }: { message: ChatMessage }) {
  const isUser = message.direction === 'outgoing'
  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      {isUser ? (
        <div className="max-w-[85%] rounded-2xl bg-user-bubble text-user-bubble-foreground px-4 py-2.5 text-[14px] leading-6 whitespace-pre-wrap break-words">
          {message.text}
        </div>
      ) : (
        <div className="max-w-full text-[14px] leading-6.5 text-foreground whitespace-pre-wrap break-words">
          {message.text}
        </div>
      )}
    </div>
  )
}
