import { useState, useEffect, useCallback } from "react";
import {
    dealerOnboardingService,
    BasicInfoData,
    BusinessDetailsData,
    OnboardingStatus,
} from "../services/dealerOnboarding.service";

export function useDealerOnboarding() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [status, setStatus] = useState<string | null>(null);
    const [onboardingStatusData, setOnboardingStatusData] =
        useState<OnboardingStatus | null>(null);

    // Initialize from localStorage removed as per user request to manually check status

    const startApplication = async (data: BasicInfoData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await dealerOnboardingService.startApplication(data);
            setSubmissionId(response.submissionId);
            setApplicationId(response.applicationId);
            setCurrentStep(2);
            return response;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to start application";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const submitBusinessDetails = async (data: BusinessDetailsData) => {
        if (!submissionId) {
            setError("No active submission ID found.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await dealerOnboardingService.submitBusinessDetails(
                submissionId,
                data
            );
            setStatus(response.status);
            setCurrentStep(3); // Submission Success Step
            return response;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to submit business details";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = useCallback(async (idToUse?: string) => {
        const id = idToUse || submissionId;
        if (!id) {
            setError("No active submission ID to check status.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await dealerOnboardingService.getStatus(id);
            setOnboardingStatusData(response);
            setStatus(response.status);
            // If submitted, show the status screen directly (treat as step 3 or status view)
            if (response.status === "SUBMITTED") {
                setCurrentStep(4); // Using 4 as Status View indicator
            } else {
                setCurrentStep(response.currentStep || 1);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to fetch status";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [submissionId]);

    // Added a helper function to set error externally (e.g. for validation errors before submit)
    const setExternalError = (msg: string | null) => setError(msg);
    
    // Clear state/restart onboarding
    const resetOnboarding = () => {
         setSubmissionId(null);
         setApplicationId(null);
         setCurrentStep(1);
         setStatus(null);
         setOnboardingStatusData(null);
         setError(null);
    }

    return {
        loading,
        error,
        setError: setExternalError,
        submissionId,
        applicationId,
        currentStep,
        status,
        onboardingStatusData,
        startApplication,
        submitBusinessDetails,
        checkStatus,
        resetOnboarding
    };
}
