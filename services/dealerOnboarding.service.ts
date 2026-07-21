import api from "../lib/axios";

export interface BasicInfoData {
    dealerName: string;
    contactName: string;
    email: string;
    phone: string;
}

export interface BusinessDetailsData {
    tradeNumber: string;
    reraNumber?: string;
    address: string;
    city: string;
    country: string;
    website?: string;
    description?: string;
    documents?: string[];
}

export interface OnboardingStatus {
    submissionId: string;
    dealerName: string;
    contactName: string;
    status: string;
    currentStep: number;
    submittedAt: string;
    latestReview: string | null;
}

export const dealerOnboardingService = {
    startApplication: async (data: BasicInfoData) => {
        const response = await api.post("/dealer-onboarding/apply", data);
        return response.data;
    },

    submitBusinessDetails: async (submissionId: string, data: BusinessDetailsData) => {
        const response = await api.post(
            `/dealer-onboarding/${submissionId}/details`,
            data
        );
        return response.data;
    },

    getStatus: async (submissionId: string): Promise<OnboardingStatus> => {
        const response = await api.get(`/dealer-onboarding/status/${submissionId}`);
        return response.data;
    },
};
