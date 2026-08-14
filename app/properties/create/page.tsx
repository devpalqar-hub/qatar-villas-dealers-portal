"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiCheckCircle, FiAlertTriangle, FiGift, FiInfo } from "react-icons/fi";
import {useTranslations} from "next-intl";
import stepStyles from "@/components/property/create/steps.module.css";
import { AppLayout, Button } from "@/components/ui";
import { propertyService, CreatePropertyPayload, PropertyOptionsResponse } from "@/services/property.service";
import { bulkUploadService } from "@/services/bulkUpload.service";
import { PropertyDraft } from "@/types/bulkUpload";
import { parseDraftFieldWarnings } from "@/utils/draftFieldWarnings";
import { useSubscriptionEntitlements } from "@/hooks/useSubscriptionEntitlements";
import {useRouter, useSearchParams} from "next/navigation";
import Stepper from "@/components/property/create/Stepper";
import Step1BasicInfo from "@/components/property/create/Step1BasicInfo";
import Step2PropertyDetails from "@/components/property/create/Step2PropertyDetails";
import Step3FeaturesAmenities from "@/components/property/create/Step3FeaturesAmenities";
import Step4LocationDetails from "@/components/property/create/Step4LocationDetails";
import Step5MediaGallery from "@/components/property/create/Step5MediaGallery";
import styles from "./page.module.css";

