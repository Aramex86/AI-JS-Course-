import "dotenv/config";
import { z } from "zod";

const EnvSchemma = z.object({
  PORT: z
    .string()
    .default("5000")
    .transform((val) => Number(val)),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  MONGO_ATLAS_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGO_DB_NAME: z.string().min(1, "MONGO_DB_NAME is required"),
});

const parsed = EnvSchemma.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
