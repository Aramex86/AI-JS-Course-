import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("5174"),
  ALLOWED_ORIGIN: z.url().default("http://localhost:3000"),
  MODEL_PROVIDER: z.enum(["openai", "gemini", "groq"]).default("gemini"),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash-lite"),
  GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
  SEARCH_PROVIDER: z.enum(["tavily"]).default("tavily"),
});
