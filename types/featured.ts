export type FeaturedLocation = "HOME_PAGE" | "LISTING_PAGE" | "PROPERTY_DETAIL_PAGE";

export interface FeaturedPlan {
    id: string;
    name: string;
    locations: FeaturedLocation[];
    duration: string;
    durationDays: number;
    actualPrice: number;
    discountPercent: number;
    discountedPrice: number;
    isIncludedFree: boolean;
    availableFreeFeatured: number;
}

export interface DealerFeatureResponse {
    message?: string;
    [key: string]: unknown;
}

export interface FeaturedCheckoutResponse {
    url: string;
    [key: string]: unknown;
}
