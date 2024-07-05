import { createDatabaseInstance } from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    const { theme } = req.query;

    // TODO: find a better way to serve themes efficiently
    // i somehow have to find a way to not
    // send 29245 billion requests to the database for each theme
    // cache might be enough?
    const client = await createDatabaseInstance();
    const db = client.db("themesDatabase");
    const themesCollection = db.collection("themes");

    const __theme__ = await themesCollection.findOne({ name: theme });

    if (!__theme__) return res.status(404).json({ status: 404, message: `Couldn't find the theme with the name '${theme}'` });

    const css = Buffer.from(__theme__.content, "base64").toString("utf-8");

    // we love cache
    res.setHeader("Content-Type", "text/css");
    res.setHeader("Cache-Control", "public, max-age=1200");
    res.status(200).end(css);
}
