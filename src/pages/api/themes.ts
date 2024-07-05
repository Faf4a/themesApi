import { createDatabaseInstance } from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    const client = await createDatabaseInstance();
    const db = client.db("themesDatabase");
    const themesCollection = db.collection("themes");

    const themes = await themesCollection.find().toArray();

    const sanitizedThemes = themes.map(({ _id, ...rest }) => rest);

    res.setHeader("Cache-Control", "public, max-age=1200");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(sanitizedThemes);
}
