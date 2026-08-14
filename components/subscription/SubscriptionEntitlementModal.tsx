"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { FiX, FiCreditCard } from "react-icons/fi";
import { Button } from "@/components/ui";
import { SubscriptionPlan } from "@/types/subscription";
import SubscriptionPlanGrid from "./SubscriptionPlanGrid";
import styles from "./SubscriptionEntitlementModal.module.css";

export type EntitlementContext = "LISTING" | "FEATURED_LISTING";
export type EntitlementReason = "LIMIT_REACHED" | "UPGRADE_REQUIRED" | "NO_SUBSCRIPTION" | "EXPIRING" | "EXPIRED";

interface SubscriptionEntitlementModalProps {
    open: boolean;
    context: EntitlementContext;
    reason: EntitlementReason;
    currentPlanId?: string | null;
    onClose: () => void;
    onPayIndividually?: () => void;
    payIndividuallyLoading?: boolean;
    onPlanSelected: (plan: SubscriptionPlan) => void;
    selectingPlanId?: string | null;
}

export default function SubscriptionEntitlementModal({
    open,
    context,
    reason,
    currentPlanId,
    onClose,
    onPayIndividually,
    payIndividuallyLoading = false,
    onPlanSelected,
    selectingPlanId,
}: SubscriptionEntitlementModalProps) {
    const t = useTranslations("subscription.entitlementModal");

    useEffect(() => {
        if (!open) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !selectingPlanId && !payIndividuallyLoading) onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, onClose, selectingPlanId, payIndividuallyLoading]);

    if (!open) return null;

    const busy = !!selectingPlanId || payIndividuallyLoading;

    const explanationKey = `${context}.${reason}` as const;

    return createPortal(
        <div
            className={styles.backdrop}
            onClick={(e) => {
                if (e.target === e.currentTarget && !busy) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="entitlement-modal-title"
        >
            <div className={styles.panel}>
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                    disabled={busy}
                    aria-label={t("close")}
                >
                    <FiX size={20} />
                </button>

                <div className={styles.header}>
                    <h2 id="entitlement-modal-title" className={styles.title}>
                        {t(`titles.${context}`)}
                    </h2>
                    <p className={styles.explanation}>{t(`explanations.${explanationKey}`)}</p>
                </div>

                {onPayIndividually && (
                    <>
                        <div className={styles.payOption}>
                            <Button
                                size="lg"
                                leftIcon={<FiCreditCard size={16} />}
                                onClick={onPayIndividually}
                                loading={payIndividuallyLoading}
                                loadingLabel={t("processing")}
                                disabled={!!selectingPlanId}
                            >
                                {t(`payLabels.${context}`)}
                            </Button>
                        </div>

                        <div className={styles.divider}>
                            <span>{t("or")}</span>
                        </div>
                    </>
                )}

                <div className={styles.plansSection}>
                    <h3 className={styles.plansTitle}>{t("choosePlanTitle")}</h3>
                    <SubscriptionPlanGrid
                        currentPlanId={currentPlanId}
                        selectingPlanId={selectingPlanId}
                        onSelectPlan={onPlanSelected}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}
