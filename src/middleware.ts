import { NextResponse } from "next/server";

export function middleware(req, res) {
    if (req.nextUrl.pathname === "/favicon.ico") {
        // explode favicon.ico requests
        return void res.status(204).end();
    }

    // prevent cors or whatever this is, issues
    if (req.method === "OPTIONS") {
        return void res.status(204).end();
    }

    return NextResponse.next();
}
