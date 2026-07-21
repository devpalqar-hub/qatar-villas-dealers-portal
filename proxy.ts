import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value;

    const isPublic = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
    );

    // Not logged in and trying to access a protected page → send to login
    if (!token && !isPublic) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Already logged in and trying to access login → send to home
    if (token && isPublic) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image  (image optimisation)
         * - favicon.ico, sitemap.xml, robots.txt
         * - public assets (images, fonts, etc.)
         */
        "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
    ],
};
