import api from "@/lib/axios";
import { InvoiceFilters, InvoiceListResponse } from "@/types/invoice";

function toStartOfDayIso(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

function toEndOfDayIso(dateStr: string): string {
    return new Date(`${dateStr}T23:59:59.999Z`).toISOString();
}

export const invoiceService = {
    getInvoices: async (filters: InvoiceFilters = {}): Promise<InvoiceListResponse> => {
        const params: Record<string, string | number> = {
            page: filters.page || 1,
            limit: filters.limit || 20,
        };

        if (filters.type) params.type = filters.type;
        if (filters.status) params.status = filters.status;
        if (filters.search?.trim()) params.search = filters.search.trim();
        if (filters.from) params.from = toStartOfDayIso(filters.from);
        if (filters.to) params.to = toEndOfDayIso(filters.to);
        if (filters.userId) params.userId = filters.userId;

        const response = await api.get<InvoiceListResponse>("/invoices", { params });
        return response.data;
    },
};
