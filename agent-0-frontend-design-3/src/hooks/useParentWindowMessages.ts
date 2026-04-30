import { useEffect } from 'react'
import { ALLOWED_PARENT_ORIGINS } from '@/config/constants'

interface ParentMessageData {
  type?: string
  message?: string
}

/**
 * Listens for postMessage events from the docs site's `assistant.js`. The two
 * we care about for this minimal frontend:
 *  - `sendMessage` — text typed into the docs page's bottom "Ask a question..."
 *    input bubble. We forward it into the chat as if the user typed it here.
 *  - `panelOpened` / `pageChanged` — best-effort no-ops for now; the bot
 *    doesn't use page context. Logged to console only if we ever want to
 *    extend.
 *
 * Origin is checked against ALLOWED_PARENT_ORIGINS — anything else is dropped.
 */
export function useParentWindowMessages(onSendMessage: (text: string) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent<ParentMessageData>) => {
      if (!ALLOWED_PARENT_ORIGINS.includes(event.origin)) return
      const data = event.data
      if (!data || typeof data !== 'object') return

      if (data.type === 'sendMessage' && typeof data.message === 'string') {
        const text = data.message.trim()
        if (text) onSendMessage(text)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onSendMessage])
}
