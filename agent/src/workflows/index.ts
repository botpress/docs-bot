import { Workflow} from "@botpress/runtime";
import { KnowledgeDocs } from "../knowledge/docs";

export const IndexSitemapKnowledgeWorkflow = new Workflow({
  name: "indexKnowledge",
  schedule: "0 0 * * *", // Daily at midnight
  handler: async () => await KnowledgeDocs.refresh({force: true}),
});