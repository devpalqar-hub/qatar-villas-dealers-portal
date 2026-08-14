import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";
import styles from "./BasicInfoForm.module.css";
import { BasicInfoData } from "../../services/dealerOnboarding.service";

interface Props {
    onSubmit: (data: BasicInfoData) => Promise<void>;
    loading: boolean;
}

export default function BasicInfoForm({ onSubmit, loading }: Props) {
    const t = useTranslations("onboarding.basicInfo");
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
        if (!formData.dealerName.trim()) newErrors.dealerName = t("errors.dealerName");
        if (!formData.contactName.trim()) newErrors.contactName = t("errors.contactName");
        if (!formData.email.trim()) {
            newErrors.email = t("errors.emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("errors.emailInvalid");
        }
        if (!formData.phone.trim()) newErrors.phone = t("errors.phone");

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
                <h2 className={styles.title}>{t("title")}</h2>
                <p className={styles.subtitle}>{t("subtitle")}</p>
            </div>

            <Input
                label={t("dealerName")}
                name="dealerName"
                value={formData.dealerName}
                onChange={handleChange}
                error={errors.dealerName}
                placeholder={t("dealerNamePlaceholder")}
                required
            />

            <Input
                label={t("contactName")}
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                error={errors.contactName}
                placeholder={t("contactNamePlaceholder")}
                required
            />

            <Input
                label={t("email")}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder={t("emailPlaceholder")}
                required
            />

            <Input
                label={t("phone")}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder={t("phonePlaceholder")}
                required
            />

            <div className={styles.actions}>
                <Button type="submit" loading={loading} size="lg">
                    {t("continue")}
                </Button>
            </div>
        </form>
    );
}