import {AppLocale} from "./routing";

export const RTL_LOCALES: AppLocale[] = ["ar"];

export function isRtlLocale(locale: string) {
    return RTL_LOCALES.includes(locale as AppLocale);
}

export function stripLocaleFromPathname(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];

    if (first === "en" || first === "ar") {
        const rest = segments.slice(1).join("/");
        return rest ? `/${rest}` : "/";
    }

    return pathname || "/";
}
