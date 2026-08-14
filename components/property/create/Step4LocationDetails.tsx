"use client";

import React from "react";
import {useTranslations} from "next-intl";
import { FiAlertTriangle, FiMapPin, FiMap, FiNavigation } from "react-icons/fi";
import { Input, MultiSelect } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { MunicipalityOption } from "@/services/property.service";
import LocationPicker from "./LocationPicker";
import { StepProps } from "./types";

export default function Step4LocationDetails({ formData, updateFormData, options, locationError, draftFieldWarnings }: StepProps) {
    const t = useTranslations("property");
    const tDraft = useTranslations("bulkUpload.createFromDraft");
    const availableMunicipalities = options?.municipalities ?? [];
    const availableNearby = options?.nearbyTags ?? [];
    const nearbyWarnings = draftFieldWarnings?.nearbyTags;

    const selectedMunicipality = availableMunicipalities.find((municipality) => municipality.id === formData.municipalityId);
    const municipalityCenter = selectedMunicipality?.latitude !== undefined && selectedMunicipality.longitude !== undefined ? { latitude: selectedMunicipality.latitude, longitude: selectedMunicipality.longitude } : null;

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>{t("step", {number: 4, title: t("steps.location")})}</h2>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiMapPin size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.address")}</span>
                        <span className={s.sectionHint}>{t("form.sections.addressHint")}</span>
                    </div>
                </div>
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
                </div>
            </div>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiMap size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.map")}</span>
                        <span className={s.sectionHint}>{t("form.sections.mapHint")}</span>
                    </div>
                </div>
                <LocationPicker latitude={formData.latitude} longitude={formData.longitude} municipalityCenter={municipalityCenter} onLocationChange={(latitude, longitude) => updateFormData({ latitude, longitude })} error={locationError} />
            </div>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiNavigation size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.nearby")}</span>
                        <span className={s.sectionHint}>{t("form.sections.nearbyHint")}</span>
                    </div>
                </div>
                <MultiSelect
                    label={t("form.nearbyFacilities")}
                    placeholder={t("form.nearbyPlaceholder")}
                    searchPlaceholder={t("form.searchNearby")}
                    emptyText={t("form.noNearbyFound")}
                    clearAllLabel={t("form.clearSelection")}
                    options={availableNearby.map((tag) => ({ id: tag.id, title: tag.title }))}
                    selectedIds={formData.nearbyTags || []}
                    onChange={(ids) => updateFormData({ nearbyTags: ids })}
                />
                {nearbyWarnings && nearbyWarnings.length > 0 && (
                    <div className={s.fieldWarning}>
                        <FiAlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>
                            <strong>{tDraft("fieldWarning")}:</strong> {nearbyWarnings.join(" ")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
