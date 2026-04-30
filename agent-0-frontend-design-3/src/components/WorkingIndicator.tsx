/**
 * Three subtle pulsing dots, left-aligned at the next assistant message
 * position (matches the assistant's no-bubble look).
 */
export function WorkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2" aria-label="Thinking" role="status">
      <span className="pulse-dot size-1.5 rounded-full bg-muted-foreground" />
      <span className="pulse-dot size-1.5 rounded-full bg-muted-foreground" />
      <span className="pulse-dot size-1.5 rounded-full bg-muted-foreground" />
    </div>
  )
}
