import React from "react";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

export default function Step3FeaturesAmenities({ formData, updateFormData, options }: StepProps) {
    const handleAmenityToggle = (amenity: string) => {
        const currentAmenities = formData.amenities || [];
        if (currentAmenities.includes(amenity)) {
            updateFormData({ amenities: currentAmenities.filter((a) => a !== amenity) });
        } else {
            updateFormData({ amenities: [...currentAmenities, amenity] });
        }
    };

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>Step 3: Features &amp; Amenities</h2>
            <div className={pageStyles.formGrid}>
                <div className={s.checkboxGroup}>

                </div>

                <Input
                    label="Garden Area (sqm)"
                    type="number"
                    placeholder="e.g. 200"
                    value={formData.extraProperties?.gardenAreaSqm || ""}
                    onChange={(e) =>
                        updateFormData({
                            extraProperties: {
                                ...formData.extraProperties,
                                gardenAreaSqm: Number(e.target.value),
                            },
                        })
                    }
                />

                <div className={pageStyles.fullWidth}>
                    <label className={pageStyles.label}>Amenities</label>
                    <div className={s.tagGrid}>
                        {options?.amenities?.map((amenity) => (
                            <label key={amenity.id} className={s.tagLabel}>
                                <input
                                    type="checkbox"
                                    className={s.checkbox}
                                    checked={(formData.amenities || []).includes(amenity.id)}
                                    onChange={() => handleAmenityToggle(amenity.id)}
                                />
                                {amenity.title}
                            </label>
                        ))}
                    </div>
                </div>

                <div className={pageStyles.fullWidth}>
                    <Input
                        label="Other Features"
                        placeholder="e.g. Comes with a dedicated boat berth in the marina"
                        value={formData.otherFeatures || ""}
                        onChange={(e) => updateFormData({ otherFeatures: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}
