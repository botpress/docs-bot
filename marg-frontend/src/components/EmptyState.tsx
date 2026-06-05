import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'How do I create a workflow in Botpress Studio?',
  'How do I define a tool in Botpress ADK?',
  'How do I embed Webchat on my website?',
  'What can the Tables API do?',
]

interface EmptyStateProps {
  onPick: (text: string) => void
  conversationId?: string
}

/** Quiet landing — a heading and a few suggested questions. */
export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-enter">
      <div className="w-full max-w-md text-center">
        <h1 className="text-[22px] font-medium text-foreground tracking-tight">How can I help?</h1>

        <div className="mt-7 flex flex-col gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className={cn(
                'text-left text-[13px] text-foreground/85 px-3.5 py-2.5 rounded-lg',
                'border border-border bg-surface hover:bg-muted hover:border-border/80 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-foreground/10',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
