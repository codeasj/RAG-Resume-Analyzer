import {OpenAIEmbeddings} from "@langchain/openai";

let embeddings: OpenAIEmbeddings | null = null;

export const getEmbeddings = () => {
    if(!embeddings) { 
        embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            modelName: "text-embedding-ada-002",
         })
    }
    return embeddings;
}
