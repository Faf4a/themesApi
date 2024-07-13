import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);
const PROTECTED_ROUTES = ["/dashboard", "/api/manage/update", "/api/manage/delete"];

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    if (url.pathname === "/favicon.ico") {
        return new Response(null, { status: 204 });
    }

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200 });
    }

    if (PROTECTED_ROUTES.some((route) => url.pathname.startsWith(route))) {
        const cookieHeader = req.headers.get("cookie");
        const cookies = cookieHeader ? Object.fromEntries(cookieHeader.split("; ").map((cookie) => cookie.split("="))) : {};

        const sessionToken = cookies["sessionToken"];

        if (!sessionToken) {
            url.pathname = "/";
            return NextResponse.redirect(url);
        }

        try {
            await jwtVerify(sessionToken, SECRET_KEY);
        } catch {
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}
