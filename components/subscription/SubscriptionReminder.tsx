"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui";
import { SubscriptionLifecycleState } from "@/utils/subscriptionStatus";
import styles from "./SubscriptionReminder.module.css";

interface SubscriptionReminderProps {
    lifecycleState: SubscriptionLifecycleState;
    daysRemaining: number | null;
    freeListingsIncluded: number;
    freeListingsRemaining: number;
    freeFeaturedListingsIncluded: number;
    freeFeaturedListingsRemaining: number;
    onRenew: () => void;
    onViewPlans: () => void;
}

export default function SubscriptionReminder({
    lifecycleState,
    daysRemaining,
    freeListingsIncluded,
    freeListingsRemaining,
    freeFeaturedListingsIncluded,
    freeFeaturedListingsRemaining,
    onRenew,
    onViewPlans,
}: SubscriptionReminderProps) {
    const t = useTranslations("subscription.reminders");

    if (lifecycleState !== "ACTIVE" && lifecycleState !== "EXPIRING_SOON" && lifecycleState !== "EXPIRED") {
        return null;
    }

    const hasExpiryIssue = lifecycleState === "EXPIRING_SOON" || lifecycleState === "EXPIRED";
    const listingsExhausted = freeListingsIncluded > 0 && freeListingsRemaining === 0;
    const featuredExhausted = freeFeaturedListingsIncluded > 0 && freeFeaturedListingsRemaining === 0;

    if (!hasExpiryIssue && !listingsExhausted && !featuredExhausted) {
        return null;
    }

    const expiryText = () => {
        if (lifecycleState === "EXPIRED") return t("expiredMessage");
        if (daysRemaining === null) return null;
        if (daysRemaining <= 1) return t("expiresTomorrow");
        return t("expiresInDays", { days: daysRemaining });
    };

    const isDanger = lifecycleState === "EXPIRED";

    return (
        <div className={`${styles.banner} ${isDanger ? styles.bannerDanger : styles.bannerWarning}`}>
            <div className={styles.iconWrap}>
                <FiAlertTriangle size={18} />
            </div>

            <div className={styles.content}>
                {hasExpiryIssue && <p className={styles.primaryText}>{expiryText()}</p>}

                {(listingsExhausted || featuredExhausted) && (
                    <div className={styles.entitlementLines}>
                        {listingsExhausted && <span>{t("listingsExhausted")}</span>}
                        {featuredExhausted && <span>{t("featuredExhausted")}</span>}
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                {hasExpiryIssue && (
                    <Button size="sm" onClick={onRenew}>
                        {t("renewPlan")}
                    </Button>
                )}
                <Button size="sm" variant="secondary" onClick={onViewPlans}>
                    {t("viewPlans")}
                </Button>
            </div>
        </div>
    );
}
