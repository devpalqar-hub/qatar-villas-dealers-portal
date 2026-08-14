"use client";

import React from "react";
import {useTranslations} from "next-intl";
import {FiFileText, FiTag, FiPhone} from "react-icons/fi";
import {Input, Switch} from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import {StepProps} from "./types";

export default function Step1BasicInfo({formData, updateFormData, options }: StepProps) {
    const t = useTranslations("property");
    const tPurpose = useTranslations("purposeEnum");

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>{t("step", {number: 1, title: t("steps.basicInfo")})}</h2>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiFileText size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.basics")}</span>
                        <span className={s.sectionHint}>{t("form.sections.basicsHint")}</span>
                    </div>
                </div>
                <div className={pageStyles.formGrid}>
                    <div className={pageStyles.fullWidth}>
                        <Input label={t("form.propertyName")} placeholder={t("form.propertyNamePlaceholder")} value={formData.propertyName || ""} onChange={(e) => updateFormData({ propertyName: e.target.value })} required />
                    </div>
                    <div className={pageStyles.fullWidth}>
                        <label className={pageStyles.label}>{t("form.description")} <span className={pageStyles.required}>*</span></label>
                        <textarea className={s.textarea} rows={4} placeholder={t("form.descriptionPlaceholder")} value={formData.description || ""} onChange={(e) => updateFormData({ description: e.target.value })} required />
                    </div>
                </div>
            </div>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiTag size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.category")}</span>
                        <span className={s.sectionHint}>{t("form.sections.categoryHint")}</span>
                    </div>
                </div>
                <div className={pageStyles.formGrid}>
                    <div>
                        <label className={pageStyles.label}>{t("form.purpose")} <span className={pageStyles.required}>*</span></label>
                        <select className={s.select} value={formData.purpose || "SALE"} onChange={(e) => updateFormData({ purpose: e.target.value as "SALE" | "RENT" })}>
                            <option value="SALE">{tPurpose("SALE")}</option>
                            <option value="RENT">{tPurpose("RENT")}</option>
                        </select>
                    </div>
                    <div>
                        <label className={pageStyles.label}>{t("filters.type")} <span className={pageStyles.required}>*</span></label>
                        <select className={s.select} value={formData.typeId || ""} onChange={(e) => updateFormData({ typeId: e.target.value })}>
                            <option value="" disabled>{t("form.selectPropertyType")}</option>
                            {options?.listingTypes?.map((type) => <option key={type.id} value={type.id}>{type.title}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className={s.sectionBlock}>
                <div className={s.sectionHeading}>
                    <span className={s.sectionHeadingIcon}><FiPhone size={16} /></span>
                    <div className={s.sectionHeadingText}>
                        <span className={s.sectionTitle}>{t("form.sections.contact")}</span>
                        <span className={s.sectionHint}>{t("form.sections.contactHint")}</span>
                    </div>
                </div>
                <div className={pageStyles.formGrid}>
                    <Input label={t("form.contactPhone")} placeholder={t("form.contactPhonePlaceholder")} value={formData.contactPhone || ""} onChange={(e) => updateFormData({ contactPhone: e.target.value })} required />
                    <Input label={t("form.contactWhatsapp")} placeholder={t("form.contactWhatsappPlaceholder")} value={formData.contactWhatsapp || ""} onChange={(e) => updateFormData({ contactWhatsapp: e.target.value })} />
                </div>
                <div className={s.switchPanel}>
                    <Switch
                        id="contactVerified"
                        checked={formData.contactVerified || false}
                        onChange={(checked) => updateFormData({ contactVerified: checked })}
                        label={t("form.contactVerified")}
                        description={t("form.contactVerifiedHint")}
                    />
                </div>
            </div>
        </div>
    );
}
