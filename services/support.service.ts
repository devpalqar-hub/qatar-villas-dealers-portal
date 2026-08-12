import api from "@/lib/axios";

export type TicketCategory =
    | "REPORT_LISTING"
    | "REPORT_USER"
    | "PAYMENT"
    | "GENERAL";

export interface CreateSupportTicketPayload {
    category: TicketCategory;
    subject: string;
    message: string;
    listingId?: string;
    reportedUserId?: string;
    referenceId?: string;
}

export interface SupportTicketResponse {
    id: string;
    category: TicketCategory;
    subject: string;
    message: string;
    listingId?: string;
    reportedUserId?: string;
    referenceId?: string;
    createdAt?: string;
    status?: string;
}

export const supportService = {
    createTicket: async (
        payload: CreateSupportTicketPayload
    ): Promise<SupportTicketResponse> => {
        const response = await api.post<SupportTicketResponse>(
            "/support/tickets",
            payload
        );
        return response.data;
    },
};
