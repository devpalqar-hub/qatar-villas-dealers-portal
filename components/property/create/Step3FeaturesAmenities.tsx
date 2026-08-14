"use client";

import React from "react";
import {useTranslations} from "next-intl";
import {FiAlertTriangle, FiStar, FiGrid, FiEdit3} from "react-icons/fi";
import {Input, MultiSelect, Switch} from "@/components/ui";
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

export default function Step3FeaturesAmenities({ formData, updateFormData, options, draftFieldWarnings }: StepProps) {
    const t = useTranslations("property");
    const tDraft = useTranslations("bulkUpload.createFromDraft");
    const availableAmenities = (options?.amenities && options.amenities.length > 0) ? options.amenities : DEFAULT_AMENITIES;
    const amenityWarnings = draftFieldWarnings?.amenities;

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>{t("step", {number: 3, title: t("steps.features")})}</h2>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiStar size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.specialFeatures")}</span>
                        <span className={s.sectionHint}>{t("form.sections.specialFeaturesHint")}</span>
                    </div>
                </div>
                <div className={s.switchPanel}>
                    <Switch
                        id="privatePool"
                        checked={formData.extraProperties?.privatePool || false}
                        onChange={(checked) => updateFormData({ extraProperties: { ...formData.extraProperties, privatePool: checked }})}
                        label={t("form.privatePool")}
                        description={t("form.privatePoolHint")}
                    />
                </div>
                <div className={pageStyles.formGrid}>
                    <Input label={t("form.gardenArea")} type="number" placeholder="200" value={formData.extraProperties?.gardenAreaSqm || ""} onChange={(e) => updateFormData({ extraProperties: { ...formData.extraProperties, gardenAreaSqm: Number(e.target.value) }})} />
                </div>
            </div>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiGrid size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.amenities")}</span>
                        <span className={s.sectionHint}>{t("form.sections.amenitiesHint")}</span>
                    </div>
                </div>
                <MultiSelect
                    label={t("form.amenities")}
                    placeholder={t("form.amenitiesPlaceholder")}
                    searchPlaceholder={t("form.searchAmenities")}
                    emptyText={t("form.noAmenitiesFound")}
                    clearAllLabel={t("form.clearSelection")}
                    options={availableAmenities.map((a) => ({ id: a.id, title: a.title }))}
                    selectedIds={formData.amenities || []}
                    onChange={(ids) => updateFormData({ amenities: ids })}
                />
                {amenityWarnings && amenityWarnings.length > 0 && (
                    <div className={s.fieldWarning}>
                        <FiAlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>
                            <strong>{tDraft("fieldWarning")}:</strong> {amenityWarnings.join(" ")}
                        </span>
                    </div>
                )}
            </div>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiEdit3 size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.notes")}</span>
                        <span className={s.sectionHint}>{t("form.sections.notesHint")}</span>
                    </div>
                </div>
                <div className={pageStyles.formGrid}>
                    <div className={pageStyles.fullWidth}>
                        <Input label={t("form.otherFeatures")} placeholder={t("form.otherFeaturesPlaceholder")} value={formData.otherFeatures || ""} onChange={(e) => updateFormData({ otherFeatures: e.target.value })} />
                    </div>
                </div>
            </div>
        </div>
    );
}
