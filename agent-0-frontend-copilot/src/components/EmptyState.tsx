import { DotGridIcon } from './DotGridIcon'

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-float-in">
      <div className="flex flex-col items-center text-center">
        <div className="bg-background rounded-full p-2 mb-4">
          <DotGridIcon className="size-7 text-muted-foreground/40" running />
        </div>
        <p className="font-mono text-muted-foreground text-sm">ask agent(0)</p>
      </div>
    </div>
  )
}
