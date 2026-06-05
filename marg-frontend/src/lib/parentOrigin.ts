// Parent origin, captured from the first inbound postMessage that passed the
// ALLOWED_PARENT_ORIGINS check. Outbound messages target it instead of '*'.
// Defaults to '*' until the first inbound message arrives.
let parentOrigin = '*'

export function rememberParentOrigin(origin: string): void {
  if (origin && origin !== 'null') parentOrigin = origin
}

export function getParentOrigin(): string {
  return parentOrigin
}
