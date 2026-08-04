"use client";

import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import {StepProps} from "./types";

export default function Step1BasicInfo({formData, updateFormData, options }: StepProps) {
    const t = useTranslations("property");
    const tPurpose = useTranslations("purposeEnum");

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>{t("step", {number: 1, title: t("steps.basicInfo")})}</h2>
            <div className={pageStyles.formGrid}>
                <div className={pageStyles.fullWidth}>
                    <Input label={t("form.propertyName")} placeholder={t("form.propertyNamePlaceholder")} value={formData.propertyName || ""} onChange={(e) => updateFormData({ propertyName: e.target.value })} required />
                </div>
                <div className={pageStyles.fullWidth}>
                    <label className={pageStyles.label}>{t("form.description")} <span className={pageStyles.required}>*</span></label>
                    <textarea className={s.textarea} rows={4} placeholder={t("form.descriptionPlaceholder")} value={formData.description || ""} onChange={(e) => updateFormData({ description: e.target.value })} required />
                </div>
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
                <Input label={t("form.contactPhone")} placeholder={t("form.contactPhonePlaceholder")} value={formData.contactPhone || ""} onChange={(e) => updateFormData({ contactPhone: e.target.value })} required />
                <Input label={t("form.contactWhatsapp")} placeholder={t("form.contactWhatsappPlaceholder")} value={formData.contactWhatsapp || ""} onChange={(e) => updateFormData({ contactWhatsapp: e.target.value })} />
                <div className={s.checkboxGroup}><label className={s.checkboxLabel}><input type="checkbox" className={s.checkbox} checked={formData.contactVerified || false} onChange={(e) => updateFormData({ contactVerified: e.target.checked })} />{t("form.contactVerified")}</label></div>
            </div>
        </div>
    );
}
