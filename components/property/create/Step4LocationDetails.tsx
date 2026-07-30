import React from "react";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

const DEFAULT_MUNICIPALITIES = [
    { id: "cuid_doha", name: "Doha" },
    { id: "cuid_al_rayyan", name: "Al Rayyan" },
    { id: "cuid_al_wakrah", name: "Al Wakrah" },
    { id: "cuid_al_khor", name: "Al Khor" },
    { id: "cuid_al_shamal", name: "Al Shamal" },
    { id: "cuid_umm_salal", name: "Umm Salal" },
    { id: "cuid_al_daayen", name: "Al Daayen" },
];

const DEFAULT_NEARBY_TAGS = [
    { id: "cuid3", title: "Near Metro Station" },
    { id: "cuid4", title: "Beach Access" },
    { id: "cuid5", title: "Shopping Mall" },
    { id: "cuid6", title: "International School" },
];

export default function Step4LocationDetails({ formData, updateFormData, options }: StepProps) {
    const availableMunicipalities = (options?.municipalities && options.municipalities.length > 0)
        ? options.municipalities
        : DEFAULT_MUNICIPALITIES;

    const availableNearby = (options?.nearbyTags && options.nearbyTags.length > 0)
        ? options.nearbyTags
        : DEFAULT_NEARBY_TAGS;

    const handleNearbyTagToggle = (tagId: string) => {
        const currentTags = formData.nearbyTags || [];
        if (currentTags.includes(tagId)) {
            updateFormData({ nearbyTags: currentTags.filter((t) => t !== tagId) });
        } else {
            updateFormData({ nearbyTags: [...currentTags, tagId] });
        }
    };

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>Step 4: Location Details</h2>
            <div className={pageStyles.formGrid}>
                <div className={pageStyles.fullWidth}>
                    <Input
                        label="Address Line 1"
                        placeholder="e.g. Porto Arabia Tower 5"
                        value={formData.addressLine1 || ""}
                        onChange={(e) => updateFormData({ addressLine1: e.target.value })}
                        required
                    />
                </div>

                <div className={pageStyles.fullWidth}>
                    <Input
                        label="Address Line 2 (Optional)"
                        placeholder="e.g. Apt 1201"
                        value={formData.addressLine2 || ""}
                        onChange={(e) => updateFormData({ addressLine2: e.target.value })}
                    />
                </div>

                <div>
                    <label className={pageStyles.label}>
                        Area Name <span className={pageStyles.required}>*</span>
                    </label>
                    <Input
                        placeholder="e.g. The Pearl Qatar"
                        value={formData.areaName || ""}
                        onChange={(e) => updateFormData({ areaName: e.target.value })}
                        required
                    />
                    {options?.areaSuggestions && options.areaSuggestions.length > 0 && (
                        <div className={s.areaSuggestions}>
                            <span className={s.suggestionLabel}>Suggestions: </span>
                            {options.areaSuggestions.map((area) => (
                                <button
                                    type="button"
                                    key={area}
                                    className={s.suggestionChip}
                                    onClick={() => updateFormData({ areaName: area })}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className={pageStyles.label}>
                        Municipality <span className={pageStyles.required}>*</span>
                    </label>
                    <select
                        className={s.select}
                        value={formData.municipalityId || (availableMunicipalities[0]?.id || "")}
                        onChange={(e) => updateFormData({ municipalityId: e.target.value })}
                        required
                    >
                        <option value="" disabled>Select Municipality</option>
                        {availableMunicipalities.map((m: any) => (
                            <option key={m.id} value={m.id}>
                                {m.name || m.title || m.id}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Latitude"
                    type="number"
                    placeholder="e.g. 25.3548"
                    value={formData.latitude ?? ""}
                    onChange={(e) => updateFormData({ latitude: Number(e.target.value) })}
                    required
                />

                <Input
                    label="Longitude"
                    type="number"
                    placeholder="e.g. 51.1839"
                    value={formData.longitude ?? ""}
                    onChange={(e) => updateFormData({ longitude: Number(e.target.value) })}
                    required
                />

                <div className={pageStyles.fullWidth}>
                    <label className={pageStyles.label}>Nearby Tags</label>
                    <div className={s.nearbyGrid}>
                        {availableNearby.map((tag) => (
                            <label key={tag.id} className={s.tagLabel}>
                                <input
                                    type="checkbox"
                                    className={s.checkbox}
                                    checked={(formData.nearbyTags || []).includes(tag.id)}
                                    onChange={() => handleNearbyTagToggle(tag.id)}
                                />
                                {tag.title}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
