"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiX, FiArrowLeft } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useDealerOnboarding } from "../../../hooks/useDealerOnboarding";
import StatusCard from "@/components/dealer-onboarding/StatusCard";
import Input from "../../../components/ui/Input/Input";
import Button from "../../../components/ui/Button/Button";
import styles from "./page.module.css";

export default function DealerOnboardingStatusPage() {
    const t = useTranslations("onboarding.status");
    const {
        loading,
        error,
        setError,
        onboardingStatusData,
        checkStatus,
    } = useDealerOnboarding();

    const [manualSubmissionId, setManualSubmissionId] = useState("");

    const handleManualStatusCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualSubmissionId.trim()) {
            setError(t("invalidSubmissionId"));
            return;
        }
        await checkStatus(manualSubmissionId.trim());
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <Link href="/dealer-onboarding" className={styles.backButton}>
                    <FiArrowLeft /> {t("backToForm")}
                </Link>

                {error && (
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>
                            <FiX />
                        </button>
                    </div>
                )}

                {onboardingStatusData ? (
                    <div className={styles.formContainer}>
                        <StatusCard
                            data={onboardingStatusData}
                            onRefresh={() => checkStatus(onboardingStatusData.submissionId)}
                            loading={loading}
                        />
                    </div>
                ) : (
                    <div className={styles.formContainer}>
                        <h2 className={styles.title}>{t("pageTitle")}</h2>
                        <p className={styles.subtitle}>{t("pageSubtitle")}</p>

                        <form onSubmit={handleManualStatusCheck} className={styles.form}>
                            <Input
                                label={t("submissionId")}
                                value={manualSubmissionId}
                                onChange={(e) => setManualSubmissionId(e.target.value)}
                                placeholder={t("submissionIdPlaceholder")}
                                required
                            />
                            <div className={styles.actions}>
                                <Button type="submit" loading={loading} size="lg">
                                    {t("checkStatus")}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
