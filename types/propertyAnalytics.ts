export type PropertyAnalyticsGranularity = "daily" | "weekly" | "monthly" | "yearly";

export interface PropertyAnalyticsOwner {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface PropertyAnalyticsRange {
    startDate: string;
    endDate: string;
}

export interface PropertyAnalyticsTotals {
    views: number;
    reach: number;
    impressions: number;
    whatsappClicks: number;
    messagesStarted: number;
    usersEngaged: number;
    propertyVisitRequests: number;
}

export interface PropertyAnalyticsPeriod {
    views: number;
    reach: number;
    whatsappClicks: number;
    messagesStarted: number;
    usersEngaged: number;
    propertyVisitRequests: number;
    previousPeriodViews: number;
    viewsGrowthPercent: number;
}

export interface PropertyAnalyticsTrendPoint {
    period: string;
    views: number;
}

export interface PropertyAnalyticsResponse {
    listingId: string;
    propertyName: string;
    slug: string;
    status: string;
    owner: PropertyAnalyticsOwner;
    granularity: PropertyAnalyticsGranularity;
    range: PropertyAnalyticsRange;
    totals: PropertyAnalyticsTotals;
    period: PropertyAnalyticsPeriod;
    trend: PropertyAnalyticsTrendPoint[];
}

export interface PropertyAnalyticsFilters {
    startDate?: string;
    endDate?: string;
    granularity?: PropertyAnalyticsGranularity;
}
