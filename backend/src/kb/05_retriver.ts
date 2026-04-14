import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./03_vectorStore";

export interface RetrivelResult {
  docs: Document[];
  confidence: number;
}

export async function retriveRelevantChunks(
  query: string,
  namespace: string = "default",
  k: number = 2,
): Promise<RetrivelResult> {
  if (!query.trim()) return { docs: [], confidence: 0 };

  const vectorStore = await getVectorStore();

  // MongoDB Atlas Vector Search uses preFilter for filtering
  const results = await vectorStore.similaritySearchWithScore(query, k, {
    preFilter: {
      namespace: {
        $eq: namespace,
      },
    },
  });

  if (!results.length) return { docs: [], confidence: 0 };

  const docs: Document[] = results.map(([doc]) => doc);

  const scores = results.map(([, score]) => score);
  const best = Math.max(...scores);
  const normalized = Math.max(0, Math.min(1, best));

  const confidence = Number(normalized.toFixed(2));

  return { docs, confidence };
}
