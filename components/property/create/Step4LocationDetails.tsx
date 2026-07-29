import React from "react";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

export default function Step4LocationDetails({ formData, updateFormData, options }: StepProps) {
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
                    <select
                        className={s.select}
                        value={formData.areaName || ""}
                        onChange={(e) => updateFormData({ areaName: e.target.value })}
                        required
                    >
                        <option value="">Select area...</option>
                        {options?.areaSuggestions?.map((area) => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={pageStyles.label}>
                        Municipality <span className={pageStyles.required}>*</span>
                    </label>
                    <select
                        className={s.select}
                        value={formData.municipality || "DOHA"}
                        onChange={(e) => updateFormData({ municipality: e.target.value })}
                    >
                        <option value="DOHA">Doha</option>
                        <option value="AL_RAYYAN">Al Rayyan</option>
                        <option value="AL_WAKRAH">Al Wakrah</option>
                        <option value="AL_KHOR">Al Khor</option>
                        <option value="AL_SHAMAL">Al Shamal</option>
                        <option value="UMM_SALAL">Umm Salal</option>
                        <option value="AL_DAAYEN">Al Daayen</option>
                    </select>
                </div>

                <Input
                    label="Latitude"
                    type="number"
                    placeholder="e.g. 25.3548"
                    value={formData.latitude || ""}
                    onChange={(e) => updateFormData({ latitude: Number(e.target.value) })}
                    required
                />

                <Input
                    label="Longitude"
                    type="number"
                    placeholder="e.g. 51.1839"
                    value={formData.longitude || ""}
                    onChange={(e) => updateFormData({ longitude: Number(e.target.value) })}
                    required
                />

                <div className={pageStyles.fullWidth}>
                    <label className={pageStyles.label}>Nearby Tags</label>
                    <div className={s.nearbyGrid}>
                        {options?.nearbyTags?.map((tag) => (
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
