"use client";

import Link from "next/link";
import React from "react";
import { FiX } from "react-icons/fi";
import DealerOnboardingStepper from "../../components/dealer-onboarding/DealerOnboardingStepper";
import BasicInfoForm from "../../components/dealer-onboarding/BasicInfoForm";
import BusinessDetailsForm from "../../components/dealer-onboarding/BusinessDetailsForm";
import SubmissionSuccess from "../../components/dealer-onboarding/SubmissionSuccess";
import StatusCard from "../../components/dealer-onboarding/StatusCard";
import { useDealerOnboarding } from "../../hooks/useDealerOnboarding";
import styles from "./page.module.css";
import Button from "../../components/ui/Button/Button";

export default function DealerOnboardingPage() {
    const {
        loading,
        error,
        setError,
        submissionId,
        currentStep,
        onboardingStatusData,
        startApplication,
        submitBusinessDetails,
        checkStatus,
    } = useDealerOnboarding();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {error && (
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>
                            <FiX />
                        </button>
                    </div>
                )}

                {/* Status View: Render only status card if we are in state 4 */}
                {currentStep === 4 && onboardingStatusData ? (
                    <StatusCard
                        data={onboardingStatusData}
                        onRefresh={() => checkStatus()}
                        loading={loading}
                    />
                ) : (
                    <>
                        <DealerOnboardingStepper currentStep={currentStep} />

                        {currentStep === 1 && (
                            <div style={{ width: "100%" }}>
                                <BasicInfoForm
                                    onSubmit={startApplication}
                                    loading={loading}
                                />
                                <div style={{ marginTop: "32px", textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                                    <p style={{ color: "var(--text-light)", marginBottom: "12px" }}>Already applied?</p>
                                    <Link href="/dealer-onboarding/status" passHref>
                                        <Button variant="outline">
                                            Check Application Status
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <BusinessDetailsForm
                                onSubmit={submitBusinessDetails}
                                loading={loading}
                            />
                        )}

                        {currentStep === 3 && (
                            <SubmissionSuccess
                                submissionId={submissionId!}
                                onCheckStatus={() => checkStatus(submissionId!)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
