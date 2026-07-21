import React, { useState } from "react";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";
import styles from "./BasicInfoForm.module.css";
import { BasicInfoData } from "../../services/dealerOnboarding.service";

interface Props {
    onSubmit: (data: BasicInfoData) => Promise<void>;
    loading: boolean;
}

export default function BasicInfoForm({ onSubmit, loading }: Props) {
    const [formData, setFormData] = useState<BasicInfoData>({
        dealerName: "",
        contactName: "",
        email: "",
        phone: "",
    });

    const [errors, setErrors] = useState<Partial<BasicInfoData>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name as keyof BasicInfoData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const newErrors: Partial<BasicInfoData> = {};
        if (!formData.dealerName.trim()) newErrors.dealerName = "Dealer Name is required";
        if (!formData.contactName.trim()) newErrors.contactName = "Contact Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            await onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div>
                <h2 className={styles.title}>Basic Information</h2>
                <p className={styles.subtitle}>Provide your main contact details.</p>
            </div>

            <Input
                label="Dealer Name"
                name="dealerName"
                value={formData.dealerName}
                onChange={handleChange}
                error={errors.dealerName}
                placeholder="Enter dealership name"
                required
            />

            <Input
                label="Contact Name"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                error={errors.contactName}
                placeholder="Enter contact person's name"
                required
            />

            <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="email@dealership.com"
                required
            />

            <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+974 1234 5678"
                required
            />

            <div className={styles.actions}>
                <Button type="submit" loading={loading} size="lg">
                    Continue
                </Button>
            </div>
        </form>
    );
}
