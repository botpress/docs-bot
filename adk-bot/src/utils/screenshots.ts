const SCREENSHOTS = [
  {
    pattern: /\b(eval|evals|evaluation|evaluations|eval runs?|testing dashboard)\b/i,
    filename: 'evals-console-dark.png',
    markdown: '![Evals Console](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/evals-console-dark.png)',
  },
  {
    pattern: /\b(integration|integrations|hub|browse integrations|add integrations)\b/i,
    filename: 'integrations-console-dark.png',
    markdown: '![Integration Hub](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/integrations-console-dark.png)',
  },
  {
    pattern: /\b(configur(?:e|ing|ation).*integration|credentials|integration settings)\b/i,
    filename: 'integration-config-console-dark.png',
    markdown: '![Integration Configuration](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/integration-config-console-dark.png)',
  },
  {
    pattern: /\b(action|actions|trigger action|test action)\b/i,
    filename: 'actions-console-dark.png',
    markdown: '![Actions Console](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/actions-console-dark.png)',
  },
  {
    pattern: /\b(agent steps|trace execution|reasoning|inspect.*steps)\b/i,
    filename: 'agent-steps-dark.png',
    markdown: '![Agent Steps](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/agent-steps-dark.png)',
  },
  {
    pattern: /\b(config variables|configuration variables|secrets?|api keys?)\b/i,
    filename: 'config-variables-console-dark.png',
    markdown: '![Configuration Variables](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/config-variables-console-dark.png)',
  },
  {
    pattern: /\b(chat testing|test.*bot|conversations view|chat view)\b/i,
    filename: 'conversations-chat-dark.png',
    markdown: '![Conversations and Chat](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/conversations-chat-dark.png)',
  },
  {
    pattern: /\b(environment selector|dev.*prod|production|staging|switch.*environment)\b/i,
    filename: 'environment-selector-dark.png',
    markdown: '![Environment Selector](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/environment-selector-dark.png)',
  },
  {
    pattern: /\b(knowledge base|knowledge bases|indexed documents|sync.*documents)\b/i,
    filename: 'knowledge-console-dark.png',
    markdown: '![Knowledge Base Console](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/knowledge-console-dark.png)',
  },
  {
    pattern: /\b(logs?|runtime errors?|inspect.*logs?)\b/i,
    filename: 'logs-view-dark.png',
    markdown: '![Logs View](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/logs-view-dark.png)',
  },
  {
    pattern: /\b(table|tables|rows?|columns?|records?)\b/i,
    filename: 'tables-console-dark.png',
    markdown: '![Tables Console](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/tables-console-dark.png)',
  },
  {
    pattern: /\b(traces?|opentelemetry|llm call details|performance)\b/i,
    filename: 'traces-view-dark.png',
    markdown: '![Traces View](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/traces-view-dark.png)',
  },
  {
    pattern: /\b(trigger|triggers|incoming events?)\b/i,
    filename: 'triggers-console-dark.png',
    markdown: '![Triggers Console](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/triggers-console-dark.png)',
  },
  {
    pattern: /\b(workflow|workflows)\b/i,
    filename: 'workflows-console-dark.png',
    markdown: '![Workflows Console](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/workflows-console-dark.png)',
  },
  {
    pattern: /\b(quickstart|getting started|start with adk|install adk)\b/i,
    filename: 'quickstart-dark.png',
    markdown: '![Quickstart](https://cdn.jsdelivr.net/gh/botpress/docs@master/adk/assets/quickstart-dark.png)',
  },
]

const SCRAPED_IMAGE_LINE_PATTERN = /^\s*Image:\s*(?:\/icon\.png\s*)?(?:Ask AI)?\s*$/gim
const SCRAPED_IMAGE_CAPTION_PATTERN = /^\s*Image:\s*[^\n]+\s*$/gim
const RELATIVE_ICON_MARKDOWN_PATTERN = /^\s*!\[[^\]]*]\(\/icon\.png\)\s*$/gim

export function appendRelevantScreenshot(answer: string, question: string) {
  const cleaned = answer
    .replace(SCRAPED_IMAGE_LINE_PATTERN, '')
    .replace(SCRAPED_IMAGE_CAPTION_PATTERN, '')
    .replace(RELATIVE_ICON_MARKDOWN_PATTERN, '')
    .trim()

  const match = SCREENSHOTS.find(({ pattern }) => pattern.test(question))
  if (!match) return cleaned

  if (cleaned.includes(match.filename)) return cleaned

  return `${cleaned}\n\n${match.markdown}`
}
