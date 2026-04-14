import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./03_vectorStore";

export interface IngestSummary {
  ok: boolean;
  namespace: string;
  totalChunks: number;
  source: string[];
}

export async function ingestDocuments(
  namespace: string,
  chunks: Document[],
): Promise<IngestSummary> {
  if (!namespace) {
    throw new Error("namespace is required");
  }

  if (!chunks.length) {
    return {
      ok: false,
      namespace,
      totalChunks: 0,
      source: [],
    };
  }

  const vectorStore = await getVectorStore();

  // stable metadata for every document

  let currentId = 0;

  const docsWithMeta = chunks.map((chunk) => {
    const source = (chunk.metadata?.source as string) ?? "unknown_source";

    const doc = new Document({
      pageContent: chunk.pageContent.trim(),
      metadata: {
        namespace,
        source,
        chunkId: currentId++,
      },
    });

    return doc;
  });

  await vectorStore.addDocuments(docsWithMeta);

  const sources = Array.from(
    new Set(docsWithMeta.map((doc) => doc.metadata.source)),
  );

  return {
    ok: true,
    namespace,
    totalChunks: docsWithMeta.length,
    source: sources,
  };
}
