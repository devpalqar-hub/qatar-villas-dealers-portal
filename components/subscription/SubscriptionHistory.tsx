"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiClock } from "react-icons/fi";
import { Badge } from "@/components/ui";
import { DealerSubscription } from "@/types/subscription";
import { isSuccessfulSubscriptionPayment } from "@/utils/subscriptionStatus";
import styles from "./SubscriptionHistory.module.css";

interface SubscriptionHistoryProps {
    subscriptions: DealerSubscription[];
    loading?: boolean;
}

function paymentStatusVariant(status: string): "success" | "warning" | "danger" | "default" {
    if (status.toUpperCase() === "PENDING") return "warning";
    if (isSuccessfulSubscriptionPayment(status)) return "success";
    return "danger";
}

const KNOWN_PAYMENT_STATUSES = ["PENDING", "PAID", "FREE", "COMPLETED", "FAILED", "CANCELLED", "EXPIRED", "REFUNDED"];

function formatUnknownStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default function SubscriptionHistory({ subscriptions, loading = false }: SubscriptionHistoryProps) {
    const t = useTranslations("subscription");
    const tPaymentStatus = useTranslations("subscription.paymentStatusLabel");
    const locale = useLocale();

    const paymentStatusLabel = (status: string) => {
        const upper = status.toUpperCase();
        return KNOWN_PAYMENT_STATUSES.includes(upper) ? tPaymentStatus(upper) : formatUnknownStatus(status);
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });

    const formatAmount = (subscription: DealerSubscription) => {
        if (subscription.paidAmount === null || subscription.paidAmount === undefined) {
            return subscription.plan.price > 0 ? "—" : t("planCard.free");
        }
        if (subscription.paidAmount === 0) return t("planCard.free");
        return `${new Intl.NumberFormat(locale).format(subscription.paidAmount)} ${t("planCard.currency")}`;
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <FiClock size={16} />
                </div>
                <h2 className={styles.title}>{t("subscriptionHistory")}</h2>
            </div>

            {loading ? (
                <div className={styles.list}>
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className={styles.skeletonRow} />
                    ))}
                </div>
            ) : subscriptions.length === 0 ? (
                <div className={styles.emptyState}>{t("noHistoryYet")}</div>
            ) : (
                <div className={styles.list}>
                    {subscriptions.map((subscription) => (
                        <div key={subscription.id} className={styles.row}>
                            <div className={styles.rowMain}>
                                <span className={styles.planName}>{subscription.plan.name}</span>
                                <span className={styles.dateRange}>
                                    {formatDate(subscription.startDate)} &rarr; {formatDate(subscription.endDate)}
                                </span>
                            </div>
                            <div className={styles.rowMeta}>
                                <span className={styles.amount}>{formatAmount(subscription)}</span>
                                <Badge variant={paymentStatusVariant(subscription.paymentStatus)}>
                                    {paymentStatusLabel(subscription.paymentStatus)}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
