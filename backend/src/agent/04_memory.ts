import { Collection, WithId } from "mongodb";
import { getDb } from "../utils/mongo";
import { nanoid } from "nanoid";

export type ChatRole = "user " | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: string;
}

export interface CoversationDoc {
  threadId: string;
  messages: { role: ChatRole; content: string; timestamp: string }[];
  createdAt: Date;
  upDatedAt: Date;
}

const CONVERSATION_COLLECTION = "conversations";

let conversationsCollectionPromise: Promise<Collection<CoversationDoc>> | null =
  null;

async function getConversationsCollection(): Promise<
  Collection<CoversationDoc>
> {
  if (!conversationsCollectionPromise) {
    conversationsCollectionPromise = (async () => {
      const db = await getDb();
      const col = db.collection<CoversationDoc>(CONVERSATION_COLLECTION);

      await col.createIndex({ threadId: 1 }, { unique: true });
      return col;
    })();
  }
  return conversationsCollectionPromise;
}

export async function ensureThreadId(isThreadId: string): Promise<string> {
  const col = await getConversationsCollection();

  if (isThreadId) {
    const existiong = await col.findOne({ thredId: isThreadId });

    if (existiong) return isThreadId;
  }

  const threadId = nanoid(12);

  const now = new Date();

  await col.insertOne({
    threadId,
    messages: [],
    createdAt: now,
    upDatedAt: now,
  });

  return threadId;
}

export async function getHistory(threadId: string): Promise<ChatMessage[]> {
  const col = await getConversationsCollection();
  const doc: WithId<CoversationDoc> | null = await col.findOne({ threadId });

  if (!doc) return [];

  return doc.messages.map(({ role, content, timestamp }) => ({
    role,
    content,
    timestamp,
  }));
}

export async function appendToHistory(
  threadId: string,
  ...message: ChatMessage[]
): Promise<void> {
  if (!message.length) return;
  const col = await getConversationsCollection();

  const messagesWithTimestamp = message.map(({ role, content, timestamp }) => ({
    role,
    content,
    timestamp: timestamp ?? new Date().toISOString(),
  }));

  await col.updateOne(
    { threadId },
    {
      $push: { messages: { $each: messagesWithTimestamp } },
      $set: { upDatedAt: new Date() },
    },
  );
}
