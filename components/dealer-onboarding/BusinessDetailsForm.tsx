import React, { useState, useRef } from "react";
import { FiUploadCloud, FiX, FiLoader } from "react-icons/fi";
import { useTranslations } from "next-intl";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";
import styles from "./BusinessDetailsForm.module.css";
import { BusinessDetailsData } from "../../services/dealerOnboarding.service";
import { uploadFileToS3 } from "../../services/upload.service";

interface Props {
    onSubmit: (data: BusinessDetailsData) => Promise<void>;
    loading: boolean;
}

export default function BusinessDetailsForm({ onSubmit, loading }: Props) {
    const t = useTranslations("onboarding.business");
    const [data, setData] = useState<Omit<BusinessDetailsData, "documents">>({
        tradeNumber: "",
        reraNumber: "",
        address: "",
        city: "",
        country: "",
        website: "",
        description: "",
    });

    const [files, setFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Partial<BusinessDetailsData>>({});
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof BusinessDetailsData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors: Partial<BusinessDetailsData> = {};
        if (!data.tradeNumber.trim()) newErrors.tradeNumber = t("errors.tradeNumber");
        if (!data.address.trim()) newErrors.address = t("errors.address");
        if (!data.city.trim()) newErrors.city = t("errors.city");
        if (!data.country.trim()) newErrors.country = t("errors.country");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        let documentUrls: string[] = [];

        if (files.length > 0) {
            setUploading(true);
            setUploadError(null);
            try {
                documentUrls = await uploadFileToS3(files);
            } catch (err: any) {
                setUploadError(err.message || t("errors.uploadFailed"));
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        await onSubmit({
            tradeNumber: data.tradeNumber,
            ...(data.reraNumber ? { reraNumber: data.reraNumber } : {}),
            address: data.address,
            city: data.city,
            country: data.country,
            ...(data.website ? { website: data.website } : {}),
            ...(data.description ? { description: data.description } : {}),
            ...(documentUrls.length > 0 ? { documents: documentUrls } : {}),
        });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div>
                <h2 className={styles.title}>{t("title")}</h2>
                <p className={styles.subtitle}>{t("subtitle")}</p>
            </div>

            <div className={styles.grid}>
                <Input
                    label={t("tradeNumber")}
                    name="tradeNumber"
                    value={data.tradeNumber}
                    onChange={handleChange}
                    error={errors.tradeNumber}
                    placeholder={t("tradePlaceholder")}
                    required
                />
                <Input
                    label={t("reraNumber")}
                    name="reraNumber"
                    value={data.reraNumber}
                    onChange={handleChange}
                    placeholder={t("reraPlaceholder")}
                />

                <div className={styles.fullWidth}>
                    <Input
                        label={t("companyAddress")}
                        name="address"
                        value={data.address}
                        onChange={handleChange}
                        error={errors.address}
                        placeholder={t("addressPlaceholder")}
                        required
                    />
                </div>

                <Input
                    label={t("city")}
                    name="city"
                    value={data.city}
                    onChange={handleChange}
                    error={errors.city}
                    placeholder={t("cityPlaceholder")}
                    required
                />
                <Input
                    label={t("country")}
                    name="country"
                    value={data.country}
                    onChange={handleChange}
                    error={errors.country}
                    placeholder={t("countryPlaceholder")}
                    required
                />

                <div className={styles.fullWidth}>
                    <Input
                        label={t("website")}
                        name="website"
                        value={data.website}
                        onChange={handleChange}
                        placeholder={t("websitePlaceholder")}
                    />
                </div>

                <div className={styles.fullWidth}>
                    <label className={styles.label}>{t("companyDescription")}</label>
                    <textarea
                        className={styles.textarea}
                        name="description"
                        value={data.description}
                        onChange={handleChange}
                        placeholder={t("descriptionPlaceholder")}
                    />
                </div>

                <div className={styles.fullWidth}>
                    <label className={styles.label}>{t("documents")}</label>
                    <div
                        className={styles.fileUploadArea}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FiUploadCloud className={styles.uploadIcon} />
                        <span className={styles.uploadText}>{t("uploadDocuments")}</span>
                        <span className={styles.uploadHint}>{t("uploadHint")}</span>
                        <input
                            type="file"
                            multiple
                            className={styles.fileInput}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                    {uploadError && (
                        <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)", marginTop: "8px" }}>{uploadError}</p>
                    )}
                    {files.length > 0 && (
                        <div className={styles.fileList}>
                            {files.map((file, i) => (
                                <div key={i} className={styles.fileItem}>
                                    <span>{file.name}</span>
                                    <button type="button" onClick={() => removeFile(i)}>
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.actions}>
                <Button type="submit" loading={loading || uploading} size="lg">
                    {uploading ? t("uploadingDocuments") : t("submitApplication")}
                </Button>
            </div>
        </form>
    );
}