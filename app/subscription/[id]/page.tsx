"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FiArrowLeft, FiAlertTriangle, FiHome, FiCalendar, FiZap, FiPercent, FiGift } from "react-icons/fi";
import { AppLayout, Button } from "@/components/ui";
import { SubscriptionStatusBadge } from "@/components/subscription";
import { useSubscriptionEntitlements } from "@/hooks/useSubscriptionEntitlements";
import { subscriptionService } from "@/services/subscription.service";
import { SubscriptionPlan } from "@/types/subscription";
import { getSubscriptionLifecycleState } from "@/utils/subscriptionStatus";
import styles from "./page.module.css";

export default function SubscriptionDetailPage() {
    const params = useParams();
    const planId = (params?.id as string) || "";
    const t = useTranslations("subscription");
    const tDetail = useTranslations("subscription.detail");
    const locale = useLocale();

    const entitlements = useSubscriptionEntitlements();
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const fetchPlan = useCallback(async () => {
        if (!planId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await subscriptionService.getPlanById(planId);
            setPlan(data);
        } catch {
            setError(tDetail("loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [planId, tDetail]);

    useEffect(() => {
        void fetchPlan();
    }, [fetchPlan]);

    const isCurrentPlan = entitlements.currentSubscription?.planId === planId;
    const lifecycleState = isCurrentPlan
        ? getSubscriptionLifecycleState(entitlements.currentSubscription)
        : "NONE";

    const handleCheckout = async () => {
        if (checkingOut) return;
        setCheckoutError(null);
        setCheckingOut(true);
        try {
            const res = await subscriptionService.checkout(planId);
            if (res.url) {
                window.location.href = res.url;
                return;
            }
            setCheckoutError(t("errors.checkoutFailed"));
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string } } };
            setCheckoutError(serviceError?.response?.data?.message || t("errors.checkoutFailed"));
        } finally {
            setCheckingOut(false);
        }
    };

    const formattedPrice = plan && plan.price > 0 ? new Intl.NumberFormat(locale).format(plan.price) : null;
    const showRemainingEntitlements =
        isCurrentPlan &&
        plan &&
        (plan.freeListingsCount !== undefined || plan.freeFeaturedListingsCount !== undefined);

    const ctaLabel = () => {
        if (!isCurrentPlan) return t("planCard.choosePlan");
        if (lifecycleState === "EXPIRING_SOON" || lifecycleState === "EXPIRED") return t("renewPlan");
        return t("planCard.currentPlan");
    };

    const ctaDisabled = isCurrentPlan && lifecycleState === "ACTIVE";

    return (
        <AppLayout>
            <div className={styles.container}>
                <Link href="/subscription" className={styles.backBtn}>
                    <FiArrowLeft size={16} /> {tDetail("backToPlans")}
                </Link>

                {loading ? (
                    <div className={styles.loadingCard} />
                ) : error || !plan ? (
                    <div className={styles.stateBox}>
                        <FiAlertTriangle size={28} />
                        <p>{error || tDetail("notFound")}</p>
                        <Button variant="secondary" onClick={fetchPlan}>
                            {t("retry")}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <div>
                                <h1 className={styles.planName}>{plan.name}</h1>
                                {isCurrentPlan && <SubscriptionStatusBadge state={lifecycleState} />}
                            </div>

                            <div className={styles.priceBlock}>
                                <span className={styles.price}>
                                    {formattedPrice ? `${formattedPrice} ${t("planCard.currency")}` : t("planCard.free")}
                                </span>
                                <span className={styles.validity}>/ {t("planCard.validity", { days: plan.validityDays })}</span>
                            </div>
                        </div>

                        {checkoutError && <div className={styles.errorBanner}>{checkoutError}</div>}

                        <div className={styles.sectionsGrid}>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>{tDetail("planOverview")}</h2>
                                <div className={styles.overviewRow}>
                                    <FiHome size={16} />
                                    <span>{t("planCard.maxListings", { count: plan.maxListings })}</span>
                                </div>
                                <div className={styles.overviewRow}>
                                    <FiCalendar size={16} />
                                    <span>{t("planCard.validity", { days: plan.validityDays })}</span>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>{tDetail("benefits")}</h2>
                                <ul className={styles.benefitsList}>
                                    <li>
                                        <FiHome size={14} /> {t("planCard.maxListings", { count: plan.maxListings })}
                                    </li>
                                    {plan.freeListings > 0 && (
                                        <li>
                                            <FiGift size={14} /> {t("planCard.freeListings", { count: plan.freeListings })}
                                        </li>
                                    )}
                                    {plan.freeFeaturedListings > 0 && (
                                        <li>
                                            <FiGift size={14} /> {t("planCard.freeFeaturedListings", { count: plan.freeFeaturedListings })}
                                        </li>
                                    )}
                                    {plan.listingDiscountPercent > 0 && (
                                        <li>
                                            <FiPercent size={14} /> {t("planCard.listingDiscount", { percent: plan.listingDiscountPercent })}
                                        </li>
                                    )}
                                    {plan.boostDiscountPercent > 0 && (
                                        <li>
                                            <FiZap size={14} /> {t("planCard.boostDiscount", { percent: plan.boostDiscountPercent })}
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {showRemainingEntitlements && (
                                <div className={`${styles.card} ${styles.cardHighlight}`}>
                                    <h2 className={styles.cardTitle}>{tDetail("yourRemainingBenefits")}</h2>
                                    {plan.freeListingsCount !== undefined && (
                                        <div className={styles.remainingRow}>
                                            <span>{t("freeListingsRemainingLabel", { count: plan.freeListings })}</span>
                                            <strong>{plan.freeListingsCount}</strong>
                                        </div>
                                    )}
                                    {plan.freeFeaturedListingsCount !== undefined && (
                                        <div className={styles.remainingRow}>
                                            <span>{t("freeFeaturedRemainingLabel", { count: plan.freeFeaturedListings })}</span>
                                            <strong>{plan.freeFeaturedListingsCount}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.actionsRow}>
                            <Button
                                size="lg"
                                onClick={handleCheckout}
                                loading={checkingOut}
                                loadingLabel={t("processing")}
                                disabled={ctaDisabled}
                            >
                                {ctaLabel()}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
