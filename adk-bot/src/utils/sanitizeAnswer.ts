// Matches trailing reference/sources sections the LLM sometimes appends.
// Catches patterns like: "---\n**References:**", "### Key references used:",
// "**Sources:**", "Key references used:" — with or without a leading separator.
const TRAILING_REFERENCE_SECTION =
  /\n+(?:---\s*\n+)?(?:#{1,3}\s+)?(?:\*{0,2})(?:references|sources|key references used|further reading)(?:\*{0,2}):?[\s\S]*$/i

export function sanitizeAnswer(answer: string) {
  return answer.replace(TRAILING_REFERENCE_SECTION, '').trim()
}
