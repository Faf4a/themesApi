import type { NextApiRequest, NextApiResponse } from "next";
import type { APIUser as User } from "discord-api-types/v10";
import { createDatabaseInstance } from "@utils/db";
import { randomBytes } from "crypto";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ message: "Cannot authorize without token, check if the token is missing, if you think that this is a bug report it to https://github.com/faf4a/themesApi" });
    }

    // turn access code into something useful
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: process.env.AUTH_DISCORD_ID,
            client_secret: process.env.AUTH_DISCORD_SECRET,
            code: code as string,
            grant_type: "authorization_code",
            redirect_uri: "https://themes-delta.vercel.app/api/user/auth",
            scope: "identify"
        }).toString()
    });

    const oauthResponse = await tokenResponse.json();

    // get le discord account info
    const response = await fetch("https://discord.com/api/users/@me", {
        headers: {
            authorization: `${oauthResponse.token_type} ${oauthResponse.access_token}`
        }
    });

    if (!response.ok) {
        return res.status(401).json({ status: 401, message: "Invalid or expired Discord token" });
    }

    const user: User = await response.json();

    const client = await createDatabaseInstance();
    const db = client.db("themesDatabase");
    const users = db.collection("users");

    // this will totally never break lol
    const userEntry = (await users.findOne({ "user.id": user.id }))?.user;

    // shouldnt be null but yeah
    let authKey: string | null;

    if (!userEntry) {
        const uniqueKey = randomBytes(16).toString("hex");

        // create new user entry so they'll never have to reauth UNLESS their vencord datastore goes poof
        await users.insertOne({ user: { id: user.id, key: uniqueKey }, createdAt: new Date() });
        authKey = uniqueKey;
    } else {
        authKey = userEntry.key;
    }

    res.setHeader("Content-Type", "application/json");

    if (!authKey) {
        res.status(500).json({ status: 500, message: "Failed to generate a user token, if you think that this is a bug feel free to open an issue at https://github.com/faf4a/themesApi" });
    } else {
        res.status(200).json({ status: 200, token: authKey });
    }
}
