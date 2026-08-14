import api from "@/lib/axios";
import {
    BulkUploadFilters,
    BulkUploadResponse,
    DraftDetail,
    DraftListResponse,
} from "@/types/bulkUpload";

export const bulkUploadService = {
    bulkUpload: async (file: File): Promise<BulkUploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<BulkUploadResponse>("/listings/bulk-upload", formData);
        return response.data;
    },

    getDrafts: async (filters: BulkUploadFilters = {}): Promise<DraftListResponse> => {
        const params: Record<string, string | number> = {};
        if (filters.page) params.page = filters.page;
        if (filters.limit) params.limit = filters.limit;
        if (filters.batchId) params.batchId = filters.batchId;
        if (filters.status) params.status = filters.status;

        const response = await api.get<DraftListResponse>("/listings/drafts", { params });
        return response.data;
    },

    getDraft: async (id: string): Promise<DraftDetail> => {
        const response = await api.get<DraftDetail>(`/listings/drafts/${id}`);
        return response.data;
    },

    discardDraft: async (id: string): Promise<void> => {
        await api.delete(`/listings/drafts/${id}`);
    },
};
