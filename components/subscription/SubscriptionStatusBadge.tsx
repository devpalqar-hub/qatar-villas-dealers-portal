"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";
import { SubscriptionLifecycleState } from "@/utils/subscriptionStatus";

interface SubscriptionStatusBadgeProps {
    state: SubscriptionLifecycleState;
}

const VARIANT_BY_STATE: Record<SubscriptionLifecycleState, "success" | "warning" | "danger" | "default"> = {
    ACTIVE: "success",
    EXPIRING_SOON: "warning",
    EXPIRED: "danger",
    NONE: "default",
};

export default function SubscriptionStatusBadge({ state }: SubscriptionStatusBadgeProps) {
    const t = useTranslations("subscription.status");
    return <Badge variant={VARIANT_BY_STATE[state]}>{t(state)}</Badge>;
}
