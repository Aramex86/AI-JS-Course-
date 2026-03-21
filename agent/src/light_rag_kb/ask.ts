// ask the knowledge base -> get a short helpful ans

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/models";
import { getStore } from "./store";

export type KBSource = {
  source: string;
  chunkId: number;
};

export type KBAnswer = {
  answer: string;
  source: KBSource[];
  confidence: number;
};

function buildContext(chunks: { text: string; metadata: any }[]) {
  return chunks
    .map(({ text, metadata }, i) =>
      [
        `[#${i + 1} ${String(metadata.source) ?? "unknown"}] #${String(metadata.chunkId) ?? "?"}`,
        text ?? "empty Text",
      ].join("\n"),
    )
    .join("\n\n--------\n\n");
}

async function buildFinalAnswerFromLLN(query: string, context: string) {
  const model = getChatModel({ temperature: 0.2 });

  const response = await model.invoke([
    new SystemMessage(
      [
        "You are halpful assistant that answers questions about the provided context",
        "If unsure, say so",
        "Be concise (4-5 sentences), neutral and avoid any marketing info",
        "Do not invent sources or cite anything that is not in the context",
      ].join("\n"),
    ),
    new HumanMessage(
      [
        "Answer the following question using the provided context:",
        "Question:",
        query,
        "Context:",
        context || "No context provided",
      ].join("\n\n"),
    ),
  ]);

  const finalAnswer =
    typeof response.content === "string"
      ? response.content
      : String(response.content);

  return finalAnswer.trim().slice(0, 1500);
}

function buildConfidence(score: number[]): number {
  if (!score.length) return 0;
  const clampedScore = score.map((s) => Math.max(0, Math.min(1, s)));

  const avrage = clampedScore.reduce((a, b) => a + b, 0) / clampedScore.length;

  return Math.round(avrage * 100) / 100;
}

export async function askKb(query: string, k = 2): Promise<KBAnswer> {
  const validateCurrentQuery = (query ?? "").trim();

  if (!validateCurrentQuery) throw new Error("No query provided");

  const store = getStore();

  // embed the query and get the vector
  const queryEmbedding =
    await store.embeddings.embedQuery(validateCurrentQuery);

  const pairs = await store.similaritySearchVectorWithScore(queryEmbedding, k);

  const chunks = pairs.map(([doc]) => ({
    text: doc.pageContent || "",
    metadata: doc.metadata || {},
  }));

  const score = pairs.map(([, score]) => Number(score) ?? 0);

  //prompt context

  const context = buildContext(chunks);

  const answer = await buildFinalAnswerFromLLN(validateCurrentQuery, context);

  const sources: KBSource[] = chunks.map((chunk) => ({
    source: String(chunk.metadata.source) ?? "unknown",
    chunkId: Number(chunk.metadata.chunkId) ?? 0,
  }));

  const confidence = buildConfidence(score);

  return { answer, source: sources, confidence };
}
