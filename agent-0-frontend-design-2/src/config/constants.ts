export const BOT_CONFIG = {
  name: "agent(0)",
  avatar: "https://files.bpcontent.cloud/2025/11/19/21/20251119210301-2SLGBPIY.png",
  description: "Ask the ADK assistant a question. Powered by Botpress.",
} as const;

export const COLORS = {
  primary: "#0090FF",
  primaryLight: "rgb(0 144 255/.1)",
  primaryBorder: "rgba(0, 144, 255, 0.15)",
  primaryHover: "rgba(0, 144, 255, 0.2)",
} as const;

// Localhost ports included so the docs site (running via `mintlify dev`)
// can postMessage into this iframe during local development.
export const ALLOWED_PARENT_ORIGINS: string[] = [
  "https://botpress.com",
  "https://www.botpress.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

// agent-0's webchat client ID (different bot from the default docs bot).
// Sourced from https://files.bpcontent.cloud/2026/04/29/19/20260429192954-V3FCRIPQ.json
export const CLIENT_ID = "b09761d4-52ba-40f1-be61-b1e7ac09956f" as const