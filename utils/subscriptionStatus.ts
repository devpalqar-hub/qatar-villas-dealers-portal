import { DealerSubscription } from "@/types/subscription";

/**
 * Centralized subscription business rules. The backend owns the actual
 * `paymentStatus` values; the frontend only needs to know which of them do
 * NOT represent a successfully paid/activated subscription record, so a
 * subscription is never treated as usable purely because its start/end
 * dates overlap "today".
 */
const UNSUCCESSFUL_PAYMENT_STATUSES = new Set([
    "PENDING",
    "FAILED",
    "CANCELLED",
    "CANCELED",
    "EXPIRED",
    "REFUNDED",
]);

export function isSuccessfulSubscriptionPayment(status: string | null | undefined): boolean {
    if (!status) return false;
    return !UNSUCCESSFUL_PAYMENT_STATUSES.has(status.toUpperCase());
}

/** Number of days before expiry that a subscription is considered "expiring soon". */
export const EXPIRY_WARNING_THRESHOLD_DAYS = 7;

export function daysUntil(dateIso: string): number {
    const now = new Date();
    const target = new Date(dateIso);
    const diffMs = target.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export type SubscriptionLifecycleState = "NONE" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";

/**
 * Picks the subscription record most relevant to "what is the dealer's
 * current plan" — the successfully-paid record with the furthest-out
 * `endDate` — regardless of whether it has already lapsed. Callers combine
 * this with `daysUntil(endDate)` to know whether it's active, expiring, or
 * expired. Never picks `subscriptions[0]`; date/status only.
 */
export function pickRelevantSubscription(subscriptions: DealerSubscription[]): DealerSubscription | null {
    const successful = subscriptions.filter((s) => isSuccessfulSubscriptionPayment(s.paymentStatus));
    if (successful.length === 0) return null;

    return successful.reduce((latest, current) =>
        new Date(current.endDate).getTime() > new Date(latest.endDate).getTime() ? current : latest
    );
}

export function getSubscriptionLifecycleState(subscription: DealerSubscription | null): SubscriptionLifecycleState {
    if (!subscription) return "NONE";
    const remaining = daysUntil(subscription.endDate);
    if (remaining < 0) return "EXPIRED";
    if (remaining <= EXPIRY_WARNING_THRESHOLD_DAYS) return "EXPIRING_SOON";
    return "ACTIVE";
}
