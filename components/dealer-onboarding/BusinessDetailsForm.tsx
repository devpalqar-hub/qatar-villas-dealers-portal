import React, { useState, useRef } from "react";
import { FiUploadCloud, FiX, FiLoader } from "react-icons/fi";
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
        if (!data.tradeNumber.trim()) newErrors.tradeNumber = "Trade Number is required";
        if (!data.address.trim()) newErrors.address = "Address is required";
        if (!data.city.trim()) newErrors.city = "City is required";
        if (!data.country.trim()) newErrors.country = "Country is required";

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
                setUploadError(err.message || "Failed to upload documents. Please try again.");
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
                <h2 className={styles.title}>Business Details</h2>
                <p className={styles.subtitle}>Provide your company information and documents.</p>
            </div>

            <div className={styles.grid}>
                <Input
                    label="Trade License Number"
                    name="tradeNumber"
                    value={data.tradeNumber}
                    onChange={handleChange}
                    error={errors.tradeNumber}
                    placeholder="Enter trade number"
                    required
                />
                <Input
                    label="RERA Number (Optional)"
                    name="reraNumber"
                    value={data.reraNumber}
                    onChange={handleChange}
                    placeholder="Enter RERA number"
                />

                <div className={styles.fullWidth}>
                    <Input
                        label="Company Address"
                        name="address"
                        value={data.address}
                        onChange={handleChange}
                        error={errors.address}
                        placeholder="Street, Building, Office number"
                        required
                    />
                </div>

                <Input
                    label="City"
                    name="city"
                    value={data.city}
                    onChange={handleChange}
                    error={errors.city}
                    placeholder="E.g. Doha"
                    required
                />
                <Input
                    label="Country"
                    name="country"
                    value={data.country}
                    onChange={handleChange}
                    error={errors.country}
                    placeholder="E.g. Qatar"
                    required
                />

                <div className={styles.fullWidth}>
                    <Input
                        label="Website (Optional)"
                        name="website"
                        value={data.website}
                        onChange={handleChange}
                        placeholder="https://www.example.com"
                    />
                </div>

                <div className={styles.fullWidth}>
                    <label className={styles.label}>Company Description (Optional)</label>
                    <textarea
                        className={styles.textarea}
                        name="description"
                        value={data.description}
                        onChange={handleChange}
                        placeholder="Briefly describe your agency..."
                    />
                </div>

                <div className={styles.fullWidth}>
                    <label className={styles.label}>Company Documents</label>
                    <div
                        className={styles.fileUploadArea}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FiUploadCloud className={styles.uploadIcon} />
                        <span className={styles.uploadText}>Click to upload documents</span>
                        <span className={styles.uploadHint}>Trade License, ID Copies, etc.</span>
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
                    {uploading ? "Uploading documents…" : "Submit Application"}
                </Button>
            </div>
        </form>
    );
}