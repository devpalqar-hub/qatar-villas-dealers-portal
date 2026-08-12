"use client";

import React from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DealerAnalyticsOverview } from "@/types/analytics";
import styles from "./AnalyticsOverviewCards.module.css";

const IconEye = FI.FiEye;
const IconTrendingUp = FI.FiTrendingUp;
const IconUsers = FI.FiUsers;
const IconHome = FI.FiHome;
const IconMessageCircle = FI.FiMessageCircle;
const IconUserCheck = FI.FiUserCheck;

interface AnalyticsOverviewCardsProps {
    overview: DealerAnalyticsOverview;
    loading?: boolean;
}

export default function AnalyticsOverviewCards({
    overview,
    loading = false,
}: AnalyticsOverviewCardsProps) {
    const t = useTranslations("analyticsPage.metrics");

    if (loading) {
        return (
            <div className={styles.grid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={styles.skeletonCard} />
                ))}
            </div>
        );
    }

    const {
        totalListings = 0,
        activeListings = 0,
        pendingListings = 0,
        soldListings = 0,
        activeFeaturedListings = 0,
        totalViews = 0,
        totalImpressions = 0,
        totalReach = 0,
        periodViews = 0,
        periodImpressions = 0,
        periodReach = 0,
        totalStaffMembers = 0,
        totalVisitsCount = 0,
        totalConversationsCount = 0,
    } = overview || {};

    const overallEngagement = totalVisitsCount + totalConversationsCount;

    return (
        <div className={styles.grid}>
            {/* 1. Total Impressions */}
            <div className={`${styles.card} ${styles.cardIndigo}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("totalImpressions")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconIndigo}`}>
                        <IconEye size={20} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{periodImpressions.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        Total: {totalImpressions.toLocaleString()}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillIndigo}
                        style={{
                            width: `${Math.min(
                                100,
                                totalImpressions > 0
                                    ? Math.round((periodImpressions / totalImpressions) * 100)
                                    : 100
                            )}%`,
                        }}
                    />
                </div>
            </div>

            {/* 2. Total Views */}
            <div className={`${styles.card} ${styles.cardSky}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("totalViews")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconSky}`}>
                        <IconTrendingUp size={20} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{periodViews.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        Total: {totalViews.toLocaleString()}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillSky}
                        style={{
                            width: `${Math.min(
                                100,
                                totalViews > 0
                                    ? Math.round((periodViews / totalViews) * 100)
                                    : 100
                            )}%`,
                        }}
                    />
                </div>
            </div>

            {/* 3. Total Reach */}
            <div className={`${styles.card} ${styles.cardEmerald}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("totalReach")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconEmerald}`}>
                        <IconUsers size={20} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{periodReach.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        Total: {totalReach.toLocaleString()}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillEmerald}
                        style={{
                            width: `${Math.min(
                                100,
                                totalReach > 0
                                    ? Math.round((periodReach / totalReach) * 100)
                                    : 100
                            )}%`,
                        }}
                    />
                </div>
            </div>

            {/* 4. Listings Portfolio */}
            <div className={`${styles.card} ${styles.cardAmber}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("totalListings")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconAmber}`}>
                        <IconHome size={20} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{totalListings}</span>
                    <span className={styles.cardSubtext}>Listings</span>
                </div>
                <div className={styles.tagsRow}>
                    <span className={styles.tagActive}>{activeListings} Active</span>
                    <span className={styles.tagPending}>{pendingListings} Pending</span>
                    <span className={styles.tagSold}>{soldListings} Sold</span>
                    {activeFeaturedListings > 0 && (
                        <span className={styles.tagFeatured}>
                            {activeFeaturedListings} Featured
                        </span>
                    )}
                </div>
            </div>

            {/* 5. Lead Engagement */}
            <div className={`${styles.card} ${styles.cardViolet}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("leadEngagement")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconViolet}`}>
                        <IconMessageCircle size={20} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{overallEngagement}</span>
                    <span className={styles.cardSubtext}>Inquiries & Visits</span>
                </div>
                <div className={styles.tagsRow}>
                    <span className={styles.tagViolet}>
                        {totalVisitsCount} Site Visits
                    </span>
                    <span className={styles.tagViolet}>
                        {totalConversationsCount} Chats
                    </span>
                </div>
            </div>

            {/* 6. Team Capacity */}
            <div className={`${styles.card} ${styles.cardTeal}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("teamCapacity")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconTeal}`}>
                        <IconUserCheck size={20} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{totalStaffMembers}</span>
                    <span className={styles.cardSubtext}>Staff Members</span>
                </div>
                <div className={styles.tagsRow}>
                    <span className={styles.tagTeal}>Active Dealer Workspace</span>
                </div>
            </div>
        </div>
    );
}
