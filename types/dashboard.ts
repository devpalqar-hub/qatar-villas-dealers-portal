export type DashboardGranularity = "daily" | "weekly" | "monthly" | "yearly";

export type DashboardListingPurpose = "SALE" | "RENT";

export type DashboardListingStatus =
    | "PENDING"
    | "ACTIVE"
    | "INACTIVE"
    | "REJECTED"
    | "RESUBMITED"
    | "SOLD"
    | "PENDING_PAYMENT";

export interface DashboardFilterParams {
    startDate?: string;
    endDate?: string;
    granularity?: DashboardGranularity;
    listingId?: string;
    staffUserId?: string;
    typeId?: string;
    purpose?: DashboardListingPurpose | "";
    status?: DashboardListingStatus | "";
    municipalityId?: string;
    areaName?: string;
}

export interface DashboardFiltersApplied {
    startDate: string;
    endDate: string;
    granularity: DashboardGranularity;
    listingId: string | null;
    staffUserId: string | null;
    typeId: string | null;
    purpose: DashboardListingPurpose | null;
    status: DashboardListingStatus | null;
    municipalityId: string | null;
    areaName: string | null;
}

export interface DashboardListingsOverview {
    total: number;
    open: number;
    pending: number;
    rejected: number;
    sold: number;
    inactive: number;
    activeFeatured: number;
}

export interface DashboardEngagementOverview {
    totalViews: number;
    periodViews: number;
    totalImpressions: number;
    periodImpressions: number;
    totalReach: number;
    periodReach: number;
}

export interface DashboardChatsOverview {
    totalConversations: number;
    periodConversations: number;
    totalUsersStartedChat: number;
    periodUsersStartedChat: number;
}

export interface DashboardWhatsappOverview {
    totalClicks: number;
    periodClicks: number;
}

export interface DashboardVisitsByStatus {
    PENDING: number;
    ACCEPTED: number;
    RESCHEDULED: number;
    REJECTED: number;
    CANCELLED: number;
}

export interface DashboardVisitsOverview {
    total: number;
    period: number;
    byStatus: DashboardVisitsByStatus;
}

export interface DashboardQuotaOverview {
    remainingFreeListings: number;
    remainingFreeFeatured: number;
}

export interface DashboardSubscriptionOverview {
    hasActivePlan: boolean;
    planId: string | null;
    planName: string | null;
    maxListings: number;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
    isExpired: boolean;
}

export interface DashboardStaffMember {
    id: string;
    name: string;
    email: string;
    position: string;
}

export interface DashboardStaffOverview {
    totalStaffMembers: number;
    members: DashboardStaffMember[];
}

export interface DashboardSalesOverview {
    soldCount: number;
    soldValue: number;
}

export interface DashboardOverview {
    listings: DashboardListingsOverview;
    engagement: DashboardEngagementOverview;
    chats: DashboardChatsOverview;
    whatsapp: DashboardWhatsappOverview;
    visits: DashboardVisitsOverview;
    quota: DashboardQuotaOverview;
    subscription: DashboardSubscriptionOverview;
    staff: DashboardStaffOverview;
    sales: DashboardSalesOverview;
}

export interface DashboardGraphPoint {
    period: string;
    views: number;
    visits: number;
    chats: number;
    whatsappChats: number;
}

export interface DashboardGraph {
    granularity: DashboardGranularity;
    series: DashboardGraphPoint[];
}

export interface DashboardTopListingType {
    id: string;
    title: string;
}

export interface DashboardTopListing {
    id: string;
    propertyName: string;
    slug: string;
    referenceCode: string;
    status: DashboardListingStatus;
    purpose: DashboardListingPurpose;
    price: number;
    type: DashboardTopListingType;
    viewsCount: number;
    reachCount: number;
    whatsappClicksCount: number;
    conversationsCount: number;
    visitsCount: number;
}

export interface DashboardResponse {
    filtersApplied: DashboardFiltersApplied;
    overview: DashboardOverview;
    graph: DashboardGraph;
    topListings: DashboardTopListing[];
}
