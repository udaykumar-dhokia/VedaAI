import { ChatOllama } from "@langchain/ollama";
import { ChatGoogle } from "@langchain/google";

const modelName = process.env.MODEL_NAME || "llama3";
const baseUrl = process.env.MODEL_BASE_URL || "http://localhost:11434";
const apiKey = process.env.MODEL_API_KEY;

const llm = new ChatGoogle({
  model: modelName,
  apiKey: apiKey,
  temperature: 0.7,
});

export default llm;
