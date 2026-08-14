"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiCalendar, FiHome, FiPercent, FiStar, FiZap } from "react-icons/fi";
import { Button } from "@/components/ui";
import { DealerSubscription, SubscriptionPlan } from "@/types/subscription";
import { SubscriptionLifecycleState } from "@/utils/subscriptionStatus";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";
import styles from "./CurrentSubscriptionCard.module.css";

interface CurrentSubscriptionCardProps {
    subscription: DealerSubscription;
    plan: SubscriptionPlan | null;
    lifecycleState: SubscriptionLifecycleState;
    daysRemaining: number | null;
    plansExpanded: boolean;
    onTogglePlans: () => void;
    onRenew: () => void;
    renewing?: boolean;
}

function EntitlementBar({ label, included, remaining }: { label: string; included: number; remaining: number }) {
    const percent = included > 0 ? Math.min(100, Math.round((remaining / included) * 100)) : 0;
    return (
        <div className={styles.entitlementBlock}>
            <div className={styles.entitlementHeader}>
                <span className={styles.entitlementLabel}>{label}</span>
                <span className={styles.entitlementRemaining}>{remaining}</span>
            </div>
            <div className={styles.entitlementBarBg}>
                <div className={styles.entitlementBarFill} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

export default function CurrentSubscriptionCard({
    subscription,
    plan,
    lifecycleState,
    daysRemaining,
    plansExpanded,
    onTogglePlans,
    onRenew,
    renewing = false,
}: CurrentSubscriptionCardProps) {
    const t = useTranslations("subscription");
    const locale = useLocale();

    const planSummary = subscription.plan;
    const formattedPrice = planSummary.price > 0 ? new Intl.NumberFormat(locale).format(planSummary.price) : t("planCard.free");

    const expiryMessage = () => {
        if (daysRemaining === null) return null;
        if (lifecycleState === "EXPIRED") return t("reminders.expiredMessage");
        if (daysRemaining <= 0) return t("reminders.expiresTomorrow");
        if (daysRemaining === 1) return t("reminders.expiresTomorrow");
        return t("reminders.expiresInDays", { days: daysRemaining });
    };

    const freeListingsIncluded = plan?.freeListings ?? planSummary.freeListings;
    const freeFeaturedIncluded = plan?.freeFeaturedListings ?? planSummary.freeFeaturedListings;
    const freeListingsRemaining = plan?.freeListingsCount ?? 0;
    const freeFeaturedRemaining = plan?.freeFeaturedListingsCount ?? 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>{t("yourCurrentSubscription")}</span>
                    <h2 className={styles.planName}>{planSummary.name}</h2>
                </div>
                <SubscriptionStatusBadge state={lifecycleState} />
            </div>

            <div className={styles.priceRow}>
                <span className={styles.price}>
                    {planSummary.price > 0 ? `${formattedPrice} ${t("planCard.currency")}` : formattedPrice}
                </span>
                <span className={styles.validity}>/ {t("planCard.validity", { days: planSummary.validityDays })}</span>
            </div>

            <div className={styles.metaRow}>
                <FiHome size={14} />
                <span>{t("planCard.maxListings", { count: planSummary.maxListings })}</span>
            </div>

            {expiryMessage() && (
                <div
                    className={`${styles.expiryNote} ${
                        lifecycleState === "EXPIRED"
                            ? styles.expiryNoteDanger
                            : lifecycleState === "EXPIRING_SOON"
                            ? styles.expiryNoteWarning
                            : styles.expiryNoteNeutral
                    }`}
                >
                    <FiCalendar size={14} />
                    <span>{expiryMessage()}</span>
                </div>
            )}

            <div className={styles.entitlementsGrid}>
                <EntitlementBar
                    label={t("freeListingsRemainingLabel", { count: freeListingsIncluded })}
                    included={freeListingsIncluded}
                    remaining={freeListingsRemaining}
                />
                <EntitlementBar
                    label={t("freeFeaturedRemainingLabel", { count: freeFeaturedIncluded })}
                    included={freeFeaturedIncluded}
                    remaining={freeFeaturedRemaining}
                />
            </div>

            {(planSummary.boostDiscountPercent > 0 || planSummary.listingDiscountPercent > 0) && (
                <div className={styles.discountRow}>
                    {planSummary.boostDiscountPercent > 0 && (
                        <span className={styles.discountChip}>
                            <FiZap size={12} /> {t("planCard.boostDiscount", { percent: planSummary.boostDiscountPercent })}
                        </span>
                    )}
                    {planSummary.listingDiscountPercent > 0 && (
                        <span className={styles.discountChip}>
                            <FiPercent size={12} /> {t("planCard.listingDiscount", { percent: planSummary.listingDiscountPercent })}
                        </span>
                    )}
                </div>
            )}

            <div className={styles.actions}>
                {(lifecycleState === "EXPIRING_SOON" || lifecycleState === "EXPIRED") && (
                    <Button onClick={onRenew} loading={renewing} loadingLabel={t("processing")} leftIcon={<FiStar size={14} />}>
                        {t("renewPlan")}
                    </Button>
                )}
                <Button variant="secondary" onClick={onTogglePlans}>
                    {plansExpanded ? t("hidePlans") : t("viewAllPlans")}
                </Button>
            </div>
        </div>
    );
}
