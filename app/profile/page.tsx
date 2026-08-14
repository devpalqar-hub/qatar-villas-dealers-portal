"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiCalendar,
    FiUsers,
    FiHome,
    FiTrendingUp,
    FiAward,
    FiShield,
    FiCheckCircle,
    FiFileText,
    FiHash,
    FiGift,
    FiAlertTriangle,
    FiArrowRight,
    FiGlobe,
    FiUser,
} from "react-icons/fi";
import { FaFacebookF, FaYoutube, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { AppLayout, Badge, Button } from "@/components/ui";
import { profileService } from "@/services/profile.service";
import { DealerProfile } from "@/types/profile";
import styles from "./page.module.css";

const SOCIAL_LINKS: {
    key: keyof DealerProfile["links"];
    icon: React.ReactNode;
    labelKey: string;
    className: string;
}[] = [
    { key: "website", icon: <FiGlobe size={16} />, labelKey: "links.website", className: "linkWebsite" },
    { key: "whatsapp", icon: <FaWhatsapp size={16} />, labelKey: "links.whatsapp", className: "linkWhatsapp" },
    { key: "facebook", icon: <FaFacebookF size={15} />, labelKey: "links.facebook", className: "linkFacebook" },
    { key: "instagram", icon: <FaInstagram size={16} />, labelKey: "links.instagram", className: "linkInstagram" },
    { key: "youtube", icon: <FaYoutube size={16} />, labelKey: "links.youtube", className: "linkYoutube" },
];

function initialsOf(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function ProfilePage() {
    const t = useTranslations("profile");
    const locale = useLocale();

    const [profile, setProfile] = useState<DealerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await profileService.getMyProfile();
            setProfile(data);
        } catch {
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);

    const formatDate = (iso: string | null) =>
        iso ? new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }) : "—";

    if (loading) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={styles.skeletonCover} />
                    <div className={styles.skeletonGrid}>
                        <div className={styles.skeletonCard} />
                        <div className={styles.skeletonCard} />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error || !profile) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={styles.stateBox}>
                        <FiAlertTriangle size={28} />
                        <p>{error || t("loadError")}</p>
                        <Button variant="secondary" onClick={fetchProfile}>
                            {t("retry")}
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const { plan, quota, stats, links } = profile;
    const activeLinks = SOCIAL_LINKS.filter((item) => !!links[item.key]);
    const planBadgeVariant = !plan.hasActivePlan ? "default" : plan.isExpired ? "danger" : "success";
    const planBadgeLabel = !plan.hasActivePlan
        ? t("plan.noPlanBadge")
        : plan.isExpired
        ? t("plan.expired")
        : t("plan.active");

    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Hero / Cover */}
                <div className={styles.hero}>
                    <div className={styles.coverWrapper}>
                        {profile.coverImage ? (
                            <img src={profile.coverImage} alt="" className={styles.coverImage} />
                        ) : (
                            <div className={styles.coverFallback} />
                        )}
                        <div className={styles.coverOverlay} />
                    </div>

                    <div className={styles.heroContent}>
                        <div className={styles.logoWrapper}>
                            {profile.logoImage ? (
                                <img src={profile.logoImage} alt={profile.dealerName} className={styles.logoImage} />
                            ) : (
                                <div className={styles.logoFallback}>{initialsOf(profile.dealerName || profile.name)}</div>
                            )}
                        </div>

                        <div className={styles.heroInfo}>
                            <div className={styles.heroTitleRow}>
                                <h1 className={styles.dealerName}>{profile.dealerName || profile.name}</h1>
                                <Badge variant={profile.isActive ? "success" : "danger"}>
                                    {profile.isActive ? t("accountActive") : t("accountInactive")}
                                </Badge>
                            </div>
                            {profile.tagline && <p className={styles.tagline}>{profile.tagline}</p>}
                            <div className={styles.memberSince}>
                                <FiCalendar size={13} />
                                <span>{t("memberSince", { date: formatDate(profile.memberSince) })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                            <FiTrendingUp size={18} />
                        </div>
                        <div>
                            <span className={styles.statValue}>{stats.soldPropertiesCount}</span>
                            <span className={styles.statLabel}>{t("stats.soldProperties")}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                            <FiHome size={18} />
                        </div>
                        <div>
                            <span className={styles.statValue}>{stats.activePropertiesCount}</span>
                            <span className={styles.statLabel}>{t("stats.activeProperties")}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                            <FiUsers size={18} />
                        </div>
                        <div>
                            <span className={styles.statValue}>{stats.staffCount}</span>
                            <span className={styles.statLabel}>{t("stats.staffMembers")}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.mainGrid}>
                    {/* Main column */}
                    <div className={styles.mainColumn}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                <FiUser size={16} /> {t("about")}
                            </h2>
                            <p className={styles.description}>
                                {profile.description?.trim() ? profile.description : t("noDescription")}
                            </p>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                <FiMail size={16} /> {t("contactInfo")}
                            </h2>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoIcon}>
                                        <FiUser size={14} />
                                    </span>
                                    <div>
                                        <span className={styles.infoLabel}>{t("fields.contactName")}</span>
                                        <span className={styles.infoValue}>{profile.name || "—"}</span>
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoIcon}>
                                        <FiMail size={14} />
                                    </span>
                                    <div>
                                        <span className={styles.infoLabel}>{t("fields.email")}</span>
                                        <span className={styles.infoValue}>{profile.email || "—"}</span>
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoIcon}>
                                        <FiPhone size={14} />
                                    </span>
                                    <div>
                                        <span className={styles.infoLabel}>{t("fields.phone")}</span>
                                        <span className={styles.infoValue}>{profile.phone || "—"}</span>
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoIcon}>
                                        <FiPhone size={14} />
                                    </span>
                                    <div>
                                        <span className={styles.infoLabel}>{t("fields.contactPhone")}</span>
                                        <span className={styles.infoValue}>{profile.contactPhone || "—"}</span>
                                    </div>
                                </div>
                                <div className={`${styles.infoRow} ${styles.infoRowWide}`}>
                                    <span className={styles.infoIcon}>
                                        <FiMapPin size={14} />
                                    </span>
                                    <div>
                                        <span className={styles.infoLabel}>{t("fields.address")}</span>
                                        <span className={styles.infoValue}>
                                            {[profile.address, profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                <FiFileText size={16} /> {t("businessDetails")}
                            </h2>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoIcon}>
                                        <FiHash size={14} />
                                    </span>
                                    <div>
                                        <span className={styles.infoLabel}>{t("fields.tradeNumber")}</span>
                                        <span className={styles.infoValue}>{profile.tradeNumber?.trim() || t("notProvided")}</span>
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoIcon}>
                                        <FiShield size={14} />
                                    </span>
                                    <div>
                                        <span className={styles.infoLabel}>{t("fields.reraNumber")}</span>
                                        <span className={styles.infoValue}>{profile.reraNumber?.trim() || t("notProvided")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {activeLinks.length > 0 && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <FiGlobe size={16} /> {t("links.title")}
                                </h2>
                                <div className={styles.linksRow}>
                                    {activeLinks.map((item) => (
                                        <a
                                            key={item.key}
                                            href={links[item.key] as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${styles.linkChip} ${styles[item.className]}`}
                                        >
                                            {item.icon}
                                            <span>{t(item.labelKey)}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar column */}
                    <div className={styles.sideColumn}>
                        <div className={`${styles.card} ${styles.planCard}`}>
                            <div className={styles.planHeader}>
                                <h2 className={styles.cardTitle}>
                                    <FiAward size={16} /> {t("plan.title")}
                                </h2>
                                <Badge variant={planBadgeVariant}>{planBadgeLabel}</Badge>
                            </div>

                            {plan.hasActivePlan ? (
                                <>
                                    <div className={styles.planName}>{plan.planName}</div>

                                    <div className={styles.planMetaRow}>
                                        <FiHome size={13} />
                                        <span>{t("plan.maxListings", { count: plan.maxListings })}</span>
                                    </div>

                                    <div className={styles.planStatsGrid}>
                                        <div className={styles.planStat}>
                                            <span className={styles.planStatValue}>{plan.listingDiscountPercent}%</span>
                                            <span className={styles.planStatLabel}>{t("plan.listingDiscount")}</span>
                                        </div>
                                        <div className={styles.planStat}>
                                            <span className={styles.planStatValue}>{plan.featuringDiscountPercent}%</span>
                                            <span className={styles.planStatLabel}>{t("plan.featuringDiscount")}</span>
                                        </div>
                                        {plan.daysRemaining !== null && (
                                            <div className={styles.planStat}>
                                                <span className={styles.planStatValue}>{Math.max(0, plan.daysRemaining)}</span>
                                                <span className={styles.planStatLabel}>{t("plan.daysRemaining")}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.planDates}>
                                        <span>{t("plan.startedOn", { date: formatDate(plan.startDate) })}</span>
                                        <span>{t("plan.expiresOn", { date: formatDate(plan.endDate) })}</span>
                                    </div>
                                </>
                            ) : (
                                <p className={styles.noPlanText}>{t("plan.noPlanDesc")}</p>
                            )}

                            <Link href="/subscription" className={styles.planCta}>
                                {t("plan.manage")} <FiArrowRight size={14} />
                            </Link>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                <FiGift size={16} /> {t("quota.title")}
                            </h2>
                            <div className={styles.quotaGrid}>
                                <div className={styles.quotaTile}>
                                    <span className={styles.quotaValue}>{quota.remainingFreeListings}</span>
                                    <span className={styles.quotaLabel}>{t("quota.freeListings")}</span>
                                </div>
                                <div className={styles.quotaTile}>
                                    <span className={styles.quotaValue}>{quota.remainingFreeFeatured}</span>
                                    <span className={styles.quotaLabel}>{t("quota.freeFeatured")}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                <FiCheckCircle size={16} /> {t("accountStatus")}
                            </h2>
                            <div className={styles.statusRow}>
                                <span className={styles.statusLabel}>{t("fields.status")}</span>
                                <Badge variant={profile.isActive ? "success" : "danger"}>
                                    {profile.isActive ? t("accountActive") : t("accountInactive")}
                                </Badge>
                            </div>
                            <div className={styles.statusRow}>
                                <span className={styles.statusLabel}>{t("memberSinceLabel")}</span>
                                <span className={styles.statusValue}>{formatDate(profile.memberSince)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
