import { createDatabaseInstance } from "@/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    res.setHeader("Content-Type", "application/json");

    const client = await createDatabaseInstance();
    const db = client.db("themesDatabase");
    const likesCollection = db.collection("likes");

    try {
        // for some reason this LOVES to explode
        const likes = await likesCollection.find().toArray();

        // removing db stuff from data
        const sanitizedLikes = likes.map(({ _id, ...rest }) => rest);

        res.status(200).json({ status: 200, totalEntries: (likes.length - 1), likes: sanitizedLikes });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
}
