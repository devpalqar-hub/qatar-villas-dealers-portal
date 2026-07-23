import api from "@/lib/axios";

export interface StaffUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface StaffMember {
    id: string;
    staffUserId: string;
    dealerUserId: string;
    position: string;
    permissions: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    staffUser: StaffUser;
}

export interface StaffPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetStaffResponse {
    data: StaffMember[];
    meta: StaffPaginationMeta;
}

export const staffService = {
    getStaff: async (page: number = 1, limit: number = 20): Promise<GetStaffResponse> => {
        const response = await api.get(`/dealer-staff`, { params: { page, limit } });
        return response.data;
    },

    getStaffById: async (id: string): Promise<StaffMember> => {
        const response = await api.get(`/dealer-staff/${id}`);
        return response.data;
    },
};
