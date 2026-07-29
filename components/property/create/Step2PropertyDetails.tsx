import React from "react";
import { Input } from "@/components/ui";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

export default function Step2PropertyDetails({ formData, updateFormData, options }: StepProps) {

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>Step 2: Property Details</h2>
            <div className={pageStyles.formGrid}>
                <Input
                    label="Price (QAR)"
                    type="number"
                    placeholder="e.g. 5500000"
                    value={formData.price || ""}
                    onChange={(e) => updateFormData({ price: Number(e.target.value) })}
                    required
                />

                <div className={s.checkboxGroup}>
                    <label className={s.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={s.checkbox}
                            checked={formData.priceNegotiable || false}
                            onChange={(e) => updateFormData({ priceNegotiable: e.target.checked })}
                        />
                        Price Negotiable
                    </label>
                </div>

                <Input
                    label="Built-up Area (sqm)"
                    type="number"
                    placeholder="e.g. 450.5"
                    value={formData.area || ""}
                    onChange={(e) => updateFormData({ area: Number(e.target.value) })}
                    required
                />

                <div>
                    <label className={pageStyles.label}>Furnishing Status</label>
                    <select
                        className={s.select}
                        value={formData.furnishingStatus || ""}
                        onChange={(e) => updateFormData({ furnishingStatus: e.target.value })}
                    >
                        <option value="">Select Option...</option>
                        {options?.furnishingOptions?.map((opt) => (
                            <option key={opt.id} value={opt.title}>
                                {opt.title}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Bedrooms"
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.bedrooms || ""}
                    onChange={(e) => updateFormData({ bedrooms: Number(e.target.value) })}
                    required
                />

                <Input
                    label="Bathrooms"
                    type="number"
                    placeholder="e.g. 3"
                    value={formData.bathrooms || ""}
                    onChange={(e) => updateFormData({ bathrooms: Number(e.target.value) })}
                    required
                />

                <Input
                    label="Living Rooms"
                    type="number"
                    placeholder="e.g. 2"
                    value={formData.livingRooms || ""}
                    onChange={(e) => updateFormData({ livingRooms: Number(e.target.value) })}
                />

                <Input
                    label="Parking Spaces"
                    type="number"
                    placeholder="e.g. 2"
                    value={formData.parkingSpaces || ""}
                    onChange={(e) => updateFormData({ parkingSpaces: Number(e.target.value) })}
                />

                <Input
                    label="Floor Number"
                    type="number"
                    placeholder="e.g. 5"
                    value={formData.floorNumber || ""}
                    onChange={(e) => updateFormData({ floorNumber: Number(e.target.value) })}
                />

                <Input
                    label="Total Floors"
                    type="number"
                    placeholder="e.g. 20"
                    value={formData.totalFloors || ""}
                    onChange={(e) => updateFormData({ totalFloors: Number(e.target.value) })}
                />

                <Input
                    label="Year Built"
                    type="number"
                    placeholder="e.g. 2019"
                    value={formData.yearBuilt || ""}
                    onChange={(e) => updateFormData({ yearBuilt: Number(e.target.value) })}
                />
            </div>
        </div>
    );
}
