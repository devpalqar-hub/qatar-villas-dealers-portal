"use client";

import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import styles from "./AppLayout.module.css";

interface Props {
    children: React.ReactNode;
}

export default function AppLayout({
    children,
}: Props) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />

            <div className={styles.main}>
                <Navbar
                    onMenuClick={() => setIsMobileSidebarOpen((prev) => !prev)}
                />

                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}