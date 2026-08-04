"use client";

import {FiBell, FiSearch, FiMenu} from "react-icons/fi";
import {useTranslations} from "next-intl";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher/LanguageSwitcher";
import styles from "./Navbar.module.css";

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({onMenuClick}: NavbarProps) {
    const t = useTranslations("navbar");
    const tCommon = useTranslations("common");

    return (
        <header className={styles.navbar}>
            <div className={styles.left}>
                <button
                    type="button"
                    className={styles.menuBtn}
                    onClick={onMenuClick}
                    aria-label={t("openMenu")}
                >
                    <FiMenu size={22} />
                </button>

                <span className={styles.mobileLogo}>{tCommon("appName")}</span>

                <div className={styles.search}>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        aria-label={tCommon("search")}
                    />
                </div>
            </div>

            <div className={styles.right}>
                <LanguageSwitcher />

                <button className={styles.notification} aria-label={t("notifications")}>
                    <FiBell />
                </button>

                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        F
                    </div>

                    <div className={styles.profileInfo}>
                        <h4>Fayaz</h4>
                        <span>{t("role")}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
