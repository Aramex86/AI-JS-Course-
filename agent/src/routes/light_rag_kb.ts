import { Router } from "express";
import { z } from "zod";
import { ingestText } from "../light_rag_kb/ingest";
import { clearStore } from "../light_rag_kb/store";
import { askKb } from "../light_rag_kb/ask";

export const kbRouter = Router();

const IngestBodySchema = z.object({
  text: z.string().min(1, "Provide text to ingest"),
  source: z.string().optional(),
});

type IngestBodyT = z.infer<typeof IngestBodySchema>;

kbRouter.post("/ingest", async (req, res) => {
  try {
    const body = IngestBodySchema.parse(req.body) as IngestBodyT;

    const result = await ingestText({
      text: body.text,
      source: body.source ?? "pasted text",
    });

    res.status(200).json({ ok: true, ...result });
  } catch (e) {
    const errorMessage = (e as Error)?.message ?? "unknown error occured";
    res.status(400).json({ error: errorMessage });
  }
});

kbRouter.post("/reset", async (req, res) => {
  clearStore();

  res.status(200).json({ ok: true, message: "store cleared" });
});

const AskBodySchema = z.object({
  query: z.string().min(1, "Provide a question"),
  k: z.number().int().min(1).max(10).optional(),
});

type AskBodyT = z.infer<typeof AskBodySchema>;

kbRouter.post("/ask", async (req, res) => {
  try {
    const body = AskBodySchema.parse(req.body) as AskBodyT;

    const result = await askKb(body.query, body.k ?? 2);

    res.status(200).json({
      answer: result.answer,
      sources: result.source,
      confidence: result.confidence,
    });
  } catch (e) {
    const errorMessage = (e as Error)?.message ?? "unknown error occured";
    res.status(400).json({ error: errorMessage });
  }
});