function CreatePropertyPageInner() {
    const t = useTranslations("property");
    const tDraft = useTranslations("bulkUpload.createFromDraft");
    const tBulk = useTranslations("bulkUpload");
    const tSub = useTranslations("subscription");
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draftId");
    const entitlements = useSubscriptionEntitlements();

    const [currentStep, setCurrentStep] = useState(0);
    const [options, setOptions] = useState<PropertyOptionsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [draftLoading, setDraftLoading] = useState(!!draftId);
    const [draftLoadError, setDraftLoadError] = useState<string | null>(null);
    const [draftInfo, setDraftInfo] = useState<PropertyDraft | null>(null);

    const steps = [t("steps.basicInfo"), t("steps.details"), t("steps.features"), t("steps.location"), t("steps.media")];
    const locationRequiredMessage = t("errors.locationRequired");

    const [formData, setFormData] = useState<Partial<CreatePropertyPayload>>({ purpose: "SALE", priceNegotiable: false, contactVerified: false, contactPhone: "", contactWhatsapp: "", extraProperties: { privatePool: false }, amenities: [], nearbyTags: [], photos: [] });

    const draftFieldWarnings = useMemo(() => parseDraftFieldWarnings(draftInfo?.errors), [draftInfo]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await propertyService.getPropertyOptions();
                setOptions(res);
                setFormData((prev) => ({ ...prev, typeId: prev.typeId || res.listingTypes?.[0]?.id, furnishingId: prev.furnishingId || res.furnishingOptions?.[0]?.id, municipalityId: prev.municipalityId || res.municipalities?.[0]?.id }));
            } catch (err) {
                console.error("Failed to load property options:", err);
            }
        };
        void fetchOptions();
    }, []);

    useEffect(() => {
        if (!draftId) return;
        let cancelled = false;
        const fetchDraft = async () => {
            setDraftLoading(true);
            setDraftLoadError(null);
            try {
                const draft = await bulkUploadService.getDraft(draftId);
                if (cancelled) return;
                setDraftInfo(draft);
                setFormData((prev) => ({ ...prev, ...draft.data }));
            } catch (err) {
                console.error("Failed to load bulk-upload draft:", err);
                if (!cancelled) setDraftLoadError(tBulk("openDraftError"));
            } finally {
                if (!cancelled) setDraftLoading(false);
            }
        };
        void fetchDraft();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftId]);

    const updateFormData = (data: Partial<CreatePropertyPayload>) => {
        const nextLatitude = data.latitude ?? formData.latitude;
        const nextLongitude = data.longitude ?? formData.longitude;
        setFormData((prev) => ({ ...prev, ...data }));
        if (nextLatitude !== undefined && nextLongitude !== undefined) setLocationError(null);
    };

    const hasSelectedLocation = () => formData.latitude !== undefined && formData.longitude !== undefined;

    const handleNext = () => {
        if (currentStep === 3 && !hasSelectedLocation()) {
            setError(null);
            setLocationError(locationRequiredMessage);
            return;
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        if (!hasSelectedLocation()) {
            setError(null);
            setLocationError(locationRequiredMessage);
            setCurrentStep(3);
            window.scrollTo(0, 0);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const finalData: CreatePropertyPayload = { propertyName: formData.propertyName || "", description: formData.description || "", purpose: formData.purpose || "SALE", typeId: formData.typeId || "", latitude: formData.latitude as number, longitude: formData.longitude as number, bedrooms: formData.bedrooms ?? 0, bathrooms: formData.bathrooms ?? 0, area: formData.area ?? 0, livingRooms: formData.livingRooms ?? 0, parkingSpaces: formData.parkingSpaces ?? 0, floorNumber: formData.floorNumber ?? 0, totalFloors: formData.totalFloors ?? 0, yearBuilt: formData.yearBuilt, furnishingId: formData.furnishingId || "", extraProperties: formData.extraProperties || { privatePool: false }, price: formData.price ?? 0, priceNegotiable: formData.priceNegotiable ?? false, addressLine1: formData.addressLine1 || "", addressLine2: formData.addressLine2 || "", areaName: formData.areaName || "", municipalityId: formData.municipalityId || "", contactPhone: formData.contactPhone || "+97455512345", contactWhatsapp: formData.contactWhatsapp || "+97455512345", contactVerified: formData.contactVerified ?? false, amenities: formData.amenities || [], nearbyTags: formData.nearbyTags || [], otherFeatures: formData.otherFeatures || "", photos: formData.photos || [] };
            await propertyService.createProperty(finalData);
            setSuccess(true);
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string } } };
            setError(serviceError.response?.data?.message || t("errors.createFailed"));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={stepStyles.successBox}>
                        <FiCheckCircle className={stepStyles.successIcon} />
                        <h1 className={stepStyles.successTitle}>{t("submittedTitle")}</h1>
                        <p className={stepStyles.successText}>{t("submittedText")}</p>
                        <div className={stepStyles.successActions}>
                            <Button variant="secondary" onClick={() => router.push("/properties")}>{t("goToInventory")}</Button>
                            <Button onClick={() => window.location.reload()}>{t("addAnother")}</Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => router.push("/properties")}>
                        <FiArrowLeft /> {t("backToInventory")}
                    </button>
                    <h1 className={styles.title}>{t("createTitle")}</h1>
                    <p className={styles.subtitle}>{t("createSubtitle")}</p>
                </div>

                {!entitlements.loading && (
                    <div
                        className={`${styles.draftBanner} ${
                            entitlements.canUseFreeListing
                                ? styles.draftBannerClean
                                : entitlements.hasActiveSubscription
                                ? styles.draftBannerIssues
                                : styles.entitlementBannerNeutral
                        }`}
                    >
                        {entitlements.canUseFreeListing ? (
                            <FiGift className={styles.draftBannerIcon} size={18} />
                        ) : (
                            <FiInfo className={styles.draftBannerIcon} size={18} />
                        )}
                        <p className={styles.draftBannerText}>
                            {entitlements.canUseFreeListing
                                ? tSub("createProperty.includedWithPlan", {
                                      planName: entitlements.currentSubscription?.plan.name || "",
                                      count: entitlements.freeListingsRemaining,
                                  })
                                : entitlements.hasActiveSubscription
                                ? tSub("createProperty.noFreeListingsLeft", {
                                      planName: entitlements.currentSubscription?.plan.name || "",
                                  })
                                : tSub("createProperty.noSubscriptionNote")}
                            {!entitlements.canUseFreeListing && (
                                <>
                                    {" "}
                                    <Link href="/subscription" className={styles.entitlementBannerLink}>
                                        {tSub("viewAllPlans")}
                                    </Link>
                                </>
                            )}
                        </p>
                    </div>
                )}

                <div className={styles.content}>
                    {draftLoading ? (
                        <div className={styles.draftLoadingCard}>
                            <div className={styles.draftLoadingSpinner} />
                            <span>{t("common.loading")}</span>
                        </div>
                    ) : (
                        <>
                            {draftLoadError && (
                                <div className={`${styles.draftBanner} ${styles.draftBannerIssues}`}>
                                    <FiAlertTriangle className={styles.draftBannerIcon} size={18} />
                                    <p className={styles.draftBannerText}>{draftLoadError}</p>
                                </div>
                            )}

                            {draftInfo && (
                                <div
                                    className={`${styles.draftBanner} ${
                                        draftInfo.errors.length > 0 ? styles.draftBannerIssues : styles.draftBannerClean
                                    }`}
                                >
                                    {draftInfo.errors.length > 0 ? (
                                        <FiAlertTriangle className={styles.draftBannerIcon} size={18} />
                                    ) : (
                                        <FiCheckCircle className={styles.draftBannerIcon} size={18} />
                                    )}
                                    <div>
                                        <p className={styles.draftBannerTitle}>
                                            {tDraft("banner", { row: draftInfo.rowNumber })}
                                        </p>
                                        <p className={styles.draftBannerText}>
                                            {draftInfo.errors.length > 0
                                                ? tDraft("bannerIssues", { count: draftInfo.errors.length })
                                                : tDraft("bannerClean")}
                                        </p>
                                        {draftInfo.errors.length > 0 && (
                                            <ul className={styles.draftBannerErrors}>
                                                {draftInfo.errors.map((issue, i) => (
                                                    <li key={i}>{issue}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Stepper steps={steps} currentStep={currentStep} />
                            <div className={stepStyles.stepBody}>
                                {currentStep === 0 && <Step1BasicInfo formData={formData} updateFormData={updateFormData} options={options} draftFieldWarnings={draftFieldWarnings} />}
                                {currentStep === 1 && <Step2PropertyDetails formData={formData} updateFormData={updateFormData} options={options} draftFieldWarnings={draftFieldWarnings} />}
                                {currentStep === 2 && <Step3FeaturesAmenities formData={formData} updateFormData={updateFormData} options={options} draftFieldWarnings={draftFieldWarnings} />}
                                {currentStep === 3 && <Step4LocationDetails formData={formData} updateFormData={updateFormData} options={options} locationError={locationError} draftFieldWarnings={draftFieldWarnings} />}
                                {currentStep === 4 && <Step5MediaGallery formData={formData} updateFormData={updateFormData} options={options} draftFieldWarnings={draftFieldWarnings} />}
                            </div>
                            {error && <div className={stepStyles.errorBanner}>{error}</div>}
                            <div className={styles.footer}>
                                <Button variant="secondary" onClick={handlePrev} disabled={currentStep === 0 || loading}>{t("buttons.back")}</Button>
                                {currentStep < steps.length - 1 ? <Button onClick={handleNext}>{t("buttons.nextStep")}</Button> : <Button onClick={handleSubmit} loading={loading} loadingLabel={t("common.loading")}><FiSave /> {t("buttons.submit")}</Button>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export default function CreatePropertyPage() {
    return (
        <Suspense fallback={null}>
            <CreatePropertyPageInner />
        </Suspense>
    );
}
