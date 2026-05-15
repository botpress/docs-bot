import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FeedbackCard } from '@/components/FeedbackCard'
import { Markdown } from '@/components/Markdown'
import { SourcesFooter } from '@/components/SourcesFooter'

export type ChatMessage =
  | {
      id: string
      direction: 'incoming' | 'outgoing'
      kind: 'text'
      text: string
      citations?: { title: string; url: string }[]
    }
  | {
      id: string
      direction: 'incoming'
      kind: 'feedbackPrompt'
      question: string
      reason: 'unanswered' | 'active_conversation'
    }

interface MessagesProps {
  messages: ChatMessage[]
  isThinking: boolean
  thinkingComponent?: React.ReactNode
  conversationId?: string
  onSubmitFeedback: (question: string, feedback: string, reason: 'unanswered' | 'active_conversation', rating?: number) => void
}

export function Messages({
  messages,
  isThinking,
  thinkingComponent,
  conversationId,
  onSubmitFeedback,
}: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenRef = useRef<Set<string>>(new Set())
  const lastConvoRef = useRef<string | undefined>(undefined)
  const [streamingId, setStreamingId] = useState<string | undefined>(undefined)
  const [completedStreamingIds, setCompletedStreamingIds] = useState<Set<string>>(() => new Set())
  const [hiddenFeedbackIds, setHiddenFeedbackIds] = useState<Set<string>>(() => new Set())
  const messageElsRef = useRef<Map<string, HTMLDivElement>>(new Map())

  useLayoutEffect(() => {
    if (lastConvoRef.current !== conversationId) {
      lastConvoRef.current = conversationId
      seenRef.current = new Set(messages.map((m) => m.id))
      setStreamingId(undefined)
      setCompletedStreamingIds(new Set())
      setHiddenFeedbackIds(new Set())
      return
    }
    const newMsgs = messages.filter((m) => !seenRef.current.has(m.id))
    for (const m of messages) seenRef.current.add(m.id)

    const newOutgoing = newMsgs.filter((m) => m.direction === 'outgoing')
    const newIncoming = newMsgs.filter((m) => m.direction === 'incoming')

    if (newOutgoing.length > 0) {
      const latest = newOutgoing[newOutgoing.length - 1]
      messageElsRef.current.get(latest.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const latestIncomingText = [...newIncoming].reverse().find((m) => m.kind === 'text')
    if (latestIncomingText) {
      setStreamingId(latestIncomingText.id)
      setCompletedStreamingIds((prev) => {
        const next = new Set(prev)
        next.delete(latestIncomingText.id)
        return next
      })
    }
  }, [messages, conversationId])

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    const isCurrentStreamDone = !streamingId || completedStreamingIds.has(streamingId)
    if (lastMsg?.kind === 'feedbackPrompt' && !isCurrentStreamDone) return
    if (lastMsg?.direction === 'outgoing') return
    scrollToBottom(true)
  }, [messages, isThinking, scrollToBottom, streamingId, completedStreamingIds])

  const scrollTickRef = useRef(() => scrollToBottom(false))
  useEffect(() => { scrollTickRef.current = () => scrollToBottom(false) }, [scrollToBottom])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-subtle">
      <div className="mx-auto max-w-2xl w-full px-5 py-6 space-y-5">
        {messages.map((m) => {
          if (
            m.kind === 'feedbackPrompt' &&
            (hiddenFeedbackIds.has(m.id) ||
              (streamingId && !completedStreamingIds.has(streamingId)))
          ) {
            return null
          }

          return (
            <MessageRow
              key={m.id}
              message={m}
              animate={m.id === streamingId && !completedStreamingIds.has(m.id)}
              scrollTickRef={m.id === streamingId ? scrollTickRef : undefined}
              onStreamingComplete={() => {
                setCompletedStreamingIds((prev) => new Set(prev).add(m.id))
              }}
              onHideFeedback={() => {
                setHiddenFeedbackIds((prev) => new Set(prev).add(m.id))
              }}
              onSubmitFeedback={onSubmitFeedback}
              elRef={(el) => {
                if (el) messageElsRef.current.set(m.id, el)
                else messageElsRef.current.delete(m.id)
              }}
            />
          )
        })}
        {isThinking && thinkingComponent}
      </div>
    </div>
  )
}

function MessageRow({
  message,
  animate,
  scrollTickRef,
  onStreamingComplete,
  onHideFeedback,
  onSubmitFeedback,
  elRef,
}: {
  message: ChatMessage
  animate: boolean
  scrollTickRef?: React.RefObject<() => void>
  onStreamingComplete: () => void
  onHideFeedback: () => void
  onSubmitFeedback: (question: string, feedback: string, reason: 'unanswered' | 'active_conversation', rating?: number) => void
  elRef?: (el: HTMLDivElement | null) => void
}) {
  const [streamingDone, setStreamingDone] = useState(false)

  if (message.kind === 'feedbackPrompt') {
    return (
      <div className="flex w-full justify-start">
        <FeedbackCard
          question={message.question}
          reason={message.reason}
          onDismiss={onHideFeedback}
          onSubmit={(question, feedback, reason, rating) => {
            onHideFeedback()
            onSubmitFeedback(question, feedback, reason, rating)
          }}
        />
      </div>
    )
  }

  const showFooter = (!animate || streamingDone) && !!message.citations?.length
  const isUser = message.direction === 'outgoing'

  if (isUser) {
    return (
      <div ref={elRef} className="flex w-full justify-end">
        <div className="max-w-[85%] rounded-2xl bg-user-bubble text-user-bubble-foreground px-4 py-2.5 text-[14px] leading-6 whitespace-pre-wrap break-words">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div ref={elRef} className="flex w-full justify-start">
      <div className="max-w-full break-words">
        {animate ? (
          <StreamingMarkdown
            text={message.text}
            scrollTickRef={scrollTickRef}
            onComplete={() => {
              setStreamingDone(true)
              onStreamingComplete()
            }}
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
