import { useState } from 'react'
import { DotGridIcon } from './DotGridIcon'

interface HeaderLabelProps {
  isBusy: boolean
}

export function HeaderLabel({ isBusy }: HeaderLabelProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <span
      className="text-[11px] font-mono text-muted-foreground/50 flex items-center gap-1.5 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <DotGridIcon className="size-3.5" running={isBusy} hovered={hovered} />
      <span className={hovered || isBusy ? 'thinking-shimmer' : ''}>agent(0)</span>
    </span>
  )
}
