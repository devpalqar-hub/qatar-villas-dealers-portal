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

/** Shape of each document returned by GET /dealer-onboarding/edit/{token} */
export interface ApiDocument {
    id: string;
    applicationId: string;
    documentType: string;
    originalName: string;
    minioKey: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
    downloadUrl: string;
}

/** Shape of each review entry in the reviews array */
export interface ApiReview {
    id: string;
    applicationId: string;
    action: string;
    message: string;
    reviewedById: string;
    reviewedAt: string;
}

/** Full shape of GET /dealer-onboarding/edit/{token} response */
export interface EditApplicationData {
    id: string;
    submissionId: string;
    dealerName: string;
    contactName: string;
    email: string;
    phone: string;
    tradeNumber: string;
    reraNumber: string | null;
    address: string;
    city: string;
    country: string;
    website: string | null;
    description: string | null;
    status: string;
    currentStep: number;
    editToken: string;
    editTokenExpiry: string;
    createdAt: string;
    updatedAt: string;
    documents: ApiDocument[];
    reviews: ApiReview[];
    latestRejectionMessage: string | null;
}

/** Legacy alias kept for backwards compat */
export type ExistingDocumentItem = ApiDocument;

export const dealerOnboardingService = {
    startApplication: async (data: BasicInfoData) => {
        const response = await api.post("/dealer-onboarding/apply", data);
        return response.data;
    },

    submitBusinessDetails: async (submissionId: string, data: BusinessDetailsData | FormData) => {
        const response = await api.post(
            `/dealer-onboarding/${submissionId}/details`,
            data,
            data instanceof FormData
                ? { headers: { "Content-Type": "multipart/form-data" } }
                : undefined
        );
        return response.data;
    },

    getStatus: async (submissionId: string): Promise<OnboardingStatus> => {
        const response = await api.get(`/dealer-onboarding/status/${submissionId}`);
        return response.data;
    },

    getEditApplication: async (token: string): Promise<EditApplicationData> => {
        const response = await api.get(`/dealer-onboarding/edit/${token}`);
        return response.data;
    },

    resubmitApplication: async (token: string, data: FormData) => {
        const response = await api.put(
            `/dealer-onboarding/resubmit/${token}`,
            data,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    },
};
