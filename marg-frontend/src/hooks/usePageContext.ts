import { useEffect } from 'react'
import { ALLOWED_PARENT_ORIGINS } from '@/config/constants'

interface PageMessageData {
  type?: string
  data?: { path?: string; title?: string }
}

/**
 * Tracks the current docs page broadcast by the parent (`assistant.js`) via
 * `panelOpened` (on open) and `pageChanged` (on SPA navigation). It does NOT
 * send anything itself — it just hands the latest path to `onPath`. The page is
 * then prepended to the user's next message as `__page:<path>|<question>` so the
 * bot resolves page + question in a single turn (no separate message, no
 * cross-turn state, no reliance on webchat user data).
 *
 * Origin is checked against ALLOWED_PARENT_ORIGINS — anything else is dropped.
 */
export function usePageContext(onPath: (path: string) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent<PageMessageData>) => {
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type !== 'panelOpened' && data.type !== 'pageChanged') return
      if (!ALLOWED_PARENT_ORIGINS.includes(event.origin)) return
      const path = data.data?.path
      if (!path || typeof path !== 'string') return
      onPath(path)
    }

    window.addEventListener('message', handler)

    // Ask the parent for the current page on mount (assistant.js replies with `panelOpened`).
    if (window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'requestCurrentPage' }, '*')
      } catch {
        // ignore — cross-origin parent without postMessage permission
      }
    }

    return () => window.removeEventListener('message', handler)
  }, [onPath])
}
