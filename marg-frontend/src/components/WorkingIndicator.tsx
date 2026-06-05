import { useEffect, useState } from 'react'

const LABELS = ['Thinking…', 'Searching documentation…']

/**
 * Claude-orange morphing square paired with a shimmer label that alternates
 * between "Thinking…" and "Searching documentation…" while the bot works.
 */
export function WorkingIndicator() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % LABELS.length), 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2.5 px-1 py-2" aria-label={LABELS[i]} role="status">
      <span className="thinking-morph" aria-hidden />
      <span className="thinking-shimmer text-[14px] leading-6 font-medium">{LABELS[i]}</span>
    </div>
  )
}
