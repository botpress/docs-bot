import { DataSource, Knowledge } from '@botpress/runtime'

const DocsSource = DataSource.Website.fromSitemap(
  'https://botpress.com/docs/sitemap.xml',
  {
    id: 'botpress-docs',
    filter: ({ url }) => url.includes('/docs/adk'),
  },
)

const SkillsSource = DataSource.Website.fromUrls(
  [
    // ADK core skill
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/SKILL.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/actions.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/advanced-patterns.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/agent-config.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/cli.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/context-api.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/conversations.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/desk.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/evals.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/files.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/integration-actions.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/integrations.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/knowledge-bases.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/mcp-server.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/messages.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/model-configuration.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/patterns-mistakes.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/tables.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/tags.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/tools.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/triggers.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/workflows.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/zai-agent-reference.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk/references/zai-complete-guide.md',
    // ADK debugger
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-debugger/SKILL.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-debugger/references/common-failures.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-debugger/references/debug-workflow.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-debugger/references/llm-debugging.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-debugger/references/traces-and-logs.md',
    // ADK docs
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-docs/SKILL.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-docs/references/doc-standards.md',
    // ADK evals
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-evals/SKILL.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-evals/references/eval-format.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-evals/references/test-patterns.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-evals/references/testing-workflow.md',
    // ADK frontend
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/SKILL.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/authentication.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/botpress-client.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/calling-actions.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/data-fetching.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/overview.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/project-setup.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/realtime-updates.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/recommended-stack.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/service-layer.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/state-management.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-frontend/references/type-generation.md',
    // ADK integrations
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-integrations/SKILL.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-integrations/references/common-integrations.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-integrations/references/configuration.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-integrations/references/discovery.md',
    'https://raw.githubusercontent.com/botpress/skills/master/skills/adk-integrations/references/lifecycle.md',
  ],
  { id: 'botpress-skills' },
)

export const WebsiteKB = new Knowledge({
  name: 'Botpress',
  description:
    'Knowledge base containing Botpress ADK documentation and skill references.',
  sources: [DocsSource, SkillsSource],
})
