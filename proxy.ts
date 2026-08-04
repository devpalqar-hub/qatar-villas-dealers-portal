import createMiddleware from "next-intl/middleware";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {stripLocaleFromPathname} from "@/i18n/config";
import {routing} from "@/i18n/routing";

const PUBLIC_PATHS = ["/login"];
const handleI18nRouting = createMiddleware(routing);

function getLocaleFromPathname(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    const maybeLocale = segments[0];

    return routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
        ? maybeLocale
        : routing.defaultLocale;
}

export function proxy(request: NextRequest) {
    const i18nResponse = handleI18nRouting(request);

    if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
        return i18nResponse;
    }

    const {pathname} = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value;
    const normalizedPath = stripLocaleFromPathname(pathname);
    const locale = getLocaleFromPathname(pathname);

    const isPublic = PUBLIC_PATHS.some(
        (path) => normalizedPath === path || normalizedPath.startsWith(path + "/")
    );

    if (!token && !isPublic) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && isPublic) {
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    return i18nResponse;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"
    ]
};
