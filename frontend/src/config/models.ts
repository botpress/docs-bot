export interface ModelConfig {
  id: string;
  displayName: string;
  isDefault?: boolean;
}

export const MODELS: ModelConfig[] = [
  {
    id: "cerebras:gpt-oss-120b",
    displayName: "GPT-OSS-120b",
    isDefault: true
  },
  {
    id: "openai:gpt-4.1",
    displayName: "GPT-4.1",
  },
  {
    id: "anthropic:claude-sonnet-4-5",
    displayName: "Claude Sonnet 4.5",
  },
  {
    id: "google-ai:gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
  },
];

export const DEFAULT_MODEL = MODELS.find((m) => m.isDefault) || MODELS[0];

