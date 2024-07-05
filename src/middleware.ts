import { NextResponse } from "next/server";

export function middleware(req) {
    if (req.nextUrl.pathname === "/favicon.ico") {
        // explode favicon.ico requests
        return new Response(null, { status: 204 });
    }

    // prevent cors or whatever this is, issues
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200 });
    }

    return NextResponse.next();
}
