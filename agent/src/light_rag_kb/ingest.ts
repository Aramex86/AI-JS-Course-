// 1.chunks the text using fixed chunk rules
// 2.embeds the chunks and adds them to the vector store
// 3. push our vector store to our knowledge base
// 4. return a summary of the knowledge base

import { chunkText } from "./chunk";
import { addChunks } from "./store";

// 2 pipelines
//  indexing and embedding -> prepare knowledge base
//  retrieval /answering   -> query knowledge base

export type IngestInput = {
  text: string;
  source: string;
};

export async function ingestText({ text, source }: IngestInput) {
  const raw = text.trim().replace(/\n/g, " ");

  if (!raw) {
    throw new Error("No text provided");
  }

  const givenSource = source ?? "pasted text";

  const docs = chunkText(raw, givenSource);

  // embed the chunks and add them to the vector store

  const chunkCount = await addChunks(docs);

  return {
    docCount: 1,
    chunkCount,
    source: givenSource,
  };
}
