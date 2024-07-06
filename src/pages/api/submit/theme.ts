import { createDatabaseInstance } from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";

const reqsMap = new Map<string, { timestamps: number[]; count: number }>();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { token, content } = req.body;
    const now = Date.now();

    if (!token) {
        return res.status(400).json({ status: 400, message: "Invalid Request, unique user token is missing" });
    } else if (!content) {
        return res.status(400).json({ status: 400, message: "Invalid Request, content is missing" });
    }

    const user = await isAuthed(token);

    if (!user) {
        return res.status(401).json({ status: 401, message: "Given token is not authorized" });
    }

    let userReqs = reqsMap.get(user.id) || { timestamps: [], count: 0 };
    const reqs = userReqs.timestamps.filter((timestamp) => now - timestamp < 15e3);

    const client = await createDatabaseInstance();
    const db = client.db("submittedThemesDatabase");
    
    const themesCollection = db.collection("pending");
    const blockedUsers = db.collection("blockedUsers");
    const isBlocked = await blockedUsers.findOne({ id: user.id });

    if (reqs.length >= 1) {
        userReqs.count += 1;

        // block user temporarily if they spam requests WHILE ratelimited
        if (userReqs.count >= 20) {
            if (isBlocked) return res.status(403).json({ status: 403, message: "You have been blocked from submitting themes", reason: isBlocked.reason, expires: isBlocked.expires });
            blockedUsers.insertOne({ id: user.id, reason: "Excessive requests", expires: new Date(Date.now() + 30 * 60 * 1000) });
            return res.status(403).json({ status: 403, message: "You have been blocked temporarily from submitting themes due to excessive requests" });
        }

        if (isBlocked) return res.status(403).json({ status: 403, message: "You have been blocked from submitting themes", reason: isBlocked.reason, expires: isBlocked.expires });
        
        reqsMap.set(user.id, userReqs);

        const remaining = Math.ceil((15e3 - (now - reqs[0])) / 1e3);
        res.setHeader("Retry-After", remaining);
        return res.status(429).json({ status: 429, message: `Rate limit exceeded. Try again later after ${remaining} seconds` });
    } else {
        userReqs.count = 0;
    }

    userReqs.timestamps.push(now);
    reqsMap.set(user.id, userReqs);

    if (isBlocked) {
        if (isBlocked.expires < Date.now()) {
            blockedUsers.deleteOne({ id: user.id });
        } else {
            // explode even more if you're blocked :troll:
            return res.status(403).json({ status: 403, message: "You have been blocked from submitting themes", reason: isBlocked.reason, expires: isBlocked.expires });
        }
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
            return res.status(400).json({ message: "Malformed theme metadata, must include a name", status: 400 });
        case !description:
            return res.status(400).json({ message: "Malformed theme metadata, must include a description", status: 400 });
        case !author:
            return res.status(400).json({ message: "Malformed theme metadata, must include an author", status: 400 });
    }

    await themesCollection.insertOne({
        name,
        description,
        author: { id: user.id, name: author },
        content,
        decodedContent
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ status: 200 });
}
