export type ListingStatus =
    | "PENDING"
    | "ACTIVE"
    | "INACTIVE"
    | "REJECTED"
    | "SUBMITTED"
    | "SOLD";

export type ListingPurpose = "SALE" | "RENT";

export type AnalyticsSortBy =
    | "viewsCount"
    | "impressionsCount"
    | "reachCount"
    | "createdAt"
    | "price";

export type SortOrder = "asc" | "desc";

export interface DealerAnalyticsParams {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: ListingStatus | "";
    purpose?: ListingPurpose | "";
    sortBy?: AnalyticsSortBy;
    sortOrder?: SortOrder;
}

export interface DealerAnalyticsOverview {
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    rejectedListings: number;
    soldListings: number;
    activeFeaturedListings: number;
    totalViews: number;
    totalImpressions: number;
    totalReach: number;
    periodViews: number;
    periodImpressions: number;
    periodReach: number;
    totalStaffMembers: number;
    totalVisitsCount: number;
    totalConversationsCount: number;
}

export interface AnalyticsListingType {
    id: string;
    title: string;
}

export interface AnalyticsListingCreatedBy {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AnalyticsListingItem {
    id: string;
    propertyName: string;
    slug: string;
    status: ListingStatus;
    purpose: ListingPurpose;
    price: number;
    viewsCount: number;
    impressionsCount: number;
    reachCount: number;
    createdAt: string;
    updatedAt: string;
    type?: AnalyticsListingType;
    createdBy?: AnalyticsListingCreatedBy;
    isFeatured: boolean;
}

export interface DealerAnalyticsMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DealerAnalyticsResponse {
    overview: DealerAnalyticsOverview;
    listings: AnalyticsListingItem[];
    meta: DealerAnalyticsMeta;
}
