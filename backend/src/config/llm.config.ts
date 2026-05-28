import { ChatOllama } from "@langchain/ollama";
import { ChatGoogle } from "@langchain/google";

export const getLlm = (customApiKey?: string, customModelName?: string) => {
  const modelName = customModelName || process.env.MODEL_NAME || "gemini-1.5-pro";
  const apiKey = customApiKey || process.env.MODEL_API_KEY;

  return new ChatGoogle({
    model: modelName,
    apiKey: apiKey,
    temperature: 0.7,
  });
};
