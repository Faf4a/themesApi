import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Cannot check authorization without unique token, if you think that this is a bug report it to https://github.com/faf4a/themesApi" });
    }

    const user = await isAuthed(token);

    res.setHeader("Content-Type", "application/json");

    if (!user) {
        res.status(500).json({ status: 401, authenticated: false });
    } else {
        // @ts-ignore
        res.status(200).json({ status: 200, authenticated: true, userId: user.id });
    }
}
