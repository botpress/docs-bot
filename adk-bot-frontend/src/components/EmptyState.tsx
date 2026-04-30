import { useState } from 'react'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'How do I build my first ADK bot?',
  'How do I create a tool the AI can call?',
  'How do I connect to an integration?',
  'Give me some tips for building with the ADK',
]

// Same palette agent-lack uses for agent-info; gives a cohesive Botpress
// brand feel across products.
const PALETTE = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#10B981',
  '#06B6D4',
  '#6366F1',
  '#F43F5E',
  '#14B8A6',
  '#A855F7',
]

function hashColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

interface EmptyStateProps {
  onPick: (text: string) => void
  conversationId?: string
}

/**
 * Quiet ADK landing — a morphing-square brand mark whose color is derived
 * from the current conversationId, so each new chat opens with a fresh
 * hue. Falls back to a session-stable random seed before the first
 * conversation has been assigned an ID.
 */
export function EmptyState({ onPick, conversationId }: EmptyStateProps) {
  const [randomSeed] = useState(() => Math.random().toString(36).slice(2))
  const color = hashColor(conversationId || randomSeed)

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-up">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-5">
          <span
            className="block size-10 animate-morph-spin shrink-0"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 0 1px ${color}33, 0 0 56px -8px ${color}99`,
            }}
            aria-hidden
          />
        </div>

        <h1 className="text-[22px] font-medium text-foreground tracking-tight">
          How can I help with the ADK?
        </h1>

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
