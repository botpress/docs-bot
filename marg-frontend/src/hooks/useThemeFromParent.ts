import { useEffect } from 'react'
import { ALLOWED_PARENT_ORIGINS } from '@/config/constants'

interface ThemeMessage {
  type?: string
  theme?: 'light' | 'dark'
}

/**
 * Sync the iframe's theme to the parent docs page.
 *
 *  - On mount, ask the parent to send its current theme via `requestTheme`.
 *  - Listen for `themeChanged` messages and toggle the .light / .dark class
 *    on <html> accordingly.
 *  - Fallback: if the parent never responds, prefers-color-scheme media query
 *    in index.css already gives us OS-driven theming.
 */
export function useThemeFromParent() {
  useEffect(() => {
    const apply = (theme: 'light' | 'dark') => {
      const html = document.documentElement
      html.classList.remove('light', 'dark')
      html.classList.add(theme)
    }

    const handler = (event: MessageEvent<ThemeMessage>) => {
      if (!ALLOWED_PARENT_ORIGINS.includes(event.origin)) return
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'themeChanged' && (data.theme === 'light' || data.theme === 'dark')) {
        apply(data.theme)
      }
    }

    window.addEventListener('message', handler)

    // Ask the parent for the initial theme. assistant.js may or may not handle
    // this — if not, OS preference (via @media prefers-color-scheme) wins.
    if (window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'requestTheme' }, '*')
      } catch {
        // ignore — cross-origin parent without postMessage permission
      }
    }

    return () => window.removeEventListener('message', handler)
  }, [])
}
