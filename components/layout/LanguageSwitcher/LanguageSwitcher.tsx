"use client";

import {useLocale} from "next-intl";
import {useRouter} from "next/navigation";
import {useTransition} from "react";
import styles from "./LanguageSwitcher.module.css";

const SUPPORTED_LOCALES = ["en", "ar"] as const;
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const switchLocale = (targetLocale: (typeof SUPPORTED_LOCALES)[number]) => {
        if (targetLocale === locale) return;

        document.cookie = `${LOCALE_COOKIE_NAME}=${targetLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;

        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <div className={styles.switcher} aria-label={locale === "ar" ? "مبدل اللغة" : "Language switcher"}>
            {SUPPORTED_LOCALES.map((targetLocale, index) => {
                const isActive = locale === targetLocale;
                const label = targetLocale === "en" ? "EN" : "AR";
                const fullLabel = targetLocale === "en" ? "English" : "العربية";

                return (
                    <span key={targetLocale} className={styles.optionWrap}>
                        <button
                            type="button"
                            onClick={() => switchLocale(targetLocale)}
                            className={`${styles.option} ${isActive ? styles.active : ""}`}
                            lang={targetLocale}
                            aria-current={isActive ? "true" : undefined}
                            aria-label={fullLabel}
                            disabled={isPending}
                        >
                            {label}
                        </button>
                        {index < SUPPORTED_LOCALES.length - 1 && <span className={styles.divider}>|</span>}
                    </span>
                );
            })}
        </div>
    );
}
