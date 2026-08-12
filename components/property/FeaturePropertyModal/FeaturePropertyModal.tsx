"use client";

import React, { useEffect, useState } from "react";
import {
    FiStar,
    FiX,
    FiCheck,
    FiCalendar,
    FiHome,
    FiList,
    FiFileText,
    FiAlertTriangle,
    FiCheckCircle,
    FiLock,
    FiGift,
    FiArrowRight,
    FiRefreshCw,
} from "react-icons/fi";
import { featuredService } from "@/services/featured.service";
import { FeaturedLocation, FeaturedPlan } from "@/types/featured";
import styles from "./FeaturePropertyModal.module.css";

interface FeaturePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    propertyName: string;
    isCurrentlyFeatured?: boolean;
    onFeatured?: () => void;
}

const LOCATION_META: Record<FeaturedLocation, { label: string; icon: React.ReactNode }> = {
    HOME_PAGE: { label: "Home Page", icon: <FiHome /> },
    LISTING_PAGE: { label: "Listings Page", icon: <FiList /> },
    PROPERTY_DETAIL_PAGE: { label: "Property Detail Page", icon: <FiFileText /> },
};

const formatQar = (amount: number) => `QAR ${amount.toLocaleString()}`;

const isPlanFree = (plan: FeaturedPlan) =>
    plan.discountedPrice <= 0 || (plan.isIncludedFree && plan.availableFreeFeatured > 0);

