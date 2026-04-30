import { useEffect, useRef, useState } from 'react'
import { Markdown } from '@/components/Markdown'

export interface ChatMessage {
  id: string
  direction: 'incoming' | 'outgoing'
  text: string
}

interface MessagesProps {
  messages: ChatMessage[]
  isThinking: boolean
  thinkingComponent?: React.ReactNode
  conversationId?: string
}

/**
 * Centered max-width column. User messages get a soft pill; assistant
 * messages have NO bubble — just text on the page background, like
 * Claude / ChatGPT. Auto-scrolls to bottom on new content.
 *
 * Newly arrived assistant messages stream in (typing-style reveal). Older
 * messages — present at mount or fetched on conversation switch — render
 * instantly. Detection happens in a post-commit effect (StrictMode-safe).
 */
export function Messages({
  messages,
  isThinking,
  thinkingComponent,
  conversationId,
}: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenRef = useRef<Set<string>>(new Set())
  const lastConvoRef = useRef<string | undefined>(undefined)
  const [streamingId, setStreamingId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // First mount or a conversation switch: snapshot whatever's already on
    // screen so existing history doesn't replay. Don't stream anything.
    if (lastConvoRef.current !== conversationId) {
      lastConvoRef.current = conversationId
      seenRef.current = new Set(messages.map((m) => m.id))
      setStreamingId(undefined)
      return
    }
    // Same conversation: any incoming message we haven't seen is a fresh
    // arrival. Stream the latest one; mark all current IDs as seen.
    const newIncoming = messages.filter(
      (m) => m.direction === 'incoming' && !seenRef.current.has(m.id),
    )
    for (const m of messages) seenRef.current.add(m.id)
    const latest = newIncoming[newIncoming.length - 1]
    if (latest) setStreamingId(latest.id)
  }, [messages, conversationId])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isThinking])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-subtle">
      <div className="mx-auto max-w-2xl w-full px-5 py-6 space-y-5">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} animate={m.id === streamingId} />
        ))}
        {isThinking && thinkingComponent}
      </div>
    </div>
  )
}

function MessageRow({ message, animate }: { message: ChatMessage; animate: boolean }) {
  const isUser = message.direction === 'outgoing'
  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[85%] rounded-2xl bg-user-bubble text-user-bubble-foreground px-4 py-2.5 text-[14px] leading-6 whitespace-pre-wrap break-words">
          {message.text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-full break-words">
        {animate ? (
          <StreamingMarkdown text={message.text} />
        ) : (
          <Markdown text={message.text} />
        )}
      </div>
    </div>
  )
}

/**
 * Reveals text gradually so the response feels streamed instead of
 * popping in. Re-parses Markdown on each tick — fine for short messages,
 * and the chunk size scales with length to keep total time reasonable.
 */
function StreamingMarkdown({ text }: { text: string }) {
  const [revealed, setRevealed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const charsPerTick = Math.max(6, Math.ceil(text.length / 240))

    const tick = () => {
      if (cancelled) return
      if (indexRef.current >= text.length) {
        setRevealed(text)
        return
      }
      indexRef.current = Math.min(indexRef.current + charsPerTick, text.length)
      setRevealed(text.slice(0, indexRef.current))
      timer = setTimeout(tick, 16)
    }

    timer = setTimeout(tick, 16)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [text])

  return <Markdown text={revealed} />
}
