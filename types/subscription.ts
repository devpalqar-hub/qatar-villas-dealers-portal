export interface SubscriptionPlan {
    id: string;
    name: string;
    maxListings: number;
    validityDays: number;
    price: number;
    boostDiscountPercent: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetSubscriptionPlansResponse {
    data: SubscriptionPlan[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
