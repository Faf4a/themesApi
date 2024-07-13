import { SignJWT, importJWK } from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).end();
    }

    const secretKey = await importJWK({ kty: "oct", k: Buffer.from(process.env.SECRET_KEY).toString("base64") }, "HS256");

    const { username, password } = req.body;

    const client = await clientPromise;
    const db = client.db("dashboardDatabase");
    const validUsers = db.collection("users");

    const user = await validUsers.findOne({ username, password });

    if (!user) {
        return res.status(401).json({ status: 401, message: "Invalid credentials" });
    }

    const jwt = await new SignJWT({ "urn:example:claim": true }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(secretKey);

    res.setHeader("Set-Cookie", `sessionToken=${jwt}; Path=/; HttpOnly; Max-Age=${2 * 60 * 60}`);

    return res.status(200).json({ username: user.username });
}
