// Import the Document class from LangChain core for creating document objects
import { Document } from "@langchain/core/documents";
// Import locale utility from Zod (note: this import appears unused in the current code)
import { en } from "zod/locales";

// Export constant for the maximum size of each text chunk in characters
export const CHUNCK_SIZE = 1000;
// Export constant for the overlap between consecutive chunks in characters
export const CHUNCK_OVERLAP = 150;

/**
 * Breaks up a given text into smaller chunks, each with metadata about their source and chunk ID.
 * @param {string} text - The text to chunk.
 * @param {string} source - The source of the text.
 * @returns {Array<Document>} - An array of Documents, each containing a chunk of the text and its metadata.
 */
// Export function that splits text into smaller chunks with metadata
export function chunkText(text: string, source: string): Document[] {
  // Clean the input text: handle null/undefined, trim whitespace, normalize line endings
  const clean = (text ?? "").trim().replace(/\r\n/g, "\n");

  // Initialize an empty array to store the resulting document chunks
  const docs: Document[] = [];

  // If the cleaned text is empty after trimming, return empty array early
  if (!clean.trim()) return docs;

  // Calculate the step size for moving to the next chunk (chunk size minus overlap)
  // Ensure step is at least 1 to prevent infinite loops
  const step = Math.max(1, CHUNCK_SIZE - CHUNCK_OVERLAP);

  // Initialize the starting position for the first chunk at index 0
  let start = 0;
  // Initialize the chunk ID counter to track the sequence number of each chunk
  let chunkId = 0;

  // Loop through the text until we've processed all characters
  while (start < clean.length) {
    // Calculate the end position for the current chunk, bounded by text length
    const end = Math.min(start + CHUNCK_SIZE, clean.length);

    // Extract the slice from start to end position and trim any extra whitespace
    const slice = clean.slice(start, end).trim();
    // Only create a document if the slice contains meaningful content
    if (slice.length > 0) {
      // Push a new Document object to the array with the chunk content and metadata
      docs.push(
        new Document({
          // The actual text content of this chunk
          pageContent: slice,
          // Metadata object containing source identifier and chunk sequence number
          metadata: {
            // The source of the original text (e.g., file name, URL)
            source,
            // The zero-based index of this chunk in the sequence
            chunk: chunkId,
          },
        }),
      );
    }
    // Increment the chunk ID for the next iteration
    chunkId += 1;
    // Move the start position forward by the step size to get the next chunk
    start += step;
  }
  // Return the array of document chunks with their metadata
  return docs;
}

// ## Simple Explanation of [`chunk.ts`](agent/src/light_rag_kb/chunk.ts)

// This file provides a text chunking utility for a RAG (Retrieval-Augmented Generation) knowledge base system.

// **What it does:**
// - Takes a large text and source name as input
// - Splits the text into smaller pieces (chunks) of up to 1000 characters each
// - Each chunk overlaps with the next one by 150 characters to preserve context
// - Returns an array of Document objects, each containing:
//   - The chunk's text content
//   - Metadata: the source name and a chunk ID number

// **Why it exists:**
// - Large texts need to be broken into smaller pieces for AI models to process
// - The overlap ensures context isn't lost at chunk boundaries
// - The metadata (source + chunk ID) helps track where each piece came from

// **Key constants:**
// - `CHUNCK_SIZE = 1000` - Maximum characters per chunk
// - `CHUNCK_OVERLAP = 150` - Characters shared between consecutive chunks