export default function FeaturePropertyModal({
    isOpen,
    onClose,
    listingId,
    propertyName,
    isCurrentlyFeatured = false,
    onFeatured,
}: FeaturePropertyModalProps) {
    const [plans, setPlans] = useState<FeaturedPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fetchPlans = async () => {
        setLoading(true);
        setLoadError(null);
        setSuccess(false);
        setSubmitError(null);
        setSelectedPlanId(null);
        try {
            const data = await featuredService.getDealerPlans();
            setPlans(data || []);
            if (data && data.length > 0) {
                setSelectedPlanId(data[0].id);
            }
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string | string[] } } };
            const apiMessage = serviceError?.response?.data?.message || "Failed to load featured plans. Please try again.";
            setLoadError(Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reload plans each time the modal opens
            void fetchPlans();
        }
    }, [isOpen]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || null;

    const handleSubmit = async () => {
        if (!selectedPlan || submitting) return;
        setSubmitError(null);
        setSubmitting(true);

        try {
            if (isPlanFree(selectedPlan)) {
                await featuredService.featureListingForFree(listingId, selectedPlan.id);
                setSuccess(true);
                onFeatured?.();
                setTimeout(() => {
                    onClose();
                }, 1800);
            } else {
                const checkout = await featuredService.createCheckoutSession(listingId, selectedPlan.id);
                const redirectUrl = checkout?.url;
                if (redirectUrl) {
                    window.location.assign(redirectUrl);
                } else {
                    setSubmitError("Could not start checkout. Please try again.");
                    setSubmitting(false);
                }
            }
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string | string[] } } };
            const apiMessage = serviceError?.response?.data?.message || "Something went wrong. Please try again.";
            setSubmitError(Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage);
            setSubmitting(false);
        }
    };

    const selectedIsFree = selectedPlan ? isPlanFree(selectedPlan) : false;

    return (
        <div className={styles.backdrop} onClick={handleClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="feature-modal-title"
            >
                <div className={styles.header}>
                    <div className={styles.headerTitleContainer}>
                        <div className={styles.iconBadge}>
                            <FiStar size={18} />
                        </div>
                        <div>
                            <h2 id="feature-modal-title" className={styles.title}>
                                Feature This Property
                            </h2>
                            <p className={styles.subtitle}>
                                Boost visibility for <span className={styles.propertyName}>{propertyName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {success ? (
                    <div className={styles.successState}>
                        <FiCheckCircle size={48} className={styles.successIcon} />
                        <h3>Property Featured!</h3>
                        <p>
                            <strong>{propertyName}</strong> is now featured with the{" "}
                            <strong>{selectedPlan?.name}</strong> plan.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.body}>
                            {isCurrentlyFeatured && (
                                <div className={styles.infoBanner}>
                                    <FiStar size={16} />
                                    <span>
                                        This property is already featured. Choosing a plan below will extend or
                                        renew its featured placement.
                                    </span>
                                </div>
                            )}

                            {loading && (
                                <div className={styles.plansGrid}>
                                    {Array.from({ length: 2 }).map((_, idx) => (
                                        <div key={`shimmer-${idx}`} className={styles.shimmerCard}>
                                            <div className={styles.shimmerLine} style={{ width: "50%", height: 16 }} />
                                            <div className={styles.shimmerLine} style={{ width: "35%", height: 28, marginTop: 12 }} />
                                            <div className={styles.shimmerLine} style={{ width: "70%", height: 14, marginTop: 16 }} />
                                            <div className={styles.shimmerLine} style={{ width: "90%", height: 32, marginTop: 16 }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && loadError && (
                                <div className={styles.loadErrorState}>
                                    <FiAlertTriangle size={28} />
                                    <p>{loadError}</p>
                                    <button type="button" className={styles.retryBtn} onClick={fetchPlans}>
                                        <FiRefreshCw size={14} /> Try Again
                                    </button>
                                </div>
                            )}

                            {!loading && !loadError && plans.length === 0 && (
                                <div className={styles.loadErrorState}>
                                    <FiAlertTriangle size={28} />
                                    <p>No featured plans are available right now.</p>
                                </div>
                            )}

                            {!loading && !loadError && plans.length > 0 && (
                                <div className={styles.plansGrid}>
                                    {plans.map((plan) => {
                                        const free = isPlanFree(plan);
                                        const isSelected = plan.id === selectedPlanId;
                                        const hasDiscount = plan.discountPercent > 0 && !free;

                                        return (
                                            <button
                                                type="button"
                                                key={plan.id}
                                                className={`${styles.planCard} ${isSelected ? styles.planCardSelected : ""}`}
                                                onClick={() => setSelectedPlanId(plan.id)}
                                            >
                                                {free && <div className={styles.ribbonFree}>FREE</div>}
                                                {hasDiscount && (
                                                    <div className={styles.ribbonDiscount}>-{plan.discountPercent}%</div>
                                                )}

                                                <div className={styles.planRadio}>
                                                    {isSelected && <FiCheck size={13} />}
                                                </div>

                                                <span className={styles.planName}>{plan.name}</span>

                                                <div className={styles.priceRow}>
                                                    {free ? (
                                                        <span className={styles.priceFree}>Free</span>
                                                    ) : (
                                                        <>
                                                            <span className={styles.priceAmount}>
                                                                {formatQar(plan.discountedPrice)}
                                                            </span>
                                                            {hasDiscount && (
                                                                <span className={styles.priceStrike}>
                                                                    {formatQar(plan.actualPrice)}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div className={styles.durationBadge}>
                                                    <FiCalendar size={12} />
                                                    <span>{plan.durationDays} Days Boost</span>
                                                </div>

                                                <div className={styles.locationsList}>
                                                    {plan.locations.map((location) => (
                                                        <span key={location} className={styles.locationChip}>
                                                            {LOCATION_META[location]?.icon}
                                                            {LOCATION_META[location]?.label || location}
                                                        </span>
                                                    ))}
                                                </div>

                                                {plan.isIncludedFree && plan.availableFreeFeatured > 0 && (
                                                    <div className={styles.freeNote}>
                                                        <FiGift size={12} />
                                                        {plan.availableFreeFeatured} free feature
                                                        {plan.availableFreeFeatured > 1 ? "s" : ""} included in your
                                                        subscription
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {submitError && (
                                <div className={styles.errorBox}>
                                    <FiAlertTriangle size={18} />
                                    <span>{submitError}</span>
                                </div>
                            )}
                        </div>

                        {!loading && !loadError && plans.length > 0 && (
                            <div className={styles.footer}>
                                <div className={styles.footerNote}>
                                    {selectedIsFree ? (
                                        <span>
                                            <FiGift size={13} /> No charge — this plan will be applied instantly.
                                        </span>
                                    ) : (
                                        <span>
                                            <FiLock size={13} /> Secure payment powered by Stripe.
                                        </span>
                                    )}
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={handleClose}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.submitBtn}
                                        onClick={handleSubmit}
                                        disabled={submitting || !selectedPlan}
                                    >
                                        {submitting ? (
                                            "Processing..."
                                        ) : selectedIsFree ? (
                                            <>
                                                <FiStar size={14} /> Feature Now, Free
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Payment
                                                {selectedPlan && ` · ${formatQar(selectedPlan.discountedPrice)}`}
                                                <FiArrowRight size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
