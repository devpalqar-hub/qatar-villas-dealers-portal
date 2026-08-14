"use client";

import { useCallback, useEffect, useState } from "react";
import { subscriptionService } from "@/services/subscription.service";
import { DealerSubscription, SubscriptionPlan } from "@/types/subscription";
import {
    daysUntil,
    getSubscriptionLifecycleState,
    pickRelevantSubscription,
    SubscriptionLifecycleState,
} from "@/utils/subscriptionStatus";

export interface SubscriptionEntitlements {
    loading: boolean;
    error: string | null;

    /** Full subscription history as returned by GET /dealer-subscriptions/my. */
    subscriptions: DealerSubscription[];
    /** The subscription history record most relevant to "current plan" (may be expired). */
    currentSubscription: DealerSubscription | null;
    /** Full plan detail (with dealer-specific remaining counts) for `currentSubscription.planId`. */
    currentPlan: SubscriptionPlan | null;

    lifecycleState: SubscriptionLifecycleState;
    hasActiveSubscription: boolean;
    isExpiringSoon: boolean;
    isExpired: boolean;
    daysRemaining: number | null;

    freeListingsIncluded: number;
    freeListingsRemaining: number;
    freeFeaturedListingsIncluded: number;
    freeFeaturedListingsRemaining: number;

    canUseFreeListing: boolean;
    canUseFreeFeature: boolean;

    refresh: () => Promise<void>;
}

export function useSubscriptionEntitlements(): SubscriptionEntitlements {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<DealerSubscription[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<DealerSubscription | null>(null);
    const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const history = await subscriptionService.getMySubscriptions();
            setSubscriptions(history || []);
            const relevant = pickRelevantSubscription(history || []);
            setCurrentSubscription(relevant);

            if (relevant) {
                const plan = await subscriptionService.getPlanById(relevant.planId);
                setCurrentPlan(plan);
            } else {
                setCurrentPlan(null);
            }
        } catch {
            setError("Failed to load subscription information.");
            setSubscriptions([]);
            setCurrentSubscription(null);
            setCurrentPlan(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const lifecycleState = getSubscriptionLifecycleState(currentSubscription);
    const hasActiveSubscription = lifecycleState === "ACTIVE" || lifecycleState === "EXPIRING_SOON";
    const isExpiringSoon = lifecycleState === "EXPIRING_SOON";
    const isExpired = lifecycleState === "EXPIRED";
    const daysRemaining = currentSubscription ? daysUntil(currentSubscription.endDate) : null;

    const freeListingsIncluded = currentPlan?.freeListings ?? 0;
    const freeFeaturedListingsIncluded = currentPlan?.freeFeaturedListings ?? 0;
    const freeListingsRemaining = hasActiveSubscription ? currentPlan?.freeListingsCount ?? 0 : 0;
    const freeFeaturedListingsRemaining = hasActiveSubscription ? currentPlan?.freeFeaturedListingsCount ?? 0 : 0;

    return {
        loading,
        error,
        subscriptions,
        currentSubscription,
        currentPlan,
        lifecycleState,
        hasActiveSubscription,
        isExpiringSoon,
        isExpired,
        daysRemaining,
        freeListingsIncluded,
        freeListingsRemaining,
        freeFeaturedListingsIncluded,
        freeFeaturedListingsRemaining,
        canUseFreeListing: hasActiveSubscription && freeListingsRemaining > 0,
        canUseFreeFeature: hasActiveSubscription && freeFeaturedListingsRemaining > 0,
        refresh: load,
    };
}
