/**
 * Minimal top bar — just a small label, no chrome. The whole point of this
 * design is to disappear and let the conversation breathe.
 */
export function Header() {
  return (
    <header className="px-5 py-3 flex items-center">
      <span className="text-[12px] font-medium text-muted-foreground">
        ADK assistant
      </span>
    </header>
  )
}
