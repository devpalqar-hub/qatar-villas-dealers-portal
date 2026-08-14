/**
 * A subscription plan as returned by GET /dealer-subscription-plans.
 *
 * `freeListingsCount` / `freeFeaturedListingsCount` are only present when the
 * plan was fetched via GET /dealer-subscription-plans/{planId} — that detail
 * endpoint is the backend's source of truth for the dealer's CURRENT
 * REMAINING entitlement on that plan. They must never be derived on the
 * frontend (not from property counts, not from `freeListings` minus usage).
 */
export interface SubscriptionPlan {
    id: string;
    name: string;
    maxListings: number;
    validityDays: number;
    price: number;

    /** Total free-listing allowance configured on the plan. */
    freeListings: number;
    /** Total free-featured-listing allowance configured on the plan. */
    freeFeaturedListings: number;

    listingDiscountPercent: number;
    boostDiscountPercent: number;

    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    /** Dealer's current remaining free-listing entitlement (detail endpoint only). */
    freeListingsCount?: number;
    /** Dealer's current remaining free-featured-listing entitlement (detail endpoint only). */
    freeFeaturedListingsCount?: number;
}

export interface SubscriptionPlanListMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetSubscriptionPlansResponse {
    data: SubscriptionPlan[];
    meta: SubscriptionPlanListMeta;
}

/**
 * Plan summary as embedded inside a dealer subscription history record
 * (GET /dealer-subscriptions/my). Does not include the dealer-specific
 * remaining-entitlement counts — fetch the plan detail endpoint for those.
 */
export interface DealerSubscriptionPlanSummary {
    id: string;
    name: string;
    maxListings: number;
    validityDays: number;
    price: number;
    freeListings: number;
    freeFeaturedListings: number;
    listingDiscountPercent: number;
    boostDiscountPercent: number;
    isActive: boolean;
}

/**
 * Backend-defined payment status string on a dealer subscription record.
 * The exact set of values is owned by the backend (e.g. PENDING, PAID,
 * FREE, COMPLETED, FAILED, CANCELLED) — the frontend must not assume a
 * closed enum. See utils/subscriptionStatus.ts for how this is interpreted.
 */
export type SubscriptionPaymentStatus = string;

/** One entry from the dealer's subscription history (GET /dealer-subscriptions/my). */
export interface DealerSubscription {
    id: string;
    dealerId: string;
    planId: string;
    startDate: string;
    endDate: string;
    paymentStatus: SubscriptionPaymentStatus;
    stripePaymentIntentId: string | null;
    stripeSessionId: string | null;
    paidAmount: number | null;
    assignedByAdminId: string | null;
    createdAt: string;
    updatedAt: string;
    plan: DealerSubscriptionPlanSummary;
}

export interface SubscriptionCheckoutRequest {
    planId: string;
}

export interface SubscriptionCheckoutResponse {
    subscriptionId: string;
    activated: boolean;
    sessionId: string | null;
    url: string | null;
    paymentIntentClientSecret: string | null;
}
