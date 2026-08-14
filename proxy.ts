import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const PUBLIC_PATHS = ["/login", "/dealer-onboarding"];

export function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value;

    const isPublic = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
    );

    if (!token && !isPublic) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && isPublic) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"
    ]
};
