import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'How do I create a tool?',
  'What are conversations in the ADK?',
  'How do I add an integration?',
  'Show me a workflow example',
]

interface EmptyStateProps {
  onPick: (text: string) => void
}

/**
 * Big calm hero — single greeting heading and four example prompts as
 * outline pills. No avatar, no logo, no chrome. Inspired by Claude.ai's
 * "How can I help you today?" landing.
 */
export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-up">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-2xl sm:text-[28px] font-medium text-foreground tracking-tight">
          How can I help with the ADK?
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          Ask anything about agents, tools, conversations, or the CLI.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className={cn(
                'text-left text-[13px] text-foreground/85 px-3.5 py-2.5 rounded-lg',
                'border border-border bg-surface hover:bg-muted transition-colors',
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
