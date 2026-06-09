// No suggested questions on purpose — canned prompts bias what users ask.
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
