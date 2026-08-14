"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/ui";
import {
    CurrentSubscriptionCard,
    SubscriptionHistory,
    SubscriptionPlanGrid,
    SubscriptionReminder,
} from "@/components/subscription";
import { useSubscriptionEntitlements } from "@/hooks/useSubscriptionEntitlements";
import { subscriptionService } from "@/services/subscription.service";
import { SubscriptionPlan } from "@/types/subscription";
import styles from "./page.module.css";

export default function SubscriptionsPage() {
    const t = useTranslations("subscription");
    const entitlements = useSubscriptionEntitlements();
    const [plansExpanded, setPlansExpanded] = useState(false);
    const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const {
        loading,
        error,
        subscriptions,
        currentSubscription,
        currentPlan,
        lifecycleState,
        daysRemaining,
        freeListingsIncluded,
        freeFeaturedListingsIncluded,
    } = entitlements;

    const showCurrentSubscription = !!currentSubscription && lifecycleState !== "NONE";

    const handleCheckoutById = async (planId: string) => {
        if (checkoutPlanId) return;
        setCheckoutError(null);
        setCheckoutPlanId(planId);
        try {
            const res = await subscriptionService.checkout(planId);
            if (res.url) {
                window.location.href = res.url;
                return;
            }
            setCheckoutError(t("errors.checkoutFailed"));
            setCheckoutPlanId(null);
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string } } };
            setCheckoutError(serviceError?.response?.data?.message || t("errors.checkoutFailed"));
            setCheckoutPlanId(null);
        }
    };

    const handleCheckout = (plan: SubscriptionPlan) => handleCheckoutById(plan.id);

    const ctaLabelForPlan = (plan: SubscriptionPlan, isCurrentPlan: boolean) => {
        if (isCurrentPlan) {
            return lifecycleState === "EXPIRING_SOON" || lifecycleState === "EXPIRED"
                ? t("renewPlan")
                : t("planCard.currentPlan");
        }
        return undefined;
    };

    // An already-active current plan can't be re-purchased; it can only be renewed once it's
    // expiring or expired (handled by the CTA label above).
    const ctaDisabledForPlan = (plan: SubscriptionPlan, isCurrentPlan: boolean) =>
        isCurrentPlan && lifecycleState === "ACTIVE";

    return (
        <AppLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t("pageTitle")}</h1>
                    <p className={styles.subtitle}>
                        {showCurrentSubscription ? t("pageSubtitleActive") : t("pageSubtitle")}
                    </p>
                </div>

                {loading ? (
                    <div className={styles.loadingCard} />
                ) : error ? (
                    <div className={styles.errorBanner}>{error}</div>
                ) : (
                    <>
                        {showCurrentSubscription && currentSubscription && (
                            <>
                                <SubscriptionReminder
                                    lifecycleState={lifecycleState}
                                    daysRemaining={daysRemaining}
                                    freeListingsIncluded={freeListingsIncluded}
                                    freeListingsRemaining={currentPlan?.freeListingsCount ?? 0}
                                    freeFeaturedListingsIncluded={freeFeaturedListingsIncluded}
                                    freeFeaturedListingsRemaining={currentPlan?.freeFeaturedListingsCount ?? 0}
                                    onRenew={() => handleCheckoutById(currentSubscription.planId)}
                                    onViewPlans={() => setPlansExpanded(true)}
                                />

                                <CurrentSubscriptionCard
                                    subscription={currentSubscription}
                                    plan={currentPlan}
                                    lifecycleState={lifecycleState}
                                    daysRemaining={daysRemaining}
                                    plansExpanded={plansExpanded}
                                    onTogglePlans={() => setPlansExpanded((v) => !v)}
                                    onRenew={() => handleCheckoutById(currentSubscription.planId)}
                                    renewing={checkoutPlanId === currentSubscription.planId}
                                />
                            </>
                        )}

                        {(!showCurrentSubscription || plansExpanded) && (
                            <div className={styles.plansSection}>
                                <h2 className={styles.sectionTitle}>
                                    {showCurrentSubscription ? t("availablePlans") : t("choosePlanTitle")}
                                </h2>
                                {!showCurrentSubscription && (
                                    <p className={styles.sectionSubtitle}>{t("choosePlanSubtitle")}</p>
                                )}

                                {checkoutError && <div className={styles.errorBanner}>{checkoutError}</div>}

                                <SubscriptionPlanGrid
                                    currentPlanId={currentSubscription?.planId}
                                    selectingPlanId={checkoutPlanId}
                                    onSelectPlan={handleCheckout}
                                    ctaLabelForPlan={ctaLabelForPlan}
                                    ctaDisabledForPlan={ctaDisabledForPlan}
                                />
                            </div>
                        )}

                        <SubscriptionHistory subscriptions={subscriptions} loading={loading} />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
