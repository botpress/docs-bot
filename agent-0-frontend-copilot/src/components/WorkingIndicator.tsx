export function WorkingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-3 py-2"
      role="status"
      aria-live="polite"
      aria-label="agent(0) is thinking"
    >
      <span className="working-dot size-1.5 rounded-full bg-muted-foreground/60" />
      <span className="working-dot size-1.5 rounded-full bg-muted-foreground/60" />
      <span className="working-dot size-1.5 rounded-full bg-muted-foreground/60" />
    </div>
  )
}
