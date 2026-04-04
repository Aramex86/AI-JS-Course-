import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),
  GEMINI_MODEL: z.string(),
  PORT: z.string().default("5174"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.format());
  throw new Error("Invalid environment variables");
}

const raw = parsed.data;

export const env = Object.freeze({
  GOOGLE_API_KEY: raw.GOOGLE_API_KEY,
  GEMINI_MODEL: raw.GEMINI_MODEL,
  PORT: raw.PORT,
});
