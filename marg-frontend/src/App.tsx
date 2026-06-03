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
import { usePageContext } from '@/hooks/usePageContext'
import { Header } from '@/components/Header'
import { EmptyState } from '@/components/EmptyState'
import { Messages, type ChatMessage } from '@/components/Messages'
import { WorkingIndicator } from '@/components/WorkingIndicator'
import { Composer } from '@/components/Composer'
import type { Source } from '@/components/Sources'

// A message block can be text/markdown directly or nested inside a container
// (bubble → block, bloc/column/row → items/blocks). Recursively pull out all text.
function extractText(block: unknown): string {
  if (!block || typeof block !== 'object') return ''
  const b = block as {
    type?: string
    text?: string
    markdown?: string
    value?: string
    block?: unknown
    blocks?: unknown[]
    items?: unknown[]
    payload?: { text?: string; markdown?: string }
  }
  if (b.type === 'button') return '' // rendered separately as a clickable choice
  if (b.type === 'text' || b.type === 'markdown') {
    return b.text ?? b.markdown ?? b.value ?? b.payload?.text ?? b.payload?.markdown ?? ''
  }
  if (b.block) return extractText(b.block) // bubble
  if (Array.isArray(b.items)) return b.items.map(extractText).filter(Boolean).join('\n\n')
  if (Array.isArray(b.blocks)) return b.blocks.map(extractText).filter(Boolean).join('\n\n')
  if (typeof b.text === 'string') return b.text
  if (typeof b.payload?.text === 'string') return b.payload.text
  return ''
}

// Collect clickable choices (e.g. the Studio/ADK clarification) from the block
// tree: webchat `button` blocks, or any block carrying an options/choices array.
function extractButtons(block: unknown): { label: string; value: string }[] {
  if (!block || typeof block !== 'object') return []
  const b = block as {
    type?: string
    text?: string
    buttonValue?: string
    block?: unknown
    blocks?: unknown[]
    items?: unknown[]
    options?: { label?: string; value?: string }[]
    choices?: { label?: string; value?: string }[]
    payload?: { options?: { label?: string; value?: string }[] }
  }
  if (b.type === 'button' && typeof b.text === 'string') {
    return [{ label: b.text, value: b.buttonValue ?? b.text }]
  }
  const opts = b.options ?? b.choices ?? b.payload?.options
  if (Array.isArray(opts)) {
    return opts
      .filter((o) => o && (o.label || o.value))
      .map((o) => ({ label: o.label ?? o.value ?? '', value: o.value ?? o.label ?? '' }))
  }
  const kids = [b.block, ...(b.blocks ?? []), ...(b.items ?? [])].filter(Boolean)
  return kids.flatMap(extractButtons)
}

// Drop any line referencing an internal skill data-source (data_source:// or
// raw.githubusercontent) so those URLs never appear in the visible answer —
// a frontend guard independent of the bot's own filtering.
function stripSkillRefs(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/data_source:\/\/|raw\.githubusercontent\.com/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// The bot appends a "**References**" section with markdown links. Pull those out
// of the visible text so we can render them as a "Consulted N pages" collapsible
// at the top of the answer instead (docs-v2 style).
function parseReferences(text: string): { text: string; citations: Source[] } {
  const idx = text.search(/\n+\*\*References\*\*\s*\n/i)
  if (idx === -1) return { text, citations: [] }
  const body = text.slice(0, idx).trim()
  const refBlock = text.slice(idx)
  const citations: Source[] = []
  const seen = new Set<string>()
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(refBlock)) !== null) {
    const url = m[2].trim()
    if (seen.has(url)) continue
    seen.add(url)
    citations.push({ title: m[1].trim(), url })
  }
  return { text: body, citations }
}

