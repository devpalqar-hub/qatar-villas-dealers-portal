import React from "react";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

export default function Step1BasicInfo({ formData, updateFormData }: StepProps) {
    return (
        <div>
            <h2 className={pageStyles.stepTitle}>Step 1: Basic Information</h2>
            <div className={pageStyles.formGrid}>
                <div className={pageStyles.fullWidth}>
                    <Input
                        label="Property Name"
                        placeholder="e.g. Luxury 4-BR Villa in The Pearl Qatar"
                        value={formData.propertyName || ""}
                        onChange={(e) => updateFormData({ propertyName: e.target.value })}
                        required
                    />
                </div>

                <div className={pageStyles.fullWidth}>
                    <label className={pageStyles.label}>
                        Description <span className={pageStyles.required}>*</span>
                    </label>
                    <textarea
                        className={s.textarea}
                        rows={4}
                        placeholder="Describe the property..."
                        value={formData.description || ""}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className={pageStyles.label}>
                        Purpose <span className={pageStyles.required}>*</span>
                    </label>
                    <select
                        className={s.select}
                        value={formData.purpose || "SALE"}
                        onChange={(e) => updateFormData({ purpose: e.target.value as "SALE" | "RENT" })}
                    >
                        <option value="SALE">Sale</option>
                        <option value="RENT">Rent</option>
                    </select>
                </div>

                <div>
                    <label className={pageStyles.label}>
                        Property Type <span className={pageStyles.required}>*</span>
                    </label>
                    <select
                        className={s.select}
                        value={formData.type || "VILLA"}
                        onChange={(e) => updateFormData({ type: e.target.value as any })}
                    >
                        <option value="VILLA">Villa</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="PENTHOUSE">Penthouse</option>
                        <option value="LAND">Land</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
