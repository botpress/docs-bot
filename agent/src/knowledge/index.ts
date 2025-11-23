import { DataSource, Knowledge } from "@botpress/runtime";

const BotpressDocsSource = DataSource.Website.fromUrls(["https://botpress.com/docs/llms-full.txt"]);

export const KnowledgeDocs = new Knowledge({
  name: "botpress-docs",
  description: "Knowledge base sourced from Botpress official documentation.",
  sources: [BotpressDocsSource],
});