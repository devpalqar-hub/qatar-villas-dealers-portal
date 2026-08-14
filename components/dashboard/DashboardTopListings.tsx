"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DashboardTopListing } from "@/types/dashboard";
import styles from "./DashboardTopListings.module.css";

const IconAward = FI.FiAward;
const IconArrowUpRight = FI.FiArrowUpRight;

type MetricKey = "viewsCount" | "reachCount" | "conversationsCount" | "visitsCount" | "whatsappClicksCount";

interface DashboardTopListingsProps {
    listings: DashboardTopListing[];
    loading?: boolean;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
    ACTIVE: "success",
    PENDING: "warning",
    RESUBMITED: "warning",
    PENDING_PAYMENT: "warning",
    REJECTED: "danger",
    SOLD: "info",
    INACTIVE: "default",
};

export default function DashboardTopListings({ listings, loading = false }: DashboardTopListingsProps) {
    const t = useTranslations("dashboard.topListings");
    const tStatus = useTranslations("statusEnum");
    const tPurpose = useTranslations("purposeEnum");
    const [metric, setMetric] = useState<MetricKey>("viewsCount");

    const METRIC_TABS: { key: MetricKey; label: string }[] = [
        { key: "viewsCount", label: t("metricViews") },
        { key: "reachCount", label: t("metricReach") },
        { key: "conversationsCount", label: t("metricConversations") },
        { key: "visitsCount", label: t("metricVisits") },
        { key: "whatsappClicksCount", label: t("metricWhatsapp") },
    ];

    const sorted = useMemo(
        () => [...(listings || [])].sort((a, b) => b[metric] - a[metric]),
        [listings, metric]
    );

    const maxValue = Math.max(1, ...sorted.map((l) => l[metric]));

    if (loading) {
        return <div className={styles.skeleton} />;
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.headerTitleGroup}>
                    <div className={styles.iconBadge}>
                        <IconAward size={18} />
                    </div>
                    <div>
                        <h3 className={styles.cardTitle}>{t("title")}</h3>
                        <p className={styles.cardSubtitle}>{t("subtitle")}</p>
                    </div>
                </div>

                <div className={styles.tabsGroup}>
                    {METRIC_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`${styles.tabBtn} ${metric === tab.key ? styles.tabActive : ""}`}
                            onClick={() => setMetric(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.list}>
                {sorted.length === 0 ? (
                    <div className={styles.emptyState}>{t("empty")}</div>
                ) : (
                    sorted.slice(0, 5).map((listing, index) => {
                        const value = listing[metric];
                        const percent = Math.min(100, Math.max(value > 0 ? 6 : 0, Math.round((value / maxValue) * 100)));
                        const variant = STATUS_VARIANT[listing.status] || "default";

                        return (
                            <Link
                                key={listing.id}
                                href={`/properties/${listing.id}`}
                                className={styles.listItem}
                            >
                                <div className={styles.rank}>#{index + 1}</div>

                                <div className={styles.itemMain}>
                                    <div className={styles.itemTop}>
                                        <span className={styles.propertyName}>{listing.propertyName}</span>
                                        <span className={`${styles.statusPill} ${styles[variant]}`}>
                                            {tStatus(listing.status)}
                                        </span>
                                    </div>
                                    <div className={styles.itemMeta}>
                                        <span>{listing.type?.title}</span>
                                        <span className={styles.metaDot}>&bull;</span>
                                        <span>{tPurpose(listing.purpose)}</span>
                                        <span className={styles.metaDot}>&bull;</span>
                                        <span>{t("reference")}: {listing.referenceCode}</span>
                                        <span className={styles.metaDot}>&bull;</span>
                                        <span className={styles.priceText}>{listing.price.toLocaleString()} QAR</span>
                                    </div>
                                    <div className={styles.barTrackRow}>
                                        <div className={styles.barTrack}>
                                            <div className={styles.barFill} style={{ width: `${percent}%` }} />
                                        </div>
                                        <span className={styles.barValue}>{value.toLocaleString()}</span>
                                    </div>
                                </div>

                                <IconArrowUpRight className={styles.linkIcon} size={16} />
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
