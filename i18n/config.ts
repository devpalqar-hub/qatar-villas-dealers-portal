import {AppLocale} from "./routing";

export const RTL_LOCALES: AppLocale[] = ["ar"];

export function isRtlLocale(locale: string) {
    return RTL_LOCALES.includes(locale as AppLocale);
}
