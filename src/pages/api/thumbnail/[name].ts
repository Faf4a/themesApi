import { readdir, readFile } from "fs/promises";
import { extname, join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";

// out of scope so this only runs once per instance
const directory = join(process.cwd(), "public", "thumbnails");
const invalidPreview = join(directory, "not-found/image.png");

// allowed theme preview formats
const mimeTypes = {
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp"
};

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }
    
    const { name } = req.query as { name: string };
    const decodedName = decodeURIComponent(name);

    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=360");

    try {
        const files = await readdir(directory);
        const file = files.find((file) => file.startsWith(decodedName));

        if (!file) { 
            res.setHeader("Content-Type", "image/png");
            return res.status(404).end(await readFile(invalidPreview));
        }

        const filePath = join(directory, file);
        const data = await readFile(filePath);

        const ext = extname(file);
        const mimeType = mimeTypes[ext];

        if (!mimeType) return res.status(500).send({ status: 500, message: "Invalid file format, please report this via https://github.com/faf4a/themesApi" });

        res.setHeader("Content-Type", mimeType);
        res.status(200).end(data);
    } catch (err) {
        res.setHeader("Content-Type", "image/png");
        res.status(404).end(await readFile(invalidPreview));
    }
}
