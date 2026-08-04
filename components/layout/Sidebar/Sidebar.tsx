"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiHome, FiGrid, FiUsers, FiMessageCircle, FiBarChart2, FiSettings, FiCreditCard, FiLogOut, FiX } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import { Link } from "@/i18n/navigation";
import { stripLocaleFromPathname } from "@/i18n/config";
import styles from "./Sidebar.module.css";
import Image from "next/image";

const menuItems = [
    { titleKey: "dashboard", href: "/dashboard", icon: FiHome },
    { titleKey: "properties", href: "/properties", icon: FiGrid },
    { titleKey: "staff", href: "/staff", icon: FiUsers },
    { titleKey: "inquiries", href: "/inquiries", icon: FiMessageCircle },
    { titleKey: "analytics", href: "/analytics", icon: FiBarChart2 },
    { titleKey: "subscription", href: "/subscription", icon: FiCreditCard },
    { titleKey: "chat", href: "/chat", icon: FiMessageCircle },
    { titleKey: "settings", href: "/settings", icon: FiSettings }
] as const;

function isActivePath(currentPathname: string, href: string) {
    const normalized = stripLocaleFromPathname(currentPathname);
    return href === "/dashboard" ? normalized === "/dashboard" || normalized === "/" : normalized === href;
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const t = useTranslations("sidebar");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const pathname = usePathname();
    const [showLogout, setShowLogout] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; max-age=0";
        localStorage.removeItem("auth_token");
        window.location.href = `/${locale}/login`;
    };

    return (
        <>
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src="/villasLogo.png"
                            alt="Villas Qatar"
                            width={56}
                            height={56}
                            priority
                        />
                        <h2 className={styles.logo}>{tCommon("appName")}</h2>
                    </div>

                    <button
                        type="button"
                        className={styles.closeMobileBtn}
                        onClick={onClose}
                        aria-label={t("closeMenu")}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActivePath(pathname, item.href);
                        const href = item.href === "/dashboard" ? "/" : item.href;

                        return (
                            <Link
                                key={item.href}
                                href={href}
                                className={`${styles.link} ${active ? styles.active : ""}`}
                                onClick={onClose}
                            >
                                <Icon />
                                {t(item.titleKey)}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.footer}>
                    <button
                        className={styles.logoutBtn}
                        onClick={() => {
                            if (onClose) onClose();
                            setShowLogout(true);
                        }}
                        type="button"
                        id="sidebar-logout-btn"
                    >
                        <FiLogOut />
                        {t("logout")}
                    </button>
                </div>
            </aside>

            <ConfirmModal
                open={showLogout}
                intent="danger"
                title={t("logoutTitle")}
                description={t("logoutDescription")}
                confirmLabel={t("logout")}
                cancelLabel={t("stayLoggedIn")}
                onConfirm={handleLogout}
                onCancel={() => setShowLogout(false)}
            />
        </>
    );
}
