"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { subscriptionService } from "@/services/subscription.service";
import { SubscriptionPlan } from "@/types/subscription";
import SubscriptionPlanCard from "./SubscriptionPlanCard";
import styles from "./SubscriptionPlanGrid.module.css";

interface SubscriptionPlanGridProps {
    currentPlanId?: string | null;
    selectingPlanId?: string | null;
    onSelectPlan: (plan: SubscriptionPlan) => void;
    ctaLabelForPlan?: (plan: SubscriptionPlan, isCurrentPlan: boolean) => string | undefined;
    /** Return true to disable the CTA for a given plan (e.g. re-purchasing an already-active plan). */
    ctaDisabledForPlan?: (plan: SubscriptionPlan, isCurrentPlan: boolean) => boolean;
}

const PAGE_LIMIT = 10;

export default function SubscriptionPlanGrid({
    currentPlanId,
    selectingPlanId,
    onSelectPlan,
    ctaLabelForPlan,
    ctaDisabledForPlan,
}: SubscriptionPlanGridProps) {
    const t = useTranslations("subscription");
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPage = useCallback(async (targetPage: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(null);
        try {
            const res = await subscriptionService.getPlans(targetPage, PAGE_LIMIT);
            const activePlans = (res.data || []).filter((plan) => plan.isActive);
            setPlans((prev) => (append ? [...prev, ...activePlans] : activePlans));
            setTotalPages(res.meta?.totalPages || 1);
            setPage(targetPage);
        } catch {
            setError(t("errors.plansLoadFailed"));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [t]);

    useEffect(() => {
        void fetchPage(1, false);
    }, [fetchPage]);

    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);
    const highestPrice = sortedPlans.length > 0 ? sortedPlans[sortedPlans.length - 1].price : 0;

    if (loading) {
        return (
            <div className={styles.grid}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.stateBox}>
                <FiAlertTriangle size={26} />
                <p>{error}</p>
                <button type="button" className={styles.retryBtn} onClick={() => fetchPage(1, false)}>
                    <FiRefreshCw size={14} /> {t("retry")}
                </button>
            </div>
        );
    }

    if (sortedPlans.length === 0) {
        return (
            <div className={styles.stateBox}>
                <p>{t("noPlansAvailable")}</p>
                <p className={styles.stateBoxHint}>{t("noPlansAvailableHint")}</p>
            </div>
        );
    }

    return (
        <div>
            <div className={styles.grid}>
                {sortedPlans.map((plan) => {
                    const isCurrentPlan = !!currentPlanId && plan.id === currentPlanId;
                    return (
                        <SubscriptionPlanCard
                            key={plan.id}
                            plan={plan}
                            isCurrentPlan={isCurrentPlan}
                            highlight={plan.price === highestPrice && highestPrice > 0}
                            processing={selectingPlanId === plan.id}
                            ctaDisabled={
                                (!!selectingPlanId && selectingPlanId !== plan.id) ||
                                !!ctaDisabledForPlan?.(plan, isCurrentPlan)
                            }
                            ctaLabel={ctaLabelForPlan?.(plan, isCurrentPlan)}
                            onSelect={onSelectPlan}
                        />
                    );
                })}
            </div>

            {page < totalPages && (
                <div className={styles.loadMoreRow}>
                    <button
                        type="button"
                        className={styles.loadMoreBtn}
                        onClick={() => fetchPage(page + 1, true)}
                        disabled={loadingMore}
                    >
                        {loadingMore ? t("loadingMore") : t("loadMorePlans")}
                    </button>
                </div>
            )}
        </div>
    );
}
