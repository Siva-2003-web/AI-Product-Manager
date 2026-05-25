import { MongoClient, Db } from "mongodb";

// Enforce IPv4 by default to avoid Node.js 17+ localhost IPv6 resolution timeouts
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/";
const DB_NAME = "ai_pm_landing";

let client: MongoClient;
let db: Db;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, options);
      global._mongoClientPromise = client.connect();
    }
    client = await global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(MONGODB_URI, options);
    await client.connect();
  }

  db = client.db(DB_NAME);

  // Ensure indexes are created safely without blocking the connection
  db.collection("users")
    .createIndex({ email: 1 }, { unique: true })
    .catch((err) => console.error("Failed to create index:", err));

  return { client, db };
}
