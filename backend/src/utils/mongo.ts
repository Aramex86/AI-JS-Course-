import { Db, MongoClient } from "mongodb";
import { env } from "./env";

let client: MongoClient | null = null;

let db: Db | null = null;

export async function connectToDb(): Promise<MongoClient> {
  if (client) return client;

  client = new MongoClient(env.MONGO_ATLAS_URI);

  await client.connect();

  db = client.db(env.MONGO_DB_NAME);

  console.log("Connected to DB");
  return client;
}

export async function getDb(): Promise<Db> {
  if (db) return db;

  const exctractClient = await connectToDb();

  db = exctractClient.db(env.MONGO_DB_NAME);

  console.log(`Connected to DB ${env.MONGO_DB_NAME}`);

  return db;
}
