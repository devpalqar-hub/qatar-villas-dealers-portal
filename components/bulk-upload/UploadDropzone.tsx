"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FiUploadCloud, FiFile, FiRefreshCw } from "react-icons/fi";
import styles from "./UploadDropzone.module.css";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".json"];
const ACCEPTED_MIME_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/csv",
    "application/json",
    "text/json",
];
const MAX_FILE_SIZE_MB = 20;

interface UploadDropzoneProps {
    onFileSelected: (file: File) => void;
    uploading?: boolean;
    disabled?: boolean;
}

export default function UploadDropzone({ onFileSelected, uploading = false, disabled = false }: UploadDropzoneProps) {
    const t = useTranslations("bulkUpload.upload");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const validateFile = (file: File): string | null => {
        const name = file.name.toLowerCase();
        const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
        const hasValidMime = !file.type || ACCEPTED_MIME_TYPES.includes(file.type);

        if (!hasValidExtension && !hasValidMime) {
            return t("errors.unsupportedType");
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return t("errors.tooLarge", { maxSizeMb: MAX_FILE_SIZE_MB });
        }
        return null;
    };

    const handleFile = (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setLocalError(validationError);
            setSelectedFile(null);
            return;
        }
        setLocalError(null);
        setSelectedFile(file);
        onFileSelected(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
        if (disabled || uploading) return;
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div>
            <div
                className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""} ${uploading ? styles.dropzoneBusy : ""}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled && !uploading) setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                onClick={() => !disabled && !uploading && inputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-disabled={disabled || uploading}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className={styles.hiddenInput}
                    accept={ACCEPTED_EXTENSIONS.join(",")}
                    onChange={handleInputChange}
                    disabled={disabled || uploading}
                />

                {uploading ? (
                    <>
                        <FiRefreshCw className={`${styles.icon} ${styles.spinning}`} />
                        <p className={styles.uploadingText}>{t("uploading")}</p>
                    </>
                ) : selectedFile ? (
                    <>
                        <FiFile className={styles.icon} />
                        <p className={styles.selectedLabel}>{t("selected")}</p>
                        <p className={styles.selectedFileName}>{selectedFile.name}</p>
                        <span className={styles.changeFileBtn}>{t("changeFile")}</span>
                    </>
                ) : (
                    <>
                        <FiUploadCloud className={styles.icon} />
                        <p className={styles.dragText}>
                            {isDragActive ? t("dragActive") : t("dragDefault")}
                        </p>
                        <p className={styles.orText}>{t("or")}</p>
                        <span className={styles.chooseFileBtn}>{t("chooseFile")}</span>
                    </>
                )}
            </div>

            <p className={styles.supportedText}>{t("supported")}</p>

            {localError && <p className={styles.errorText}>{localError}</p>}
        </div>
    );
}
