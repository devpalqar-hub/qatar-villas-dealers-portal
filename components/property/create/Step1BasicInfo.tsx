import React from "react";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

const DEFAULT_TYPES = [
    { id: "cuid_villa", name: "Villa" },
    { id: "cuid_apartment", name: "Apartment" },
    { id: "cuid_penthouse", name: "Penthouse" },
    { id: "cuid_land", name: "Land" },
];

export default function Step1BasicInfo({ formData, updateFormData, options }: StepProps) {
    const availableTypes = (options?.types && options.types.length > 0)
        ? options.types
        : (options?.propertyTypes && options.propertyTypes.length > 0)
            ? options.propertyTypes
            : DEFAULT_TYPES;

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
                        value={formData.typeId || (availableTypes[0]?.id || "")}
                        onChange={(e) => updateFormData({ typeId: e.target.value })}
                        required
                    >
                        <option value="" disabled>Select Property Type</option>
                        {availableTypes.map((opt: any) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name || opt.title || opt.id}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Contact Phone"
                    placeholder="e.g. +97455512345"
                    value={formData.contactPhone || ""}
                    onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                    required
                />

                <Input
                    label="Contact WhatsApp"
                    placeholder="e.g. +97455512345"
                    value={formData.contactWhatsapp || ""}
                    onChange={(e) => updateFormData({ contactWhatsapp: e.target.value })}
                />

                <div className={s.checkboxGroup}>
                    <label className={s.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={s.checkbox}
                            checked={formData.contactVerified || false}
                            onChange={(e) => updateFormData({ contactVerified: e.target.checked })}
                        />
                        Contact Verified
                    </label>
                </div>
            </div>
        </div>
    );
}
