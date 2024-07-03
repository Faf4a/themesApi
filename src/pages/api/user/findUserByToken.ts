import type { NextApiRequest, NextApiResponse } from "next";
import { createDatabaseInstance } from "../../../db";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } 
    
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Cannot check authorization without unique token, if you think that this is a bug report it to https://github.com/faf4a/themesApi" });
    }

    const client = await createDatabaseInstance();
    const db = client.db("themesDatabase");
    const users = db.collection("users");

    // this will totally never break lol
    const userEntry = (await users.findOne({ "user.key": token }))?.user;
    
    const sanitizedUserEntry = userEntry.map(({ _id, ...rest }) => rest);

    res.setHeader("Content-Type", "application/json");

    if (!userEntry) {
        res.status(500).json({ status: 404, message: "No user found with those credentials" });
    } else {
        res.status(200).json({ status: 200, user: sanitizedUserEntry });
    }
}
