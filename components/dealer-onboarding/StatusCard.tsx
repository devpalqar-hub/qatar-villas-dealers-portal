import React from "react";
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
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
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
                <h2 className={styles.title}>Application Status</h2>
                <Badge variant={data.status === "SUBMITTED" ? "success" : "warning"}>
                    {data.status}
                </Badge>
            </div>

            <div className={styles.grid}>
                <div className={styles.field}>
                    <span className={styles.label}>Submission ID</span>
                    <span className={styles.value}>{data.submissionId}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>Dealer Name</span>
                    <span className={styles.value}>{data.dealerName}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>Contact Person</span>
                    <span className={styles.value}>{data.contactName}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>Current Step</span>
                    <span className={styles.value}>{data.currentStep}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>Submitted Date</span>
                    <span className={styles.value}>{formatDate(data.submittedAt)}</span>
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>Latest Review</span>
                    <span className={styles.value}>
                        {data.latestReview ? data.latestReview : "No review yet."}
                    </span>
                </div>
            </div>

            <div className={styles.actions}>
                <Button onClick={onRefresh} loading={loading}>
                    Refresh Status
                </Button>
            </div>
        </div>
    );
}
