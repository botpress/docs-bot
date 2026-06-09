/**
 * Quiet landing — a headline and a one-line scope note, nothing else.
 *
 * Deliberately NO suggested/sample questions: canned prompts skew analytics by
 * funnelling most users into asking the same few questions. (agent-0-style
 * minimal hero; App centers this together with the composer, then the composer
 * drops to the bottom once the conversation starts.)
 */
export function EmptyState() {
  return (
    <div className="text-center px-6 mb-6">
      <h1 className="text-[22px] font-medium text-foreground tracking-tight">How can I help?</h1>
      <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
        Ask anything about the Botpress docs
      </p>
    </div>
  )
}
