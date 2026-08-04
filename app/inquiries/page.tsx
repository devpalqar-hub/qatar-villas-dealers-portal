"use client";

import React from "react";
import Link from "next/link";
import { FiClipboard } from "react-icons/fi";
import { AppLayout } from "@/components/ui";
import InquiriesSection from "@/components/inquiry/InquiriesSection";
import styles from "./page.module.css";

export default function InquiriesPage() {
    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Breadcrumbs */}
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <span>&gt;</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>Inquiries</span>
                </nav>

                {/* Page Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIconWrap}>
                            <FiClipboard size={22} />
                        </div>
                        <div>
                            <h1 className={styles.title}>Visit Inquiries</h1>
                            <p className={styles.subtitle}>
                                Manage visit requests from potential buyers and renters for your listings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Inquiries Table */}
                <div className={styles.card}>
                    <InquiriesSection />
                </div>
            </div>
        </AppLayout>
    );
}
