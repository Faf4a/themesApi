import { createDatabaseInstance } from "@/db";

export default async function POST(req, res) {
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { token, themeId } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Invalid Request, unique user token is missing" });
    } else if (!themeId) {
        return res.status(400).json({ message: "Invalid Request, themeId is missing" });
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
    const db = client.db("themesDatabase");
    const themesCollection = db.collection("themes");
    const likesCollection = db.collection("likes");

    try {
        const themeExists = await db.collection("themes").findOne({ id: themeId });
        if (!themeExists) {
            return res.status(401).json({ status: 401, message: "Theme does not exist. Please ensure the theme id is correct and try again" });
        }

        const themeLike = await likesCollection.findOne({ themeId });

        if (themeLike) {
            if (!themeLike.userIds.includes(userId)) {
                return res.status(409).json({ status: 409, message: `User has not liked this theme matching '${themeId}'` });
            }

            // @ts-ignore
            await likesCollection.updateOne({ themeId }, { $pull: { userIds: userId } });

            const updatedThemeLike = await likesCollection.findOne({ themeId });
            if (updatedThemeLike && updatedThemeLike.userIds.length === 0) {
                await likesCollection.deleteOne({ themeId });
            }
        } else {
            return res.status(409).json({ status: 409, message: `User has not liked this theme matching '${themeId}'` });
        }

        await themesCollection.updateOne({ id: themeId }, { $inc: { likes: -1 } });

        res.status(200).json({ status: 200 });
    } catch (error) {
        res.status(500).json({ status: 500, message: `Failed to register likes of theme '${themeId}' with reason: ${error}` });
    }
}