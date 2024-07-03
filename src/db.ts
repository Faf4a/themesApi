import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI!;

let cachedClient: MongoClient;

export async function createDatabaseInstance() {
    const client: MongoClient = new MongoClient(uri);

    if (!cachedClient) await client.connect();
    cachedClient = client;

    return cachedClient;
}
