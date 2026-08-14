export const locales = ["en", "ar"] as const;
export const defaultLocale = "en" as const;

export type AppLocale = (typeof locales)[number];

export const routing = {
    locales,
    defaultLocale
};
