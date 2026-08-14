import React from "react";
import { useTranslations } from "next-intl";
import Badge from "../ui/Badge/Badge";
import Button from "../ui/Button/Button";
import styles from "./StatusCard.module.css";
import { OnboardingStatus } from "../../services/dealerOnboarding.service";

interface Props {
    data: OnboardingStatus;
    onRefresh: () => void;
    loading: boolean;
}

export default function StatusCard({ data, onRefresh, loading }: Props) {
    const t = useTranslations("onboarding.status");
    const tCommon = useTranslations("common");
    const formatDate = (dateString: string) => {
        if (!dateString) return tCommon("notAvailable");
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("title")}</h2>
                <Badge variant={data.status === "SUBMITTED" ? "success" : "warning"}>
                    {data.status}
                </Badge>
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <span className={styles.label}>{t("submissionIdLabel")}</span>
                    <span className={styles.value}>{data.submissionId}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>{t("dealerName")}</span>
                    <span className={styles.value}>{data.dealerName}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>{t("contactPerson")}</span>
                    <span className={styles.value}>{data.contactName}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>{t("currentStep")}</span>
                    <span className={styles.value}>{data.currentStep}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>{t("submittedDate")}</span>
                    <span className={styles.value}>{formatDate(data.submittedAt)}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>{t("latestReview")}</span>
                    <span className={styles.value}>
                        {data.latestReview ? data.latestReview : t("noReview")}
                    </span>
                </div>
            </div>

            <div className={styles.actions}>
                <Button onClick={onRefresh} loading={loading}>
                    {t("refreshStatus")}
                </Button>
            </div>
        </div>
    );
}