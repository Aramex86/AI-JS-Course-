import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { env } from "./env";

export const model = new ChatOpenAI({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "gpt-5-nano",
  temperature: 1,
});

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});
