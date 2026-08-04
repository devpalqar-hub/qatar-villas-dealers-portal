"use client";

import React from "react";
import {useTranslations} from "next-intl";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { MunicipalityOption } from "@/services/property.service";
import LocationPicker from "./LocationPicker";
import { StepProps } from "./types";

export default function Step4LocationDetails({ formData, updateFormData, options, locationError }: StepProps) {
    const t = useTranslations("property");
    const availableMunicipalities = options?.municipalities ?? [];
    const availableNearby = options?.nearbyTags ?? [];

    const selectedMunicipality = availableMunicipalities.find((municipality) => municipality.id === formData.municipalityId);
    const municipalityCenter = selectedMunicipality?.latitude !== undefined && selectedMunicipality.longitude !== undefined ? { latitude: selectedMunicipality.latitude, longitude: selectedMunicipality.longitude } : null;

    const handleNearbyTagToggle = (tagId: string) => {
        const currentTags = formData.nearbyTags || [];
        if (currentTags.includes(tagId)) updateFormData({ nearbyTags: currentTags.filter((tId) => tId !== tagId) });
        else updateFormData({ nearbyTags: [...currentTags, tagId] });
    };

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>{t("step", {number: 4, title: t("steps.location")})}</h2>
            <div className={pageStyles.formGrid}>
                <div className={pageStyles.fullWidth}>
                    <Input label={t("form.addressLine1")} placeholder={t("form.addressLine1Placeholder")} value={formData.addressLine1 || ""} onChange={(e) => updateFormData({ addressLine1: e.target.value })} required />
                </div>

                <div className={pageStyles.fullWidth}>
                    <Input label={t("form.addressLine2")} placeholder={t("form.addressLine2Placeholder")} value={formData.addressLine2 || ""} onChange={(e) => updateFormData({ addressLine2: e.target.value })} />
                </div>

                <div>
                    <label className={pageStyles.label}>{t("form.areaName")} <span className={pageStyles.required}>*</span></label>
                    <Input placeholder={t("form.areaNamePlaceholder")} value={formData.areaName || ""} onChange={(e) => updateFormData({ areaName: e.target.value })} required />
                </div>

                <div>
                    <label className={pageStyles.label}>{t("form.municipality")} <span className={pageStyles.required}>*</span></label>
                    <select className={s.select} value={formData.municipalityId || ""} onChange={(e) => updateFormData({ municipalityId: e.target.value })} required>
                        <option value="" disabled>{t("form.selectMunicipality")}</option>
                        {availableMunicipalities.map((municipality: MunicipalityOption) => <option key={municipality.id} value={municipality.id}>{municipality.name}</option>)}
                    </select>
                </div>

                <div className={pageStyles.fullWidth}>
                    <LocationPicker latitude={formData.latitude} longitude={formData.longitude} municipalityCenter={municipalityCenter} onLocationChange={(latitude, longitude) => updateFormData({ latitude, longitude })} error={locationError} />
                </div>

                <div className={pageStyles.fullWidth}>
                    <label className={pageStyles.label}>{t("form.nearbyFacilities")}</label>
                    <div className={s.nearbyGrid}>
                        {availableNearby.map((tag) => (
                            <label key={tag.id} className={s.tagLabel}>
                                <input type="checkbox" className={s.checkbox} checked={(formData.nearbyTags || []).includes(tag.id)} onChange={() => handleNearbyTagToggle(tag.id)} />
                                {tag.title}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
