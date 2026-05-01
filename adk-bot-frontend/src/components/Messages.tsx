import { useCallback, useEffect, useRef, useState } from 'react'
import { Markdown } from '@/components/Markdown'
import { SourcesFooter } from '@/components/SourcesFooter'

export interface ChatMessage {
  id: string
  direction: 'incoming' | 'outgoing'
  text: string
  citations?: { title: string; url: string }[]
}

interface MessagesProps {
  messages: ChatMessage[]
  isThinking: boolean
  thinkingComponent?: React.ReactNode
  conversationId?: string
}

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
    if (lastConvoRef.current !== conversationId) {
      lastConvoRef.current = conversationId
      seenRef.current = new Set(messages.map((m) => m.id))
      setStreamingId(undefined)
      return
    }
    const newIncoming = messages.filter(
      (m) => m.direction === 'incoming' && !seenRef.current.has(m.id),
    )
    for (const m of messages) seenRef.current.add(m.id)
    const latest = newIncoming[newIncoming.length - 1]
    if (latest) setStreamingId(latest.id)
  }, [messages, conversationId])

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    scrollToBottom(true)
  }, [messages, isThinking, scrollToBottom])

  // Stable ref so StreamingMarkdown's effect never needs to restart when
  // the scroll callback identity changes across re-renders.
  const scrollTickRef = useRef(() => scrollToBottom(false))
  useEffect(() => { scrollTickRef.current = () => scrollToBottom(false) }, [scrollToBottom])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-subtle">
      <div className="mx-auto max-w-2xl w-full px-5 py-6 space-y-5">
        {messages.map((m) => (
          <MessageRow
            key={m.id}
            message={m}
            animate={m.id === streamingId}
            scrollTickRef={m.id === streamingId ? scrollTickRef : undefined}
          />
        ))}
        {isThinking && thinkingComponent}
      </div>
    </div>
  )
}

function MessageRow({
  message,
  animate,
  scrollTickRef,
}: {
  message: ChatMessage
  animate: boolean
  scrollTickRef?: React.RefObject<() => void>
}) {
  const [streamingDone, setStreamingDone] = useState(false)
  const showFooter = (!animate || streamingDone) && !!message.citations?.length

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
          <StreamingMarkdown
            text={message.text}
            scrollTickRef={scrollTickRef}
            onComplete={() => setStreamingDone(true)}
          />
        ) : (
          <Markdown text={message.text} />
        )}
        {showFooter && <SourcesFooter sources={message.citations!} />}
      </div>
    </div>
  )
}

function StreamingMarkdown({
  text,
  scrollTickRef,
  onComplete,
}: {
  text: string
  scrollTickRef?: React.RefObject<() => void>
  onComplete?: () => void
}) {
  const charsPerTick = Math.max(6, Math.ceil(text.length / 240))
  const [revealed, setRevealed] = useState(() => text.slice(0, charsPerTick))
  const indexRef = useRef(charsPerTick)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })

  useEffect(() => {
    indexRef.current = charsPerTick
    setRevealed(text.slice(0, charsPerTick))
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const tick = () => {
      if (cancelled) return
      if (indexRef.current >= text.length) {
        setRevealed(text)
        scrollTickRef?.current?.()
        onCompleteRef.current?.()
        return
      }
      indexRef.current = Math.min(indexRef.current + charsPerTick, text.length)
      setRevealed(text.slice(0, indexRef.current))
      scrollTickRef?.current?.()
      timer = setTimeout(tick, 16)
    }

    timer = setTimeout(tick, 16)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
    // scrollTickRef and onCompleteRef are stable refs — intentionally excluded from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, charsPerTick])

  return <Markdown text={revealed} />
}
