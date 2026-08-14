import api from "@/lib/axios";
import { DealerProfile } from "@/types/profile";

export const profileService = {
    getMyProfile: async (): Promise<DealerProfile> => {
        const response = await api.get<DealerProfile>("/dealers/profile/me");
        return response.data;
    },
};
