"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiCheck, FiStar } from "react-icons/fi";
import { SubscriptionPlan } from "@/types/subscription";
import styles from "./SubscriptionPlanCard.module.css";

interface SubscriptionPlanCardProps {
    plan: SubscriptionPlan;
    isCurrentPlan?: boolean;
    highlight?: boolean;
    ctaLabel?: string;
    ctaDisabled?: boolean;
    processing?: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
}

export default function SubscriptionPlanCard({
    plan,
    isCurrentPlan = false,
    highlight = false,
    ctaLabel,
    ctaDisabled = false,
    processing = false,
    onSelect,
}: SubscriptionPlanCardProps) {
    const t = useTranslations("subscription.planCard");
    const locale = useLocale();

    const formattedPrice =
        plan.price > 0 ? new Intl.NumberFormat(locale).format(plan.price) : null;

    const benefits: string[] = [t("maxListings", { count: plan.maxListings })];
    if (plan.freeListings > 0) benefits.push(t("freeListings", { count: plan.freeListings }));
    if (plan.freeFeaturedListings > 0) benefits.push(t("freeFeaturedListings", { count: plan.freeFeaturedListings }));
    if (plan.listingDiscountPercent > 0) benefits.push(t("listingDiscount", { percent: plan.listingDiscountPercent }));
    if (plan.boostDiscountPercent > 0) benefits.push(t("boostDiscount", { percent: plan.boostDiscountPercent }));

    return (
        <div
            className={`${styles.card} ${highlight ? styles.cardHighlight : ""} ${
                isCurrentPlan ? styles.cardCurrent : ""
            }`}
        >
            {isCurrentPlan && (
                <div className={styles.currentRibbon}>
                    <FiStar size={11} /> {t("currentPlan")}
                </div>
            )}

            <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>

                <div className={styles.priceRow}>
                    {formattedPrice ? (
                        <>
                            <span className={styles.priceAmount}>{formattedPrice}</span>
                            <span className={styles.priceCurrency}>{t("currency")}</span>
                        </>
                    ) : (
                        <span className={styles.priceFree}>{t("free")}</span>
                    )}
                </div>
                <span className={styles.validity}>{t("validity", { days: plan.validityDays })}</span>
            </div>

            <ul className={styles.benefitsList}>
                {benefits.map((benefit) => (
                    <li key={benefit} className={styles.benefitItem}>
                        <span className={styles.benefitCheck}>
                            <FiCheck size={12} />
                        </span>
                        <span>{benefit}</span>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className={`${styles.ctaButton} ${isCurrentPlan ? styles.ctaButtonSecondary : ""}`}
                onClick={() => onSelect(plan)}
                disabled={ctaDisabled || processing}
            >
                {processing ? t("processing") : ctaLabel || t("choosePlan")}
            </button>
        </div>
    );
}
