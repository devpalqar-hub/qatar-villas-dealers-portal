"use client";

import React, { useState } from "react";
import { FiX, FiFlag, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { supportService } from "@/services/support.service";
import styles from "./ReportUserModal.module.css";

interface ReportUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportedUserId: string;
    reportedUserName: string;
    listingId?: string;
}

export default function ReportUserModal({
    isOpen,
    onClose,
    reportedUserId,
    reportedUserName,
    listingId,
}: ReportUserModalProps) {
    const t = useTranslations("chat.report");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        if (submitting) return;
        setSubject("");
        setMessage("");
        setError(null);
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            setError(t("errorFieldsRequired"));
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await supportService.createTicket({
                category: "REPORT_USER",
                subject: subject.trim(),
                message: message.trim(),
                reportedUserId,
                listingId: listingId || undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 1800);
        } catch (err: any) {
            const apiMessage =
                err?.response?.data?.message ||
                t("errorGeneric");
            setError(Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={handleClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
            >
                <div className={styles.header}>
                    <div className={styles.headerTitleContainer}>
                        <div className={styles.iconBadge}>
                            <FiFlag size={18} />
                        </div>
                        <div>
                            <h2 id="report-modal-title" className={styles.title}>
                                {t("title")}
                            </h2>
                            <p className={styles.subtitle}>
                                {t("submittingFor", { name: reportedUserName })}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label={t("close")}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {success ? (
                    <div className={styles.successState}>
                        <FiCheckCircle size={48} className={styles.successIcon} />
                        <h3>{t("submittedTitle")}</h3>
                        <p>{t("submittedBody")}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.errorBox}>
                                <FiAlertTriangle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className={styles.fieldGroup}>
                            <label htmlFor="report-category" className={styles.label}>
                                {t("category")}
                            </label>
                            <input
                                id="report-category"
                                type="text"
                                value={t("categoryValue")}
                                disabled
                                className={styles.disabledInput}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="report-subject" className={styles.label}>
                                {t("subject")} <span className={styles.required}>*</span>
                            </label>
                            <input
                                id="report-subject"
                                type="text"
                                placeholder={t("subjectPlaceholder")}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                className={styles.input}
                                disabled={submitting}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="report-message" className={styles.label}>
                                {t("description")} <span className={styles.required}>*</span>
                            </label>
                            <textarea
                                id="report-message"
                                rows={4}
                                placeholder={t("descriptionPlaceholder")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className={styles.textarea}
                                disabled={submitting}
                            />
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={submitting || !subject.trim() || !message.trim()}
                            >
                                {submitting ? t("submitting") : t("submit")}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
