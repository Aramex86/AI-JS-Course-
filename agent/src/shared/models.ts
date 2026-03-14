import { env } from "./env";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google";
import { ChatGroq } from "@langchain/groq";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

type ModelOpt = {
  temperature?: number;
  maxTokens?: number;
};

export function getChatModel(opt: ModelOpt): BaseChatModel {
  const temp = opt.temperature ?? 0.2;

  switch (env.MODEL_PROVIDER) {
    case "openai":
      return new ChatOpenAI({
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL,
        temperature: temp,
        // maxTokens: opt.maxTokens,
      });
    case "gemini":
      return new ChatGoogle({
        apiKey: env.GOOGLE_API_KEY,
        model: env.GEMINI_MODEL,
        temperature: temp,
        // maxTokens: opt.maxTokens,
      });
    case "groq":
      return new ChatGroq({
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
        temperature: temp,
      });
  }
}
