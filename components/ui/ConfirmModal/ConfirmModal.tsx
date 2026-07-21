"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { RiAlertLine, RiInformationLine, RiErrorWarningLine } from "react-icons/ri";
import styles from "./ConfirmModal.module.css";

type Intent = "danger" | "warning" | "info";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    intent?: Intent;
    onConfirm: () => void;
    onCancel: () => void;
}

const INTENT_ICONS: Record<Intent, React.ReactNode> = {
    danger:  <RiAlertLine />,
    warning: <RiErrorWarningLine />,
    info:    <RiInformationLine />,
};

export default function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    intent = "danger",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onCancel]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby={description ? "confirm-modal-desc" : undefined}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className={styles.modal}>
                <div className={`${styles.iconWrap} ${styles[intent]}`}>
                    {INTENT_ICONS[intent]}
                </div>

                <h2 className={styles.title} id="confirm-modal-title">
                    {title}
                </h2>

                {description && (
                    <p className={styles.description} id="confirm-modal-desc">
                        {description}
                    </p>
                )}

                <div className={styles.actions}>
                    <button
                        className={styles.btnCancel}
                        onClick={onCancel}
                        type="button"
                        id="confirm-modal-cancel"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        className={`${styles.btnConfirm} ${styles[intent]}`}
                        onClick={onConfirm}
                        type="button"
                        id="confirm-modal-confirm"
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
