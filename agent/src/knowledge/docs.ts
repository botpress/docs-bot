import { DataSource, Knowledge } from "@botpress/runtime";

const BotpressDocsSource = DataSource.Website.fromSitemap(
  "https://www.botpress.com/docs/sitemap.xml"
);

export const KnowledgeDocs = new Knowledge({
  name: "botpress-docs",
  description: "Knowledge base sourced from Botpress official documentation.",
  sources: [BotpressDocsSource],
});