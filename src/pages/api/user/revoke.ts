import type { NextApiRequest, NextApiResponse } from "next";
import { createDatabaseInstance } from "@/db";

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { token, userId } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Cannot revoke authorization without unique token, if you think that this is a bug report it to https://github.com/faf4a/themesApi" });
    }

    if (!userId) {
        return res.status(400).json({ message: "Cannot revoke authorization without user id, if you think that this is a bug report it to https://github.com/faf4a/themesApi" });
    }

    const client = await createDatabaseInstance();
    const db = client.db("themesDatabase");
    const users = db.collection("users");

    const userEntry = await users.deleteOne({ "user.id": userId, "user.key": token });

    res.setHeader("Content-Type", "application/json");

    console.log(userEntry);
    
    if (userEntry.deletedCount === 0) {
        res.status(500).json({ status: 400, message: "No user found with those credentials" });
    } else {
        res.status(200).json({ status: 200, authorized: false, message: "Deleted user entry" });
    }
}
