import api from "@/lib/axios";
import { DealerFeatureResponse, FeaturedCheckoutResponse, FeaturedPlan } from "@/types/featured";

export const featuredService = {
    getDealerPlans: async (): Promise<FeaturedPlan[]> => {
        const response = await api.get("/featured-plans/dealer");
        return response.data;
    },

    // Activates a plan directly for listings that qualify for a free featured slot.
    featureListingForFree: async (listingId: string, planId: string): Promise<DealerFeatureResponse> => {
        const response = await api.post("/featured/dealer-feature", { listingId, planId });
        return response.data;
    },

    // Creates a Stripe Checkout session for a paid plan; returns the redirect URL.
    createCheckoutSession: async (listingId: string, planId: string): Promise<FeaturedCheckoutResponse> => {
        const response = await api.post("/featured/checkout", { listingId, planId });
        return response.data;
    },
};
