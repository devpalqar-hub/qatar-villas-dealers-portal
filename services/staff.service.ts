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

export interface CreateStaffPayload {
    name: string;
    email: string;
    password: string;
    phone: string;
    position: string;
    permissions: string[];
}

export interface UpdateStaffPayload {
    name?: string;
    phone?: string;
    position?: string;
    permissions?: string[];
    isActive?: boolean;
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

    createStaff: async (data: CreateStaffPayload): Promise<StaffMember> => {
        const response = await api.post(`/dealer-staff`, data);
        return response.data;
    },

    updateStaff: async (id: string, data: UpdateStaffPayload): Promise<StaffMember> => {
        const response = await api.patch(`/dealer-staff/${id}`, data);
        return response.data;
    },

    deleteStaff: async (id: string): Promise<any> => {
        const response = await api.delete(`/dealer-staff/${id}`);
        return response.data;
    },
};
