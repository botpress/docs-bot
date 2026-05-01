const GREETING_RE = /^(?:hi|hello|hey|yo|sup|good morning|good afternoon|good evening)(?:[!.\s]+)?$/i

export function isSimpleGreeting(text: string) {
  return GREETING_RE.test(text.trim())
}

export function greetingReply() {
  return 'Hi! Ask me anything about Botpress ADK, and I can help with docs, tools, workflows, integrations, or debugging.'
}
