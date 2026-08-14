export interface DealerProfileLinks {
    website: string | null;
    facebook: string | null;
    youtube: string | null;
    whatsapp: string | null;
    instagram: string | null;
}

export interface DealerProfileStats {
    soldPropertiesCount: number;
    activePropertiesCount: number;
    staffCount: number;
}

export interface DealerProfileQuota {
    remainingFreeListings: number;
    remainingFreeFeatured: number;
}

export interface DealerProfilePlan {
    hasActivePlan: boolean;
    planId: string | null;
    planName: string | null;
    maxListings: number;
    listingDiscountPercent: number;
    featuringDiscountPercent: number;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
    isExpired: boolean;
}

export interface DealerProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    memberSince: string;
    dealerName: string;
    tagline: string | null;
    description: string;
    coverImage: string | null;
    logoImage: string | null;
    contactPhone: string;
    address: string;
    city: string;
    country: string;
    tradeNumber: string;
    reraNumber: string;
    links: DealerProfileLinks;
    stats: DealerProfileStats;
    quota: DealerProfileQuota;
    plan: DealerProfilePlan;
}
