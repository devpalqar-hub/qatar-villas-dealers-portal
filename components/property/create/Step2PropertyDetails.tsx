"use client";

import React from "react";
import {useTranslations} from "next-intl";
import {FiAlertTriangle, FiDollarSign, FiSliders} from "react-icons/fi";
import {Input, Switch} from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import {StepProps} from "./types";

export default function Step2PropertyDetails({formData, updateFormData, options, draftFieldWarnings}: StepProps) {
    const t = useTranslations("property");
    const tDraft = useTranslations("bulkUpload.createFromDraft");
    const availableFurnishing = options?.furnishingOptions ? options.furnishingOptions : [];
    const furnishingWarnings = draftFieldWarnings?.furnishingId;

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>{t("step", {number: 2, title: t("steps.details")})}</h2>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiDollarSign size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.pricing")}</span>
                        <span className={s.sectionHint}>{t("form.sections.pricingHint")}</span>
                    </div>
                </div>
                <div className={pageStyles.formGrid}>
                    <Input label={t("form.price")} type="number" placeholder={t("form.pricePlaceholder")} value={formData.price || ""} onChange={(e) => updateFormData({price: Number(e.target.value)})} required />
                </div>
                <div className={s.switchPanel}>
                    <Switch
                        id="priceNegotiable"
                        checked={formData.priceNegotiable || false}
                        onChange={(checked) => updateFormData({priceNegotiable: checked})}
                        label={t("form.priceNegotiable")}
                        description={t("form.priceNegotiableHint")}
                    />
                </div>
            </div>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiSliders size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.specs")}</span>
                        <span className={s.sectionHint}>{t("form.sections.specsHint")}</span>
                    </div>
                </div>
                <div className={pageStyles.formGrid}>
                    <Input label={t("form.area")} type="number" placeholder={t("form.areaPlaceholder")} value={formData.area || ""} onChange={(e) => updateFormData({area: Number(e.target.value)})} required />

                    <div>
                        <label className={pageStyles.label}>{t("form.furnishingStatus")} <span className={pageStyles.required}>*</span></label>
                        <select className={s.select} value={formData.furnishingId || ""} onChange={(e) => updateFormData({furnishingId: e.target.value})} required>
                            <option value="">{t("form.selectOption")}</option>
                            {availableFurnishing.map((opt) => <option key={opt.id} value={opt.id}>{opt.title}</option>)}
                        </select>
                        {furnishingWarnings && furnishingWarnings.length > 0 && (
                            <div className={s.fieldWarning}>
                                <FiAlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>
                                    <strong>{tDraft("fieldWarning")}:</strong> {furnishingWarnings.join(" ")}
                                </span>
                            </div>
                        )}
                    </div>

                    <Input label={t("form.bedrooms")} type="number" placeholder="4" value={formData.bedrooms || ""} onChange={(e) => updateFormData({bedrooms: Number(e.target.value)})} required />
                    <Input label={t("form.bathrooms")} type="number" placeholder="3" value={formData.bathrooms || ""} onChange={(e) => updateFormData({bathrooms: Number(e.target.value)})} required />
                    <Input label={t("form.livingRooms")} type="number" placeholder="2" value={formData.livingRooms || ""} onChange={(e) => updateFormData({livingRooms: Number(e.target.value)})} />
                    <Input label={t("form.parkingSpaces")} type="number" placeholder="2" value={formData.parkingSpaces || ""} onChange={(e) => updateFormData({parkingSpaces: Number(e.target.value)})} />
                    <Input label={t("form.floorNumber")} type="number" placeholder="5" value={formData.floorNumber || ""} onChange={(e) => updateFormData({floorNumber: Number(e.target.value)})} />
                    <Input label={t("form.totalFloors")} type="number" placeholder="20" value={formData.totalFloors || ""} onChange={(e) => updateFormData({totalFloors: Number(e.target.value)})} />
                    <Input label={t("form.yearBuilt")} type="number" placeholder="2019" value={formData.yearBuilt || ""} onChange={(e) => updateFormData({yearBuilt: Number(e.target.value)})} />
                </div>
            </div>
        </div>
    );
}
