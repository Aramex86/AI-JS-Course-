import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_CHUNK_OVERLAP = 150;

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: DEFAULT_CHUNK_SIZE,
  chunkOverlap: DEFAULT_CHUNK_OVERLAP,
});

export async function splitDocuments(
  documents: Document[],
): Promise<Document[]> {
  if (!documents) return [];

  const chunks = await splitter.splitDocuments(documents);

  return chunks.map((chunk, index) => {
    const base = chunk.metadata ?? {};

    return new Document({
      pageContent: chunk.pageContent.trim(),
      metadata: {
        ...base,
        source: base?.source ?? "unknown_source",
        _chunkIndex: index,
      },
    });
  });
}
