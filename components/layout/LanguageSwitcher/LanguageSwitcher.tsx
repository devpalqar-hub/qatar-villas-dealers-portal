"use client";

import {useMemo} from "react";
import {useLocale} from "next-intl";
import {usePathname, useSearchParams} from "next/navigation";
import styles from "./LanguageSwitcher.module.css";

const SUPPORTED_LOCALES = ["en", "ar"] as const;

function replaceLocale(pathname: string, locale: string) {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as (typeof SUPPORTED_LOCALES)[number])) {
        segments[0] = locale;
        return `/${segments.join("/")}`;
    }

    return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const search = useMemo(() => searchParams.toString(), [searchParams]);

    return (
        <div className={styles.switcher} aria-label={locale === "ar" ? "???? ?????" : "Language switcher"}>
            {SUPPORTED_LOCALES.map((targetLocale, index) => {
                const href = `${replaceLocale(pathname, targetLocale)}${search ? `?${search}` : ""}`;
                const isActive = locale === targetLocale;
                const label = targetLocale === "en" ? "EN" : "AR";
                const fullLabel = targetLocale === "en" ? "English" : "???????";

                return (
                    <span key={targetLocale} className={styles.optionWrap}>
                        <a
                            href={href}
                            className={`${styles.option} ${isActive ? styles.active : ""}`}
                            hrefLang={targetLocale}
                            lang={targetLocale}
                            aria-current={isActive ? "true" : undefined}
                            aria-label={fullLabel}
                        >
                            {label}
                        </a>
                        {index < SUPPORTED_LOCALES.length - 1 && <span className={styles.divider}>|</span>}
                    </span>
                );
            })}
        </div>
    );
}
