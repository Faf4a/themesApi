import clientPromise from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ status: 400, message: "Invalid Request, missing required values" });
    }

    const client = await clientPromise;
    const db = client.db("themesDatabase");
    const themesCollection = db.collection("themes");

    if (!await themesCollection.findOne({ id })) {
        return res.status(404).json({ status: 404, message: "Theme not found" });
    }

    await themesCollection.deleteOne({ id });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ status: 200 });
}
