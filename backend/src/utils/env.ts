import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_MODEL: z.string(),
  PORT: z.string().default("5174"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.format());
  throw new Error("Invalid environment variables");
}

const raw = parsed.data;

export const env = Object.freeze({
  OPENAI_API_KEY: raw.OPENAI_API_KEY,
  OPENAI_MODEL: raw.OPENAI_MODEL,
  PORT: raw.PORT,
});
