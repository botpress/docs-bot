import { Workflow } from '@botpress/runtime'
import { WebsiteKB } from '../knowledge'

/**
 * Re-index the knowledge base on a schedule. Knowledge bases only re-fetch
 * their sources during `adk dev`, `adk deploy`, or an explicit `KB.refresh()`
 * call — there's no automatic refresh otherwise. This workflow runs daily at
 * 00:00 UTC and pulls fresh content from the Botpress docs sitemap and the
 * pinned skills .md URLs.
 */
export const RefreshKnowledge = new Workflow({
  name: 'refreshKnowledge',
  schedule: '0 0 * * *',
  handler: async () => {
    await WebsiteKB.refresh()
  },
})
