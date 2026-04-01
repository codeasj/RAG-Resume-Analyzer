import { OpenAIEmbeddings } from "@langchain/openai";

export const createOpenAIEmbeddings = () => {
  return new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small",
  });
};
