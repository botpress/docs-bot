import { useEffect } from 'react'
import { ALLOWED_PARENT_ORIGINS } from '@/config/constants'

interface ParentMessageData {
  type?: string
  message?: string
}

/**
 * Listens for `sendMessage` postMessage events from the docs site's
 * `assistant.js` — text typed into the page's bottom "Ask a question..."
 * input bubble is forwarded into the chat. Other events the parent emits
 * (`panelOpened`, `pageChanged`, `focusInput`) are intentionally ignored:
 * this bot doesn't use page context yet.
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
