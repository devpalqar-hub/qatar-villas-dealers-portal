import {cookies} from "next/headers";
import {getRequestConfig} from "next-intl/server";
import {locales, defaultLocale} from "./routing";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    const locale = locales.includes(cookieLocale as (typeof locales)[number])
        ? (cookieLocale as (typeof locales)[number])
        : defaultLocale;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