export default function App() {
  const { messages, sendMessage, status, isTyping, conversationId } = useActiveConversation()
  const { userCredentials } = useUser()
  const userId = userCredentials?.userId

  // Latest docs page. Prepended to outgoing messages as
  // `__page:<path>|<question>` so the bot gets page + question in one turn.
  // Normally supplied by the parent docs site; for standalone testing you can
  // pass it via a `?page=/studio/...` query param.
  const pagePathRef = useRef<string | undefined>(
    new URLSearchParams(window.location.search).get('page') ?? undefined,
  )
  const onPath = useCallback((p: string) => {
    pagePathRef.current = p
  }, [])
  const withPage = useCallback((text: string) => {
    const p = pagePathRef.current
    return p && !text.startsWith('__page:') ? `__page:${p}|${text}` : text
  }, [])
  const { listConversations, openConversation } = useConversations()
  const { client } = useWebchatContext()
  const { conversations, isLoading: isListLoading, refresh } = useConversationList({
    clientId: CLIENT_ID,
    listConversations,
    userCredentials,
  })

  // Fetch the first user message of a conversation — used by the dropdown as a
  // "title" since the API doesn't provide one. Paginates newest→oldest, capped.
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
      all.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
      // Use the first real user message as the title, stripping the hidden
      // `__page:<path>|` prefix so the dropdown shows the question, not the path.
      for (const m of all) {
        if (m.userId !== userId || m.payload?.type !== 'text') continue
        const raw = m.payload.text
        if (!raw) continue
        let title = raw
        if (raw.startsWith('__page:')) {
          const bar = raw.indexOf('|')
          if (bar < 0) continue // pure page-context control message — skip
          title = raw.slice(bar + 1).trim()
        }
        if (title) return title
      }
      return undefined
    },
    [client, userId],
  )

  const isReady = status === 'connected'

  // Map raw BlockMessages → chat bubbles. A message's `block` is a GenericBlock
  // that may be a plain text/markdown block OR a container (bubble, bloc, column,
  // row) nesting them. Walk the tree and collect all text so the answer renders
  // regardless of how the webchat integration wrapped it.
  const chatMessages: ChatMessage[] = useMemo(
    () =>
      messages
        .map((m) => {
          const direction = m.authorId === userId ? 'outgoing' : 'incoming'
          let text = extractText(m.block).trim()
          // Outgoing messages carry a hidden `__page:<path>|` prefix — strip it
          // so the user only sees their question.
          if (direction === 'outgoing' && text.startsWith('__page:')) {
            const bar = text.indexOf('|')
            text = bar >= 0 ? text.slice(bar + 1) : ''
          }
          // Safety net: never surface internal skill-source URLs in the answer,
          // then lift the "References" section out into a citations list.
          let citations: Source[] = []
          if (direction === 'incoming') {
            text = stripSkillRefs(text)
            const parsed = parseReferences(text)
            text = parsed.text
            citations = parsed.citations
          }
          const buttons = direction === 'incoming' ? extractButtons(m.block) : []
          if (!text && buttons.length === 0 && citations.length === 0) return null
          return {
            id: m.id,
            direction,
            text,
            ...(buttons.length ? { buttons } : {}),
            ...(citations.length ? { citations } : {}),
          } satisfies ChatMessage
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
        console.warn('[marg-frontend] Webchat is not connected; queueing message', { status })
        pendingRef.current.push(text)
        return
      }
      pendingBaselineIncomingIdRef.current = latestIncomingMessageIdRef.current
      setPendingResponse(true)
      void sendMessage({ type: 'text', text: withPage(text) }).catch((error) => {
        console.error('[marg-frontend] Failed to send message', { status, conversationId, error })
        setPendingResponse(false)
      })
    },
    [conversationId, isReady, sendMessage, status, withPage],
  )

  useEffect(() => {
    if (!isReady || pendingRef.current.length === 0) return
    const queue = pendingRef.current
    pendingRef.current = []
    for (const text of queue) {
      pendingBaselineIncomingIdRef.current = latestIncomingMessageIdRef.current
      setPendingResponse(true)
      void sendMessage({ type: 'text', text: withPage(text) }).catch((error) => {
        console.error('[marg-frontend] Failed to send queued message', { status, conversationId, error })
        setPendingResponse(false)
      })
    }
  }, [conversationId, isReady, sendMessage, status, withPage])

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
  usePageContext(onPath)

  const hasMessages = chatMessages.length > 0
  const isBusy = Boolean(isTyping) || pendingResponse

  const [fading, setFading] = useState(false)
  const prevConvoId = useRef(conversationId)
  useEffect(() => {
    if (prevConvoId.current === conversationId) return
    const prev = prevConvoId.current
    prevConvoId.current = conversationId
    if (prev === undefined) return // initial connection — no fade
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
        activeTitle={chatMessages.find((m) => m.direction === 'outgoing')?.text}
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
            onSend={handleSend}
          />
        ) : (
          <EmptyState onPick={handleSend} conversationId={conversationId} />
        )}
      </div>

      <Composer onSend={handleSend} disabled={isBusy} />
    </div>
  )
}
