/**
 * Claude-orange morphing square (rotates and rounds its corners) paired
 * with a "Thinking…" shimmer that sweeps the same warm tone — keeping
 * the loader as a single cohesive accent in an otherwise neutral UI.
 */
export function WorkingIndicator() {
  return (
    <div
      className="flex items-center gap-2.5 px-1 py-2"
      aria-label="Thinking"
      role="status"
    >
      <span className="thinking-morph" aria-hidden />
      <span className="thinking-shimmer text-[14px] leading-6 font-medium">Thinking…</span>
    </div>
  )
}
