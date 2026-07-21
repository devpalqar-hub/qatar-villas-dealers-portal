import React, { useState } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { uploadFileToS3 } from "@/services/upload.service";
import pageStyles from "../../../app/properties/create/page.module.css";
import s from "./steps.module.css";
import { StepProps } from "./types";

export default function Step5MediaGallery({ formData, updateFormData }: StepProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        setError(null);
        try {
            const filesArray = Array.from(e.target.files);
            const urls = await uploadFileToS3(filesArray);
            const newPhotos = urls.map((url, idx) => ({
                url,
                sortOrder: (formData.photos?.length || 0) + idx,
                caption: "",
            }));
            updateFormData({ photos: [...(formData.photos || []), ...newPhotos] });
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Failed to upload images. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (index: number) => {
        const currentPhotos = [...(formData.photos || [])];
        currentPhotos.splice(index, 1);
        updateFormData({ photos: currentPhotos });
    };

    const updateCaption = (index: number, caption: string) => {
        const currentPhotos = [...(formData.photos || [])];
        currentPhotos[index].caption = caption;
        updateFormData({ photos: currentPhotos });
    };

    return (
        <div>
            <h2 className={pageStyles.stepTitle}>Step 5: Media &amp; Gallery</h2>

            <label className={s.uploadZone}>
                <FiUploadCloud className={s.uploadIcon} />
                <p className={s.uploadText}>
                    <span className={s.uploadBold}>Click to upload</span> or drag and drop
                </p>
                <p className={s.uploadHint}>PNG, JPG or WEBP</p>
                <input
                    type="file"
                    className={s.hiddenInput}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
                {uploading && (
                    <div className={s.uploadingOverlay}>Uploading...</div>
                )}
            </label>

            {error && <p className={s.uploadError}>{error}</p>}

            {formData.photos && formData.photos.length > 0 && (
                <div className={s.gallerySection}>
                    <h3 className={s.galleryTitle}>
                        Uploaded Photos ({formData.photos.length})
                    </h3>
                    <div className={s.galleryGrid}>
                        {formData.photos.map((photo, index) => (
                            <div key={index} className={s.photoCard}>
                                <div className={s.photoFrame}>
                                    <img
                                        src={photo.url}
                                        alt={`Photo ${index + 1}`}
                                        className={s.photoImage}
                                    />
                                    <button
                                        type="button"
                                        className={s.photoRemoveBtn}
                                        onClick={() => removePhoto(index)}
                                        title="Remove photo"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                    <span className={s.photoBadge}>#{photo.sortOrder + 1}</span>
                                </div>
                                <div className={s.captionBar}>
                                    <input
                                        type="text"
                                        className={s.captionInput}
                                        placeholder="Add caption..."
                                        value={photo.caption || ""}
                                        onChange={(e) => updateCaption(index, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
