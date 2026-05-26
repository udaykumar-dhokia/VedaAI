import { ChatOllama } from "@langchain/ollama";

const modelName = process.env.OLLAMA_MODEL || "llama3";
const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const llm = new ChatOllama({
  model: modelName,
  baseUrl: baseUrl,
  temperature: 0.7,
});

export default llm;
