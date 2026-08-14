"use client";

import React from "react";
import styles from "./Switch.module.css";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
    id?: string;
}

export default function Switch({ checked, onChange, label, description, disabled = false, id }: SwitchProps) {
    return (
        <label className={`${styles.row} ${disabled ? styles.disabled : ""}`} htmlFor={id}>
            <span className={styles.textGroup}>
                <span className={styles.label}>{label}</span>
                {description && <span className={styles.description}>{description}</span>}
            </span>

            <span
                className={`${styles.track} ${checked ? styles.trackOn : ""}`}
                role="switch"
                aria-checked={checked}
            >
                <input
                    id={id}
                    type="checkbox"
                    className={styles.hiddenInput}
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className={styles.thumb} />
            </span>
        </label>
    );
}
