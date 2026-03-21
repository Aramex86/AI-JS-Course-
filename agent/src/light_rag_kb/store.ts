import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { TaskType } from "@google/generative-ai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";

type Provider = "openai" | "google";

function getProvider(): Provider {
  const getCurrentProvider = (
    process.env.RAG_MODEL_PROVIDER ?? "gemini"
  ).toLocaleLowerCase();

  return getCurrentProvider === "gemini" ? "google" : "openai";
}

// create embadings client

function makeOpenAIEmbeddings() {
  const key = process.env.OPENAI_API_KEY!;

  if (!key) throw new Error("OPENAI_API_KEY is not defined");

  return new OpenAIEmbeddings({ apiKey: key, model: "text-embedding-3-small" });
}

function makeGoogleEmbeddings() {
  const key = process.env.GOOGLE_API_KEY!;

  if (!key) throw new Error("GOOGLE_API_KEY is not defined");

  return new GoogleGenerativeAIEmbeddings({
    apiKey: key,
    model: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
  });
}

function makeEmbeddings(provider: Provider) {
  return provider === "google"
    ? makeGoogleEmbeddings()
    : makeOpenAIEmbeddings();
}

//vector store

let store: MemoryVectorStore | null = null; // Initialize the store as nullMemoryVectorStore;

let currentSetProvider: Provider | null = null; // Initialize the provider as null

export function getStore(): MemoryVectorStore {
  const provider = getProvider();

  // same provider, return the same store
  if (store && currentSetProvider === provider) return store!;

  //provider changed, create a new store
  store = new MemoryVectorStore(makeEmbeddings(provider));
  currentSetProvider = provider;

  return store;
}

// Add chunks to the vector store

export async function addChunks(chunks: Document[]): Promise<number> {
  if (!Array.isArray(chunks) || chunks.length === 0) return 0;

  const store = getStore();

  await store.addDocuments(chunks);

  return chunks.length;
}

export function clearStore() {
  store = null;
  currentSetProvider = null;
}
