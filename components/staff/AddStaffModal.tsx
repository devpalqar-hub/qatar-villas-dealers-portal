"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiUserPlus, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { staffService, CreateStaffPayload } from "@/services/staff.service";
import styles from "./AddStaffModal.module.css";

interface AddStaffModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AVAILABLE_PERMISSIONS = ["MANAGE_LISTINGS", "MANAGE_CHATS", "VIEW_ANALYTICS", "MANAGE_STAFF"];

export default function AddStaffModal({ open, onClose, onSuccess }: AddStaffModalProps) {
    const t = useTranslations("staff");
    const tPerm = useTranslations("permissionEnum");
    const tCommon = useTranslations("common");
    const [formData, setFormData] = useState<CreateStaffPayload>({
        name: "",
        email: "",
        password: "",
        phone: "",
        position: "Sales Agent",
        permissions: ["MANAGE_LISTINGS", "MANAGE_CHATS"],
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                position: "Sales Agent",
                permissions: ["MANAGE_LISTINGS", "MANAGE_CHATS"],
            });
            setError(null);
            setShowPassword(false);
        }
    }, [open]);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    const handlePermissionToggle = (permId: string) => {
        const currentPerms = formData.permissions || [];
        if (currentPerms.includes(permId)) {
            setFormData({
                ...formData,
                permissions: currentPerms.filter((p) => p !== permId),
            });
        } else {
            setFormData({
                ...formData,
                permissions: [...currentPerms, permId],
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError(t("modal.errors.nameRequired"));
            return;
        }
        if (!formData.email.trim()) {
            setError(t("modal.errors.emailRequired"));
            return;
        }
        if (!formData.password) {
            setError(t("modal.errors.passwordRequired"));
            return;
        }

        setLoading(true);
        try {
            await staffService.createStaff(formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to add staff:", err);
            setError(
                err.response?.data?.message ||
                t("modal.errors.createFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.iconWrap}>
                            <FiUserPlus />
                        </div>
                        <div>
                            <h2 className={styles.title}>{t("modal.addTitle")}</h2>
                            <p className={styles.subtitle}>{t("modal.addSubtitle")}</p>
                        </div>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t("modal.close")}>
                        <FiX />
                    </button>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.grid}>
                        <div className={styles.fullWidth}>
                            <Input
                                label={t("modal.fullName")}
                                placeholder={t("modal.fullNamePlaceholder")}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label={t("modal.emailAddress")}
                                type="email"
                                placeholder={t("modal.emailPlaceholder")}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label={t("modal.phoneNumber")}
                                placeholder={t("modal.phonePlaceholder")}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label={t("modal.position")}
                                placeholder={t("modal.positionPlaceholder")}
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className={styles.label}>
                                {t("modal.password")} <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.passwordInputWrapper}>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("modal.passwordPlaceholder")}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggleBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? t("modal.hidePassword") : t("modal.showPassword")}
                                >
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.fullWidth}>
                            <div className={styles.permissionsSection}>
                                <label className={styles.label}>{t("modal.permissions")}</label>
                                <div className={styles.permissionGrid}>
                                    {AVAILABLE_PERMISSIONS.map((permId) => {
                                        const isSelected = formData.permissions.includes(permId);
                                        return (
                                            <div
                                                key={permId}
                                                className={`${styles.permissionCard} ${isSelected ? styles.permissionCardActive : ""
                                                    }`}
                                                onClick={() => handlePermissionToggle(permId)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkbox}
                                                    checked={isSelected}
                                                    onChange={() => { }} // handled by parent onClick
                                                />
                                                <span className={styles.permTitle}>{tPerm(permId)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            {tCommon("cancel")}
                        </Button>
                        <Button type="submit" loading={loading}>
                            {t("modal.addAction")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
