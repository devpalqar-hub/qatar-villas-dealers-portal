"use client";

import React from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DashboardOverview } from "@/types/dashboard";
import styles from "./DashboardOverviewCards.module.css";

const IconHome = FI.FiHome;
const IconEye = FI.FiEye;
const IconTrendingUp = FI.FiTrendingUp;
const IconUsers = FI.FiUsers;
const IconMessageCircle = FI.FiMessageCircle;
const IconWhatsapp = FI.FiPhoneCall;
const IconMapPin = FI.FiMapPin;
const IconDollarSign = FI.FiDollarSign;

interface DashboardOverviewCardsProps {
    overview: DashboardOverview | null | undefined;
    loading?: boolean;
}

function progressPercent(period: number, total: number): number {
    if (total <= 0) return period > 0 ? 100 : 0;
    return Math.min(100, Math.round((period / total) * 100));
}

export default function DashboardOverviewCards({ overview, loading = false }: DashboardOverviewCardsProps) {
    const t = useTranslations("dashboard.kpi");

    if (loading || !overview) {
        return (
            <div className={styles.grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard} />
                ))}
            </div>
        );
    }

    const { listings, engagement, chats, whatsapp, visits, sales } = overview;

    return (
        <div className={styles.grid}>
            {/* Listings Portfolio */}
            <div className={`${styles.card} ${styles.cardAmber}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("totalListings")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconAmber}`}>
                        <IconHome size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{listings.total}</span>
                </div>
                <div className={styles.tagsRow}>
                    <span className={styles.tagSuccess}>{listings.open} {t("open")}</span>
                    <span className={styles.tagWarning}>{listings.pending} {t("pending")}</span>
                    <span className={styles.tagInfo}>{listings.sold} {t("sold")}</span>
                    <span className={styles.tagDanger}>{listings.rejected} {t("rejected")}</span>
                    {listings.inactive > 0 && (
                        <span className={styles.tagMuted}>{listings.inactive} {t("inactive")}</span>
                    )}
                    {listings.activeFeatured > 0 && (
                        <span className={styles.tagFeatured}>{listings.activeFeatured} {t("featured")}</span>
                    )}
                </div>
            </div>

            {/* Views */}
            <div className={`${styles.card} ${styles.cardSky}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("views")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconSky}`}>
                        <IconTrendingUp size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{engagement.periodViews.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        {engagement.totalViews.toLocaleString()} {t("allTime")}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillSky}
                        style={{ width: `${progressPercent(engagement.periodViews, engagement.totalViews)}%` }}
                    />
                </div>
            </div>

            {/* Impressions */}
            <div className={`${styles.card} ${styles.cardIndigo}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("impressions")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconIndigo}`}>
                        <IconEye size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{engagement.periodImpressions.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        {engagement.totalImpressions.toLocaleString()} {t("allTime")}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillIndigo}
                        style={{
                            width: `${progressPercent(engagement.periodImpressions, engagement.totalImpressions)}%`,
                        }}
                    />
                </div>
            </div>

            {/* Reach */}
            <div className={`${styles.card} ${styles.cardEmerald}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("reach")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconEmerald}`}>
                        <IconUsers size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{engagement.periodReach.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        {engagement.totalReach.toLocaleString()} {t("allTime")}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillEmerald}
                        style={{ width: `${progressPercent(engagement.periodReach, engagement.totalReach)}%` }}
                    />
                </div>
            </div>

            {/* Chats */}
            <div className={`${styles.card} ${styles.cardViolet}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("conversations")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconViolet}`}>
                        <IconMessageCircle size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{chats.periodConversations.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        {chats.totalConversations.toLocaleString()} {t("allTime")}
                    </span>
                </div>
                <div className={styles.tagsRow}>
                    <span className={styles.tagViolet}>
                        {chats.periodUsersStartedChat} {t("chatUsers")}
                    </span>
                </div>
            </div>

            {/* WhatsApp */}
            <div className={`${styles.card} ${styles.cardGreen}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("whatsappClicks")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconGreen}`}>
                        <IconWhatsapp size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{whatsapp.periodClicks.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        {whatsapp.totalClicks.toLocaleString()} {t("allTime")}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillGreen}
                        style={{ width: `${progressPercent(whatsapp.periodClicks, whatsapp.totalClicks)}%` }}
                    />
                </div>
            </div>

            {/* Visits */}
            <div className={`${styles.card} ${styles.cardTeal}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("siteVisits")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconTeal}`}>
                        <IconMapPin size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{visits.period.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>
                        {visits.total.toLocaleString()} {t("allTime")}
                    </span>
                </div>
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFillTeal}
                        style={{ width: `${progressPercent(visits.period, visits.total)}%` }}
                    />
                </div>
            </div>

            {/* Sales */}
            <div className={`${styles.card} ${styles.cardRose}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{t("soldUnits")}</span>
                    <div className={`${styles.iconBadge} ${styles.iconRose}`}>
                        <IconDollarSign size={18} />
                    </div>
                </div>
                <div className={styles.cardValueRow}>
                    <span className={styles.cardValue}>{sales.soldCount.toLocaleString()}</span>
                    <span className={styles.cardSubtext}>{t("soldValue")}</span>
                </div>
                <div className={styles.tagsRow}>
                    <span className={styles.tagRose}>
                        {sales.soldValue.toLocaleString()} QAR
                    </span>
                </div>
            </div>
        </div>
    );
}
