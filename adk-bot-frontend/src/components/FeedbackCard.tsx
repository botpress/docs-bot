import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FeedbackCardProps {
  question: string
  reason: 'unanswered' | 'active_conversation'
  onSubmit: (question: string, feedback: string, reason: 'unanswered' | 'active_conversation', rating?: number) => void
  onDismiss: () => void
}

export function FeedbackCard({ question, reason, onSubmit, onDismiss }: FeedbackCardProps) {
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [sent, setSent] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || sent) return null

  const isActiveConversation = reason === 'active_conversation'

  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 flex flex-col gap-2.5 max-w-md">
      <p className="text-[13px] font-medium text-foreground">
        {isActiveConversation ? 'Help improve the Botpress ADK' : "Sorry I couldn't help with that one."}
      </p>
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        Would you like to share feedback to help improve the Botpress ADK?
      </p>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground mr-1">Rating</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(rating === n ? undefined : n)}
            className={cn(
              'w-7 h-7 rounded-full text-[12px] font-medium transition-colors border',
              rating === n
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground border-border/60 hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Share your thoughts..."
        rows={3}
        className={cn(
          'w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2',
          'text-[13px] text-foreground placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-1 focus:ring-ring',
        )}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!feedback.trim() && rating === undefined}
          onClick={() => {
            setSent(true)
            onSubmit(question, feedback.trim(), reason, rating)
          }}
          className={cn(
            'rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
            'bg-foreground text-background hover:bg-foreground/80',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          Send feedback
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true)
            onDismiss()
          }}
          className="rounded-lg px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
