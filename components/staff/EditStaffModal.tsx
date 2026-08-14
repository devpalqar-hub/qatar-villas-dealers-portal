"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiEdit2, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";
import { staffService, StaffMember, UpdateStaffPayload } from "@/services/staff.service";
import styles from "./AddStaffModal.module.css";

interface EditStaffModalProps {
    staffMember: StaffMember | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AVAILABLE_PERMISSIONS = ["MANAGE_LISTINGS", "MANAGE_CHATS", "VIEW_ANALYTICS", "MANAGE_STAFF"];

export default function EditStaffModal({ staffMember, open, onClose, onSuccess }: EditStaffModalProps) {
    const t = useTranslations("staff");
    const tPerm = useTranslations("permissionEnum");
    const tCommon = useTranslations("common");
    const [formData, setFormData] = useState<UpdateStaffPayload>({
        name: "",
        phone: "",
        position: "",
        permissions: [],
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && staffMember) {
            setFormData({
                name: staffMember.staffUser?.name || "",
                phone: staffMember.staffUser?.phone || "",
                position: staffMember.position || "",
                permissions: staffMember.permissions || [],
                isActive: staffMember.isActive ?? staffMember.staffUser?.isActive ?? true,
            });
            setError(null);
        }
    }, [open, staffMember]);

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

    if (!open || !staffMember) return null;

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

        if (!formData.name?.trim()) {
            setError(t("modal.errors.nameRequired"));
            return;
        }

        setLoading(true);
        try {
            await staffService.updateStaff(staffMember.id, formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to update staff member:", err);
            setError(
                err.response?.data?.message ||
                t("modal.errors.updateFailed")
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
                            <FiEdit2 />
                        </div>
                        <div>
                            <h2 className={styles.title}>{t("modal.editTitle")}</h2>
                            <p className={styles.subtitle}>{t("modal.editSubtitle")}</p>
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
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label={t("modal.phoneNumber")}
                                placeholder={t("modal.phonePlaceholder")}
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label={t("modal.position")}
                                placeholder={t("modal.positionPlaceholder")}
                                value={formData.position || ""}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.fullWidth}>
                            <div className={styles.permissionsSection}>
                                <label className={styles.label}>{t("modal.accountStatus")}</label>
                                <div className={styles.permissionGrid}>
                                    <div
                                        className={`${styles.permissionCard} ${
                                            formData.isActive ? styles.permissionCardActive : ""
                                        }`}
                                        onClick={() => setFormData({ ...formData, isActive: true })}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            className={styles.checkbox}
                                            checked={formData.isActive === true}
                                            onChange={() => {}}
                                        />
                                        <span className={styles.permTitle}>{t("statusActive")}</span>
                                    </div>
                                    <div
                                        className={`${styles.permissionCard} ${
                                            !formData.isActive ? styles.permissionCardActive : ""
                                        }`}
                                        onClick={() => setFormData({ ...formData, isActive: false })}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            className={styles.checkbox}
                                            checked={formData.isActive === false}
                                            onChange={() => {}}
                                        />
                                        <span className={styles.permTitle}>{t("statusInactive")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.fullWidth}>
                            <div className={styles.permissionsSection}>
                                <label className={styles.label}>{t("modal.permissions")}</label>
                                <div className={styles.permissionGrid}>
                                    {AVAILABLE_PERMISSIONS.map((permId) => {
                                        const isSelected = (formData.permissions || []).includes(permId);
                                        return (
                                            <div
                                                key={permId}
                                                className={`${styles.permissionCard} ${
                                                    isSelected ? styles.permissionCardActive : ""
                                                }`}
                                                onClick={() => handlePermissionToggle(permId)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkbox}
                                                    checked={isSelected}
                                                    onChange={() => {}}
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
                            {tCommon("saveChanges")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
