"use client";

import React from "react";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { ApiReview } from "@/services/dealerOnboarding.service";
import styles from "./EditSidebar.module.css";

interface Props {
    /** The latestRejectionMessage from the API */
    latestRejectionMessage?: string | null;
    /** Full reviews array from the API */
    reviews?: ApiReview[];
    /** When the application was first submitted (createdAt) */
    submittedAt?: string;
}

export default function EditSidebar({
    latestRejectionMessage,
    reviews = [],
    submittedAt,
}: Props) {
    const t = useTranslations("onboarding.editSidebar");
    const tStatus = useTranslations("statusEnum");
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return (
                d.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }) +
                ", " +
                d.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        } catch {
            return dateStr;
        }
    };

    // Sort reviews: most recent first
    const sortedReviews = [...reviews].sort(
        (a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime()
    );

    return (
        <div className={styles.sidebarContainer}>
            {/* ── CARD 1: Review History ── */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>{t("reviewHistory")}</h3>

                <div className={styles.timeline}>
                    {/* Dynamic review entries from API */}
                    {sortedReviews.map((review, idx) => {
                        const isRejected = review.action === "REJECTED";
                        const isLast = idx === sortedReviews.length - 1;

                        return (
                            <div key={review.id} className={styles.timelineItem}>
                                {!isLast && <div className={styles.timelineLine} />}
                                <div
                                    className={
                                        isRejected
                                            ? styles.timelineNodeRejected
                                            : styles.timelineNodeSubmitted
                                    }
                                />

                                <div className={styles.itemHeader}>
                                    <span
                                        className={
                                            isRejected ? styles.badgeRejected : styles.badgeSubmitted
                                        }
                                    >
                                        {isRejected ? tStatus("REJECTED") : tStatus("SUBMITTED")}
                                    </span>
                                    <span className={styles.itemDate}>
                                        {formatDate(review.reviewedAt)}
                                    </span>
                                </div>

                                <div className={styles.reviewedBy}>{t("reviewedBy")}</div>

                                {review.message && (
                                    <>
                                        <div className={styles.reasonHeading}>{t("reason")}</div>
                                        <div className={styles.notesList}>
                                            {review.message
                                                .split("\n")
                                                .map((line) => line.trim())
                                                .filter(Boolean)
                                                .map((line, i) => (
                                                    <p key={i} className={styles.noteItem}>
                                                        {line}
                                                    </p>
                                                ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {/* Submitted entry always at bottom */}
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineNodeSubmitted} />
                        <div className={styles.itemHeader}>
                            <span className={styles.badgeSubmitted}>{t("submittedBadge")}</span>
                            <span className={styles.itemDate}>{formatDate(submittedAt)}</span>
                        </div>
                        <div className={styles.subText}>
                            {t("submittedNote")}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CARD 2: Before Resubmitting ── */}
            <div className={styles.checklistCard}>
                <h3 className={styles.checklistTitle}>{t("beforeResubmitting")}</h3>
                <div className={styles.checkList}>
                    <div className={styles.checkItem}>
                        <FiAlertCircle className={styles.checkIcon} />
                        <span>{t("checklist.fields")}</span>
                    </div>
                    <div className={styles.checkItem}>
                        <FiAlertCircle className={styles.checkIcon} />
                        <span>{t("checklist.documents")}</span>
                    </div>
                    <div className={styles.checkItem}>
                        <FiAlertCircle className={styles.checkIcon} />
                        <span>{t("checklist.accuracy")}</span>
                    </div>
                </div>
            </div>

            {/* ── CARD 3: Need Help? ── */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>{t("needHelp")}</h3>
                <p className={styles.helpDescription}>
                    {t("helpDescription")}
                </p>
                <button
                    type="button"
                    className={styles.supportBtn}
                    onClick={() => {
                        window.location.href = "mailto:support@villasqatar.qa";
                    }}
                >
                    {t("contactSupport")} <FiArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
