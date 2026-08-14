import api from "@/lib/axios";
import {
    DealerSubscription,
    GetSubscriptionPlansResponse,
    SubscriptionCheckoutResponse,
    SubscriptionPlan,
} from "@/types/subscription";

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

    /** Dealer's full subscription history, including the current/past records. */
    getMySubscriptions: async (): Promise<DealerSubscription[]> => {
        const response = await api.get("/dealer-subscriptions/my");
        return response.data;
    },

    /** Starts (or renews) a subscription for the given plan and returns the Stripe redirect. */
    checkout: async (planId: string): Promise<SubscriptionCheckoutResponse> => {
        const response = await api.post("/dealer-subscriptions/checkout", { planId });
        return response.data;
    },
};
