"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
    FiHome,
    FiGrid,
    FiUsers,
    FiMessageCircle,
    FiBarChart2,
    FiSettings,
    FiCreditCard,
    FiLogOut,
    FiX,
} from "react-icons/fi";

import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import styles from "./Sidebar.module.css";

const menuItems = [
    { title: "Dashboard",   href: "/dashboard",    icon: FiHome          },
    { title: "Properties",  href: "/properties",   icon: FiGrid          },
    { title: "Staff",       href: "/staff",        icon: FiUsers         },
    { title: "Inquiries",   href: "/inquiries",    icon: FiMessageCircle },
    { title: "Analytics",   href: "/analytics",    icon: FiBarChart2     },
    { title: "Subscription",href: "/subscription", icon: FiCreditCard    },
    { title: "Settings",    href: "/settings",     icon: FiSettings      },
];

function handleLogout() {
    // Clear cookie
    document.cookie = "auth_token=; path=/; max-age=0";
    // Clear localStorage
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [showLogout, setShowLogout] = useState(false);

    // Lock body scroll when mobile drawer is open
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

    return (
        <>
            {/* Backdrop overlay for mobile drawer */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.logo}>Villas Qatar</h2>
                    <button
                        type="button"
                        className={styles.closeMobileBtn}
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.link} ${
                                    pathname === item.href ? styles.active : ""
                                }`}
                                onClick={onClose}
                            >
                                <Icon />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Logout button pinned to the bottom ── */}
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
                        Log out
                    </button>
                </div>
            </aside>

            <ConfirmModal
                open={showLogout}
                intent="danger"
                title="Log out?"
                description="You'll be signed out of your dealer account and returned to the login page."
                confirmLabel="Log out"
                cancelLabel="Stay logged in"
                onConfirm={handleLogout}
                onCancel={() => setShowLogout(false)}
            />
        </>
    );
}