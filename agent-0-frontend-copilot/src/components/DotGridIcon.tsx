import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * 4×4 grid (15×15 viewBox, 3px squares) with the four corners hidden so the
 * silhouette reads as a rounded grid. Ported from agent-lack's Copilot
 * DotGridIcon (which itself is from opencode's Spinner).
 *
 * States (precedence: hover > running > idle):
 *  - idle: static at base opacity (inner 0.7, outer 0.25)
 *  - running: each square pulses opacity with a randomized delay + duration
 *  - hover: per-square wave from top-left to bottom-right
 */
interface DotGridIconProps extends Omit<React.ComponentProps<typeof motion.svg>, 'viewBox'> {
  running?: boolean
  hovered?: boolean
}

const CORNER_INDICES = new Set([0, 3, 12, 15])
const OUTER_INDICES = new Set([1, 2, 4, 7, 8, 11, 13, 14])

const SQUARES = Array.from({ length: 16 }, (_, i) => {
  const x = (i % 4) * 4
  const y = Math.floor(i / 4) * 4
  const wave = (x + y) / 24
  return {
    id: i,
    x,
    y,
    runDelay: Math.random() * 1.5,
    runDuration: 1 + Math.random() * 1,
    hoverDelay: wave * 0.45,
    corner: CORNER_INDICES.has(i),
    outer: OUTER_INDICES.has(i),
  }
})

export function DotGridIcon({ className, running, hovered, ...props }: DotGridIconProps) {
  const state = hovered ? 'hover' : running ? 'running' : 'idle'

  return (
    <motion.svg
      viewBox="0 0 15 15"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      initial="idle"
      animate={state}
      variants={{
        idle: { scale: 1 },
        running: { scale: 1 },
        hover: { scale: 1.06 },
      }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
      className={cn('size-4', className)}
      {...props}
    >
      {SQUARES.map((s) => {
        if (s.corner) return null
        const min = s.outer ? 0.15 : 0.4
        const peak = s.outer ? 0.35 : 1
        const base = s.outer ? 0.25 : 0.7
        const hoverPeak = s.outer ? 0.55 : 1
        const hoverHold = s.outer ? 0.45 : 0.92
        return (
          <motion.rect
            key={s.id}
            x={s.x}
            y={s.y}
            width="3"
            height="3"
            rx="1"
            initial={{ opacity: base }}
            variants={{
              idle: {
                opacity: base,
                transition: { duration: 0.4, ease: 'easeOut' },
              },
              running: {
                opacity: [min, peak, min],
                transition: {
                  duration: s.runDuration,
                  delay: s.runDelay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              },
              hover: {
                opacity: [base, hoverPeak, hoverHold],
                transition: {
                  duration: 0.6,
                  delay: s.hoverDelay,
                  ease: 'easeOut',
                },
              },
            }}
          />
        )
      })}
    </motion.svg>
  )
}
