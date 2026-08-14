"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DashboardQuotaOverview, DashboardStaffOverview, DashboardSubscriptionOverview } from "@/types/dashboard";
import styles from "./DashboardSidePanels.module.css";

const IconCreditCard = FI.FiCreditCard;
const IconUsers = FI.FiUsers;
const IconGift = FI.FiGift;
const IconStar = FI.FiStar;

interface DashboardSidePanelsProps {
    subscription: DashboardSubscriptionOverview | null | undefined;
    quota: DashboardQuotaOverview | null | undefined;
    staff: DashboardStaffOverview | null | undefined;
    loading?: boolean;
}

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function DashboardSidePanels({
    subscription,
    quota,
    staff,
    loading = false,
}: DashboardSidePanelsProps) {
    const t = useTranslations("dashboard.subscription");
    const tStaff = useTranslations("dashboard.staff");
    const locale = useLocale();

    if (loading || !subscription || !quota || !staff) {
        return (
            <div className={styles.column}>
                <div className={styles.skeleton} />
                <div className={styles.skeletonSmall} />
            </div>
        );
    }

    let elapsedPercent = 0;
    if (subscription.startDate && subscription.endDate) {
        const start = new Date(subscription.startDate).getTime();
        const end = new Date(subscription.endDate).getTime();
        const now = Date.now();
        elapsedPercent = end > start ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100)) : 0;
    }

    const formatDate = (iso: string | null) =>
        iso ? new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }) : "-";

    return (
        <div className={styles.column}>
            {/* Subscription Card */}
            <div className={`${styles.card} ${styles.subscriptionCard}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTitleGroup}>
                        <div className={styles.iconBadge}>
                            <IconCreditCard size={17} />
                        </div>
                        <h3 className={styles.cardTitle}>{t("title")}</h3>
                    </div>
                    {subscription.hasActivePlan && (
                        <span
                            className={`${styles.statusBadge} ${
                                subscription.isExpired ? styles.statusExpired : styles.statusActive
                            }`}
                        >
                            {subscription.isExpired ? t("expired") : t("active")}
                        </span>
                    )}
                </div>

                {!subscription.hasActivePlan ? (
                    <div className={styles.noPlan}>
                        <p className={styles.noPlanTitle}>{t("noPlan")}</p>
                        <p className={styles.noPlanDesc}>{t("noPlanDesc")}</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.planName}>{subscription.planName}</div>

                        {subscription.startDate && subscription.endDate && (
                            <>
                                <div className={styles.progressBarBg}>
                                    <div
                                        className={styles.progressBarFill}
                                        style={{ width: `${elapsedPercent}%` }}
                                    />
                                </div>
                                <div className={styles.dateRow}>
                                    <span>{t("startDate")}: {formatDate(subscription.startDate)}</span>
                                    <span>{t("endDate")}: {formatDate(subscription.endDate)}</span>
                                </div>
                            </>
                        )}

                        <div className={styles.planStatsRow}>
                            {subscription.daysRemaining !== null && (
                                <div className={styles.planStat}>
                                    <span className={styles.planStatValue}>{subscription.daysRemaining}</span>
                                    <span className={styles.planStatLabel}>{t("daysRemaining")}</span>
                                </div>
                            )}
                            <div className={styles.planStat}>
                                <span className={styles.planStatValue}>
                                    {subscription.maxListings > 0 ? subscription.maxListings : t("unlimited")}
                                </span>
                                <span className={styles.planStatLabel}>{t("maxListings")}</span>
                            </div>
                        </div>
                    </>
                )}

                <div className={styles.quotaSection}>
                    <div className={styles.quotaHeader}>
                        <IconGift size={13} />
                        <span>{t("quotaTitle")}</span>
                    </div>
                    <div className={styles.quotaGrid}>
                        <div className={styles.quotaTile}>
                            <span className={styles.quotaValue}>{quota.remainingFreeListings}</span>
                            <span className={styles.quotaLabel}>{t("freeListings")}</span>
                        </div>
                        <div className={styles.quotaTile}>
                            <span className={styles.quotaValue}>{quota.remainingFreeFeatured}</span>
                            <span className={styles.quotaLabel}>{t("freeFeatured")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTitleGroup}>
                        <div className={`${styles.iconBadge} ${styles.iconBadgeTeal}`}>
                            <IconUsers size={17} />
                        </div>
                        <div>
                            <h3 className={styles.cardTitle}>{tStaff("title")}</h3>
                            <p className={styles.cardSubtitle}>
                                {staff.totalStaffMembers} {tStaff("subtitle")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.staffList}>
                    {staff.members.length === 0 ? (
                        <div className={styles.emptyStaff}>{tStaff("empty")}</div>
                    ) : (
                        staff.members.map((member) => (
                            <div key={member.id} className={styles.staffItem}>
                                <div className={styles.staffAvatar}>{initials(member.name) || <IconStar size={14} />}</div>
                                <div className={styles.staffInfo}>
                                    <span className={styles.staffName}>{member.name}</span>
                                    <span className={styles.staffMeta}>{member.position || member.email}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
