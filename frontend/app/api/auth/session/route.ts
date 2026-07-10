import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../shared/infrastructure/config/firebase.admin";

/** POST /api/auth/session — verify ID token and set httpOnly session cookies */
export async function POST(request: NextRequest) {
    try {
        const { idToken } = (await request.json()) as { idToken: string };

        if (!idToken) {
            return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
        }

        const decoded = await adminAuth.verifyIdToken(idToken);
        const companyId = (decoded.companyId as string | undefined) ?? null;

        const res = NextResponse.json({ success: true });
        const cookieOpts = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            // 7 days — Firebase ID tokens expire in 1h but are refreshed automatically
            maxAge: 60 * 60 * 24 * 7,
        };

        // Session token (used for firebase-admin verification in server components)
        res.cookies.set("__session", idToken, cookieOpts);

        // Claims cache (read by Edge middleware without firebase-admin)
        res.cookies.set(
            "__claims",
            JSON.stringify({ companyId }),
            cookieOpts
        );

        return res;
    } catch (error) {
        console.error("Session creation failed:", error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}

/** DELETE /api/auth/session — clear session cookies on sign-out */
export async function DELETE() {
    const res = NextResponse.json({ success: true });
    res.cookies.delete("__session");
    res.cookies.delete("__claims");
    return res;
}
