import api from "@/lib/axios";
import { DashboardFilterParams, DashboardResponse } from "@/types/dashboard";

function toStartOfDayIso(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

function toEndOfDayIso(dateStr: string): string {
    return new Date(`${dateStr}T23:59:59.999Z`).toISOString();
}

export const dashboardService = {
    getDashboard: async (params: DashboardFilterParams = {}): Promise<DashboardResponse> => {
        const payload: Record<string, any> = {};

        if (params.startDate) payload.startDate = toStartOfDayIso(params.startDate);
        if (params.endDate) payload.endDate = toEndOfDayIso(params.endDate);
        if (params.granularity) payload.granularity = params.granularity;
        if (params.listingId) payload.listingId = params.listingId;
        if (params.staffUserId) payload.staffUserId = params.staffUserId;
        if (params.typeId) payload.typeId = params.typeId;
        if (params.purpose) payload.purpose = params.purpose;
        if (params.status) payload.status = params.status;
        if (params.municipalityId) payload.municipalityId = params.municipalityId;
        if (params.areaName?.trim()) payload.areaName = params.areaName.trim();

        const response = await api.get<DashboardResponse>("/dealers/analytics/dashboard", payload);
        return response.data;
    },
};
