import { createDatabaseInstance } from "@/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { token, content } = req.body;

    if (!token) {
        return res.status(400).json({ status: 400, message: "Invalid Request, unique user token is missing" });
    } else if (!content) {
        return res.status(400).json({ status: 400, message: "Invalid Request, content is missing" });
    }

    const response = await fetch("/user/isAuthed", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
    });

    const { isAuthorized, userId } = await response.json();

    if (!isAuthorized) {
        return res.status(401).json({ status: 401, message: "Given token is not authorized" });
    }
    
    const client = await createDatabaseInstance();
    const db = client.db("submittedThemesDatabase");
    const themesCollection = db.collection("pending");
    const blockedUsers = db.collection("blockedUsers");

    // you will explode if you spam this endpoint
    const isBlocked = await blockedUsers.findOne({ id: userId });

    if (isBlocked) {
        // explode even more if you're blocked :troll:
        return res.status(403).json({ status: 403, message: "You have been blocked from submitting themes", reason: isBlocked.reason, expires: isBlocked.expires });
    }

    const decodedContent = Buffer.from(content, "base64").toString("utf-8");
    // i hate regex with a passion, i dont know why this works but it works somehow
    const metadata = decodedContent.match(/\/\*\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g)?.[0] || "";
    // find the theme name, description, and author
    if (!metadata) return res.status(400).json({ message: "Malformed theme metadata, must include a name, version, and author", status: 400 });

    const name = metadata.match(/@name\s+(.+)/)?.[1] || "";
    const description = metadata.match(/@version\s+(.+)/)?.[1] || "";
    const author = metadata.match(/@author\s+(.+)/)?.[1] || "";

    switch (true) {
        case !name:
            return res.status(400).json({ message: "Malformed theme metadata, must include a name", status: 400 })
        case !description:
            return res.status(400).json({ message: "Malformed theme metadata, must include a description", status: 400 })
        case !author:
            return res.status(400).json({ message: "Malformed theme metadata, must include an author", status: 400 })
    }

    await themesCollection.insertOne({
        name,
        description,
        author: { id: userId, name: author },
        content,
        decodedContent
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ status: 200 });
}
