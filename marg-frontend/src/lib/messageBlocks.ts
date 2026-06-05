import type { Source } from '@/components/Sources'

// Parsing helpers for the raw webchat message blocks and answer text. Kept pure
// and dependency-free (aside from the Source type) so they can be unit-tested
// in isolation.

// A message block can be text/markdown directly or nested inside a container
// (bubble → block, bloc/column/row → items/blocks). Recursively pull out all text.
export function extractText(block: unknown): string {
  if (!block || typeof block !== 'object') return ''
  const b = block as {
    type?: string
    text?: string
    markdown?: string
    value?: string
    block?: unknown
    blocks?: unknown[]
    items?: unknown[]
    payload?: { text?: string; markdown?: string }
  }
  if (b.type === 'button') return '' // rendered separately as a clickable choice
  if (b.type === 'text' || b.type === 'markdown') {
    return b.text ?? b.markdown ?? b.value ?? b.payload?.text ?? b.payload?.markdown ?? ''
  }
  if (b.block) return extractText(b.block) // bubble
  if (Array.isArray(b.items)) return b.items.map(extractText).filter(Boolean).join('\n\n')
  if (Array.isArray(b.blocks)) return b.blocks.map(extractText).filter(Boolean).join('\n\n')
  if (typeof b.text === 'string') return b.text
  if (typeof b.payload?.text === 'string') return b.payload.text
  return ''
}

// Collect clickable choices (e.g. the Studio/ADK clarification) from the block
// tree: webchat `button` blocks, or any block carrying an options/choices array.
export function extractButtons(block: unknown): { label: string; value: string }[] {
  if (!block || typeof block !== 'object') return []
  const b = block as {
    type?: string
    text?: string
    buttonValue?: string
    block?: unknown
    blocks?: unknown[]
    items?: unknown[]
    options?: { label?: string; value?: string }[]
    choices?: { label?: string; value?: string }[]
    payload?: { options?: { label?: string; value?: string }[] }
  }
  if (b.type === 'button' && typeof b.text === 'string') {
    return [{ label: b.text, value: b.buttonValue ?? b.text }]
  }
  const opts = b.options ?? b.choices ?? b.payload?.options
  if (Array.isArray(opts)) {
    return opts
      .filter((o) => o && (o.label || o.value))
      .map((o) => ({ label: o.label ?? o.value ?? '', value: o.value ?? o.label ?? '' }))
  }
  const kids = [b.block, ...(b.blocks ?? []), ...(b.items ?? [])].filter(Boolean)
  return kids.flatMap(extractButtons)
}

// Drop any line referencing an internal skill data-source (data_source:// or
// raw.githubusercontent) so those URLs never appear in the visible answer —
// a frontend guard independent of the bot's own filtering.
export function stripSkillRefs(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/data_source:\/\/|raw\.githubusercontent\.com/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// The bot appends a "**References**" section with markdown links. Pull those out
// of the visible text so we can render them as a "Consulted N pages" collapsible
// at the top of the answer instead (docs-v2 style).
export function parseReferences(text: string): { text: string; citations: Source[] } {
  const idx = text.search(/\n+\*\*References\*\*\s*\n/i)
  if (idx === -1) return { text, citations: [] }
  const body = text.slice(0, idx).trim()
  const refBlock = text.slice(idx)
  const citations: Source[] = []
  const seen = new Set<string>()
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(refBlock)) !== null) {
    const url = m[2].trim()
    if (seen.has(url)) continue
    seen.add(url)
    citations.push({ title: m[1].trim(), url })
  }
  return { text: body, citations }
}
