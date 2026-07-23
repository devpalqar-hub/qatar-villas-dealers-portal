"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiX, FiArrowLeft } from "react-icons/fi";
import { useDealerOnboarding } from "../../../hooks/useDealerOnboarding";
import StatusCard from "@/components/dealer-onboarding/StatusCard";
import Input from "../../../components/ui/Input/Input";
import Button from "../../../components/ui/Button/Button";
import styles from "./page.module.css";

export default function DealerOnboardingStatusPage() {
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
            setError("Please enter a valid submission ID.");
            return;
        }
        await checkStatus(manualSubmissionId.trim());
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <Link href="/dealer-onboarding" className={styles.backButton}>
                    <FiArrowLeft /> Back to form
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
                        <h2 className={styles.title}>Check Application Status</h2>
                        <p className={styles.subtitle}>Enter your submission ID to track your application.</p>
                        
                        <form onSubmit={handleManualStatusCheck} className={styles.form}>
                            <Input
                                label="Submission ID"
                                value={manualSubmissionId}
                                onChange={(e) => setManualSubmissionId(e.target.value)}
                                placeholder="Enter your submission ID"
                                required
                            />
                            <div className={styles.actions}>
                                <Button type="submit" loading={loading} size="lg">
                                    Check Status
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
