import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const createGeminiEmbeddings = () => {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-001",
  });
};
