import api from "@/lib/axios";
import { GetSubscriptionPlansResponse, SubscriptionPlan } from "@/types/subscription";

export const subscriptionService = {
    getPlans: async (page: number = 1, limit: number = 10): Promise<GetSubscriptionPlansResponse> => {
        const response = await api.get("/dealer-subscription-plans", {
            params: { page, limit },
        });
        return response.data;
    },

    getPlanById: async (id: string): Promise<SubscriptionPlan> => {
        const response = await api.get(`/dealer-subscription-plans/${id}`);
        return response.data;
    },
};

