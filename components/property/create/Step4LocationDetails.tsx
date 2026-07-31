import React from "react";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

export default function Step4LocationDetails({ formData, updateFormData, options }: StepProps) {
    const availableMunicipalities = (options?.municipalities && options.municipalities.length > 0)
        ? options.municipalities
        : [];

    const availableNearby = (options?.nearbyTags && options.nearbyTags.length > 0)
        ? options.nearbyTags
        : [];

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
                </div>

                <div>
                    <label className={pageStyles.label}>
                        Municipality <span className={pageStyles.required}>*</span>
                    </label>
                    <select
                        className={s.select}
                        value={formData.municipalityId || ""}
                        onChange={(e) => updateFormData({ municipalityId: e.target.value })}
                        required
                    >
                        <option value="" disabled>Select Municipality</option>
                        {availableMunicipalities.map((municipalities: any) => (
                            <option key={municipalities.id} value={municipalities.id}>
                                {municipalities.name}
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
                    <label className={pageStyles.label}>Nearby Facilities</label>
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
