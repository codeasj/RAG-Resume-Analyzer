import { Pinecone } from "@pinecone-database/pinecone";

let client: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!client) {
    client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return client;
};

export const getPineconeIndex = () => {
  const provider = process.env.EMBEDDING_PROVIDER || "gemini";
  return getPineconeClient().index(
    provider === "openai"
      ? process.env.PINECONE_INDEX_OPENAI!
      : process.env.PINECONE_INDEX_GEMINI!,
  );
};
