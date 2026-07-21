import api from "../lib/axios";

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface LoginResponse {
    isNew: boolean;
    access_token: string;
    token_type: string;
    profile: {
        id: string;
        email: string;
        name: string;
        role: string;
        phone: string;
        isProfileComplete: boolean;
        isActive: boolean;
    };
}

export const authService = {
    login: async (data: LoginPayload): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>("/auth/login", data);
        return response.data;
    },
};