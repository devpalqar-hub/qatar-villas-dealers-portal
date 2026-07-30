"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiEdit2, FiX } from "react-icons/fi";
import { Button, Input } from "@/components/ui";
import { staffService, StaffMember, UpdateStaffPayload } from "@/services/staff.service";
import styles from "./AddStaffModal.module.css";

interface EditStaffModalProps {
    staffMember: StaffMember | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AVAILABLE_PERMISSIONS = [
    { id: "MANAGE_LISTINGS", label: "Manage Listings" },
    { id: "MANAGE_CHATS", label: "Manage Chats" },
    { id: "VIEW_ANALYTICS", label: "View Analytics" },
    { id: "MANAGE_STAFF", label: "Manage Staff" },
];

export default function EditStaffModal({ staffMember, open, onClose, onSuccess }: EditStaffModalProps) {
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
            setError("Staff name is required.");
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
                "Failed to update staff member details. Please try again."
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
                            <h2 className={styles.title}>Edit Staff Member</h2>
                            <p className={styles.subtitle}>Update profile and permission details.</p>
                        </div>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.grid}>
                        <div className={styles.fullWidth}>
                            <Input
                                label="Full Name"
                                placeholder="e.g. Sara Al-Dosari"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Phone Number"
                                placeholder="e.g. +97412345679"
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Position / Title"
                                placeholder="e.g. Sales Agent"
                                value={formData.position || ""}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.fullWidth}>
                            <div className={styles.permissionsSection}>
                                <label className={styles.label}>Account Status</label>
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
                                        <span className={styles.permTitle}>Active</span>
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
                                        <span className={styles.permTitle}>Inactive</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.fullWidth}>
                            <div className={styles.permissionsSection}>
                                <label className={styles.label}>Permissions</label>
                                <div className={styles.permissionGrid}>
                                    {AVAILABLE_PERMISSIONS.map((perm) => {
                                        const isSelected = (formData.permissions || []).includes(perm.id);
                                        return (
                                            <div
                                                key={perm.id}
                                                className={`${styles.permissionCard} ${
                                                    isSelected ? styles.permissionCardActive : ""
                                                }`}
                                                onClick={() => handlePermissionToggle(perm.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkbox}
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                />
                                                <span className={styles.permTitle}>{perm.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
