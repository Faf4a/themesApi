import { createDatabaseInstance } from "@utils/db";
import type { NextApiResponse } from "next";

export default async function GET(res: NextApiResponse) {
    const client = await createDatabaseInstance();
    const db = client.db("themesDatabase");
    const themesCollection = db.collection("themes");

    const themes = await themesCollection.find({}, { projection: { _id: 0 } }).toArray();

    res.setHeader("Cache-Control", "public, max-age=1200");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(themes);
}
