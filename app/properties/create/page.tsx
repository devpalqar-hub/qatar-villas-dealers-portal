"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiCheckCircle } from "react-icons/fi";
import stepStyles from "@/components/property/create/steps.module.css";
import { AppLayout, Button } from "@/components/ui";
import { propertyService, CreatePropertyPayload, PropertyOptionsResponse } from "@/services/property.service";
import Stepper from "@/components/property/create/Stepper";
import Step1BasicInfo from "@/components/property/create/Step1BasicInfo";
import Step2PropertyDetails from "@/components/property/create/Step2PropertyDetails";
import Step3FeaturesAmenities from "@/components/property/create/Step3FeaturesAmenities";
import Step4LocationDetails from "@/components/property/create/Step4LocationDetails";
import Step5MediaGallery from "@/components/property/create/Step5MediaGallery";
import styles from "./page.module.css";

const STEPS = [
    "Basic Info",
    "Details",
    "Features",
    "Location",
    "Media"
];

export default function CreatePropertyPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [options, setOptions] = useState<PropertyOptionsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Initial empty state matching payload
    const [formData, setFormData] = useState<Partial<CreatePropertyPayload>>({
        purpose: "SALE",
        type: "VILLA",
        furnishingStatus: "",
        priceNegotiable: false,
        contactVerified: false,
        extraProperties: { privatePool: false },
        amenities: [],
        nearbyTags: [],
        photos: [],
        municipality: "DOHA",
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await propertyService.getPropertyOptions();
                setOptions(res);
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchOptions();
    }, []);

    const updateFormData = (data: Partial<CreatePropertyPayload>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleNext = () => {
        // Basic validation can be added here
        if (currentStep < STEPS.length - 1) {
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
        setLoading(true);
        setError(null);
        try {
            // Need to append default contact info since it's required by backend 
            // In a real app this might come from the dealer's profile
            const finalData = {
                ...formData,
                contactPhone: formData.contactPhone || "+97400000000",
                contactWhatsapp: formData.contactWhatsapp || "+97400000000",
            } as CreatePropertyPayload;

            await propertyService.createProperty(finalData);
            setSuccess(true);
        } catch (err: any) {
            console.error("Failed to create property:", err);
            setError(err.response?.data?.message || "An error occurred while creating the property.");
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
                        <h1 className={stepStyles.successTitle}>Property Submitted!</h1>
                        <p className={stepStyles.successText}>
                            Your property listing has been successfully submitted and is now pending admin approval. You can track its status in your inventory.
                        </p>
                        <div className={stepStyles.successActions}>
                            <Button variant="secondary" onClick={() => router.push("/properties")}>
                                Go to Inventory
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Add Another
                            </Button>
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
                        <FiArrowLeft /> Back to Inventory
                    </button>
                    <h1 className={styles.title}>Add New Property</h1>
                    <p className={styles.subtitle}>Fill in the details to create a new property listing.</p>
                </div>

                <div className={styles.content}>
                    <Stepper steps={STEPS} currentStep={currentStep} />

                    <div className={stepStyles.stepBody}>
                        {currentStep === 0 && (
                            <Step1BasicInfo formData={formData} updateFormData={updateFormData} options={options} />
                        )}
                        {currentStep === 1 && (
                            <Step2PropertyDetails formData={formData} updateFormData={updateFormData} options={options} />
                        )}
                        {currentStep === 2 && (
                            <Step3FeaturesAmenities formData={formData} updateFormData={updateFormData} options={options} />
                        )}
                        {currentStep === 3 && (
                            <Step4LocationDetails formData={formData} updateFormData={updateFormData} options={options} />
                        )}
                        {currentStep === 4 && (
                            <Step5MediaGallery formData={formData} updateFormData={updateFormData} options={options} />
                        )}
                    </div>

                    {error && (
                        <div className={stepStyles.errorBanner}>
                            {error}
                        </div>
                    )}

                    <div className={styles.footer}>
                        <Button 
                            variant="secondary" 
                            onClick={handlePrev} 
                            disabled={currentStep === 0 || loading}
                        >
                            Back
                        </Button>

                        {currentStep < STEPS.length - 1 ? (
                            <Button onClick={handleNext}>
                                Next Step
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} loading={loading}>
                                <FiSave /> Submit Property
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
