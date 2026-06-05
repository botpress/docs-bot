import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Markdown } from '@/components/Markdown'
import { Sources, type Source } from '@/components/Sources'

export type ChatMessage = {
  id: string
  direction: 'incoming' | 'outgoing'
  text: string
  buttons?: { label: string; value: string }[]
  citations?: Source[]
}

interface MessagesProps {
  messages: ChatMessage[]
  isThinking: boolean
  thinkingComponent?: React.ReactNode
  conversationId?: string
  onSend: (text: string) => void
}

type Exchange = { key: string; question: ChatMessage | null; answers: ChatMessage[] }

export function Messages({ messages, isThinking, thinkingComponent, conversationId, onSend }: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenRef = useRef<Set<string>>(new Set())
  const lastConvoRef = useRef<string | undefined>(undefined)
  const [streamingId, setStreamingId] = useState<string | undefined>(undefined)
  const [completedStreamingIds, setCompletedStreamingIds] = useState<Set<string>>(() => new Set())
  // Whether the user is scrolled near the bottom. We only auto-follow new
  // content when they are, so scrolling up to read history isn't yanked back.
  const isNearBottomRef = useRef(true)

  // Group the flat message list into exchanges (one question + its answer(s)).
  const exchanges = useMemo<Exchange[]>(() => {
    const out: Exchange[] = []
    for (const m of messages) {
      if (m.direction === 'outgoing') {
        out.push({ key: m.id, question: m, answers: [] })
      } else {
        if (out.length === 0) out.push({ key: `lead-${m.id}`, question: null, answers: [] })
        out[out.length - 1].answers.push(m)
      }
    }
    return out
  }, [messages])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
    isNearBottomRef.current = true
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      isNearBottomRef.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [conversationId])

  // Stable tick the streaming answer calls as it grows, to follow the bottom.
  const scrollTickRef = useRef(() => {})
  useEffect(() => {
    scrollTickRef.current = () => {
      if (isNearBottomRef.current) scrollToBottom()
    }
  }, [scrollToBottom])

  useLayoutEffect(() => {
    if (lastConvoRef.current !== conversationId) {
      lastConvoRef.current = conversationId
      seenRef.current = new Set(messages.map((m) => m.id))
      setStreamingId(undefined)
      setCompletedStreamingIds(new Set())
      isNearBottomRef.current = true
      scrollToBottom()
      return
    }
    const newMsgs = messages.filter((m) => !seenRef.current.has(m.id))
    for (const m of messages) seenRef.current.add(m.id)

    // Normal chat scrolling: a newly sent question always jumps to the bottom;
    // incoming answers follow only if the user is already near the bottom.
    const hasNewOutgoing = newMsgs.some((m) => m.direction === 'outgoing')
    if (hasNewOutgoing || isNearBottomRef.current) scrollToBottom()

    const latestIncoming = [...newMsgs].reverse().find((m) => m.direction === 'incoming')
    if (latestIncoming) {
      setStreamingId(latestIncoming.id)
      setCompletedStreamingIds((prev) => {
        const next = new Set(prev)
        next.delete(latestIncoming.id)
        return next
      })
    }
  }, [messages, conversationId, scrollToBottom])

  // Keep the working indicator in view when it appears.
  useLayoutEffect(() => {
    if (isThinking && isNearBottomRef.current) scrollToBottom()
  }, [isThinking, scrollToBottom])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-subtle">
      <div className="mx-auto max-w-2xl w-full px-5 py-5">
        {exchanges.map((ex, i) => {
          const isLast = i === exchanges.length - 1
          // Show the working indicator only while genuinely waiting (no answer yet).
          const showThinking = isLast && isThinking && ex.answers.length === 0
          return (
            <div key={ex.key} className="pb-6">
              {ex.question && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl border border-border bg-surface text-foreground px-4 py-2.5 text-[14px] leading-6 whitespace-pre-wrap break-words">
                    {ex.question.text}
                  </div>
                </div>
              )}
              <div className="space-y-4 pt-4">
                {ex.answers.map((a) => (
                  <AnswerRow
                    key={a.id}
                    message={a}
                    animate={a.id === streamingId && !completedStreamingIds.has(a.id)}
                    onStreamingComplete={() => setCompletedStreamingIds((prev) => new Set(prev).add(a.id))}
                    onSend={onSend}
                    scrollTick={a.id === streamingId ? scrollTickRef : undefined}
                  />
                ))}
                {showThinking && <div className="pt-1">{thinkingComponent}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AnswerRow({
  message,
  animate,
  onStreamingComplete,
  onSend,
  scrollTick,
}: {
  message: ChatMessage
  animate: boolean
  onStreamingComplete: () => void
  onSend: (text: string) => void
  scrollTick?: React.RefObject<() => void>
}) {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-full break-words">
        {!!message.citations?.length && <Sources sources={message.citations} />}
        {animate ? (
          <StreamingMarkdown text={message.text} onComplete={onStreamingComplete} scrollTick={scrollTick} />
        ) : (
          <Markdown text={message.text} />
        )}
        {!!message.buttons?.length && (
          <div className="mt-3 flex flex-col gap-2">
            {message.buttons.map((b) => (
              <button
                key={b.value}
                type="button"
                disabled={picked !== null}
                onClick={() => {
                  if (picked !== null) return
                  setPicked(b.value)
                  onSend(b.value)
                }}
                className={
                  'text-left text-[13px] px-3.5 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
                  (picked === null
                    ? 'text-foreground/90 border-border bg-surface hover:bg-muted hover:border-border/80'
                    : picked === b.value
                      ? 'text-foreground border-primary/40 bg-primary/10 cursor-default'
                      : 'text-muted-foreground/50 border-border bg-surface cursor-default')
                }
              >
                {b.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StreamingMarkdown({
  text,
  onComplete,
  scrollTick,
}: {
  text: string
  onComplete?: () => void
  scrollTick?: React.RefObject<() => void>
}) {
  const charsPerTick = Math.max(6, Math.ceil(text.length / 240))
  const [revealed, setRevealed] = useState(() => text.slice(0, charsPerTick))
  const indexRef = useRef(charsPerTick)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    indexRef.current = charsPerTick
    setRevealed(text.slice(0, charsPerTick))
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const tick = () => {
      if (cancelled) return
      if (indexRef.current >= text.length) {
        setRevealed(text)
        scrollTick?.current?.()
        onCompleteRef.current?.()
        return
      }
      indexRef.current = Math.min(indexRef.current + charsPerTick, text.length)
      setRevealed(text.slice(0, indexRef.current))
      // Follow the bottom as the answer grows (no-op if the user scrolled up).
      scrollTick?.current?.()
      timer = setTimeout(tick, 16)
    }

    timer = setTimeout(tick, 16)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
    // refs are stable — intentionally excluded from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, charsPerTick])

  return <Markdown text={revealed} />
}
