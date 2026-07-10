import { NextRequest, NextResponse } from "next/server";

/**
 * Route protection:
 *
 * - /login, /register     → redirect to /dashboard or /onboarding/plan if already authenticated
 * - /onboarding/*         → redirect to /login if no session; to /dashboard if company exists
 * - /dashboard/*          → redirect to /login if no session; to /onboarding/plan if no company
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const session = request.cookies.get("__session")?.value;
    const claimsRaw = request.cookies.get("__claims")?.value;
    const companyId = (() => {
        try {
            return claimsRaw ? (JSON.parse(claimsRaw) as { companyId?: string }).companyId : undefined;
        } catch {
            return undefined;
        }
    })();

    const isAuthenticated = Boolean(session);
    const hasCompany = Boolean(companyId);

    // ── Auth pages ──────────────────────────────────────────────────────────
    if (pathname === "/login" || pathname === "/register") {
        if (isAuthenticated) {
            const dest = hasCompany ? "/dashboard" : "/onboarding/plan";
            return NextResponse.redirect(new URL(dest, request.url));
        }
        return NextResponse.next();
    }

    // ── Protected pages — require session ───────────────────────────────────
    if (!isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Onboarding — block if company already created ───────────────────────
    if (pathname.startsWith("/onboarding") && hasCompany) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // ── Dashboard — redirect to onboarding if company missing ───────────────
    if (pathname.startsWith("/dashboard") && !hasCompany) {
        return NextResponse.redirect(new URL("/onboarding/plan", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/register", "/onboarding/:path*", "/dashboard/:path*"],
};
