export function makeGuardrails() {
  let hasSearched = false

  return {
    onBeforeTool: async ({ tool }: { tool: { name: string } }) => {
      if (tool.name === 'search_knowledge') {
        hasSearched = true
      }
    },
    onExit: async () => {
      if (!hasSearched) {
        throw new Error(
          'Knowledge search is required for this question but was not performed. Use the search_knowledge tool before answering.',
        )
      }
    },
  }
}
