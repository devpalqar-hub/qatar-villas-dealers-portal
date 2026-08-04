"use client";

import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import {StepProps} from "./types";

const DEFAULT_AMENITIES = [
    { id: "cuid1", title: "Private Swimming Pool" },
    { id: "cuid2", title: "Landscaped Garden" },
    { id: "cuid3", title: "Gym / Fitness Center" },
    { id: "cuid4", title: "Security System" },
    { id: "cuid5", title: "Maid's Room" },
    { id: "cuid6", title: "Central AC" },
];

export default function Step3FeaturesAmenities({ formData, updateFormData, options }: StepProps) {
    const t = useTranslations("property");
    const availableAmenities = (options?.amenities && options.amenities.length > 0) ? options.amenities : DEFAULT_AMENITIES;

    const handleAmenityToggle = (amenityId: string) => {
        const currentAmenities = formData.amenities || [];
        if (currentAmenities.includes(amenityId)) updateFormData({ amenities: currentAmenities.filter((a) => a !== amenityId) });
        else updateFormData({ amenities: [...currentAmenities, amenityId] });
    };

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>{t("step", {number: 3, title: t("steps.features")})}</h2>
            <div className={pageStyles.formGrid}>
                <div className={s.checkboxGroup}>
                    <label className={s.checkboxLabel}>
                        <input type="checkbox" className={s.checkbox} checked={formData.extraProperties?.privatePool || false} onChange={(e) => updateFormData({ extraProperties: { ...formData.extraProperties, privatePool: e.target.checked }})} />
                        {t("form.privatePool")}
                    </label>
                </div>

                <Input label={t("form.gardenArea")} type="number" placeholder="200" value={formData.extraProperties?.gardenAreaSqm || ""} onChange={(e) => updateFormData({ extraProperties: { ...formData.extraProperties, gardenAreaSqm: Number(e.target.value) }})} />

                <div className={pageStyles.fullWidth}>
                    <label className={pageStyles.label}>{t("form.amenities")}</label>
                    <div className={s.tagGrid}>
                        {availableAmenities.map((amenity) => (
                            <label key={amenity.id} className={s.tagLabel}>
                                <input type="checkbox" className={s.checkbox} checked={(formData.amenities || []).includes(amenity.id)} onChange={() => handleAmenityToggle(amenity.id)} />
                                {amenity.title}
                            </label>
                        ))}
                    </div>
                </div>

                <div className={pageStyles.fullWidth}>
                    <Input label={t("form.otherFeatures")} placeholder={t("form.otherFeaturesPlaceholder")} value={formData.otherFeatures || ""} onChange={(e) => updateFormData({ otherFeatures: e.target.value })} />
                </div>
            </div>
        </div>
    );
}
