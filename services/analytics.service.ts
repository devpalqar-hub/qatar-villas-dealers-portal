import api from "@/lib/axios";
import {
    DealerAnalyticsParams,
    DealerAnalyticsResponse,
} from "@/types/analytics";

export const analyticsService = {
    getDealerAnalytics: async (
        params: DealerAnalyticsParams = {}
    ): Promise<DealerAnalyticsResponse> => {
        const cleanParams: Record<string, any> = {};

        if (params.startDate) cleanParams.startDate = params.startDate;
        if (params.endDate) cleanParams.endDate = params.endDate;
        if (params.page) cleanParams.page = params.page;
        if (params.limit) cleanParams.limit = params.limit;
        if (params.search?.trim()) cleanParams.search = params.search.trim();
        if (params.status) cleanParams.status = params.status;
        if (params.purpose) cleanParams.purpose = params.purpose;
        if (params.sortBy) cleanParams.sortBy = params.sortBy;
        if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

        const response = await api.get<DealerAnalyticsResponse>(
            "/dealers/analytics/me",
            {
                params: cleanParams,
            }
        );
        return response.data;
    },
};
