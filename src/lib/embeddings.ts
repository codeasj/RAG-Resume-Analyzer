import { Embeddings } from "@langchain/core/embeddings";
import { createGeminiEmbeddings } from "./gemini-embeddings";
import { createOpenAIEmbeddings } from "./openai-embeddings";

let embeddings: Embeddings | null = null;

export const getEmbeddings = () => {
  if (!embeddings) {
    const provider = process.env.EMBEDDING_PROVIDER || "gemini";

    embeddings =
      provider === "openai"
        ? createOpenAIEmbeddings()
        : createGeminiEmbeddings();
  }

  return embeddings;
};
