"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
    FiHome,
    FiGrid,
    FiUsers,
    FiMessageCircle,
    FiBarChart2,
    FiSettings,
    FiCreditCard,
    FiLogOut,
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

export default function Sidebar() {
    const pathname = usePathname();
    const [showLogout, setShowLogout] = useState(false);

    return (
        <>
            <aside className={styles.sidebar}>
                <h2 className={styles.logo}>Villas Qatar</h2>

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
                        onClick={() => setShowLogout(true)}
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