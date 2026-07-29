"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import styles from "./ActionRequiredBanner.module.css";

interface Props {
    title?: string;
    description?: string;
}

export default function ActionRequiredBanner({
    title = "Action Required",
    description = "Your application has been rejected. Please review the feedback below, update the required information, and resubmit your application.",
}: Props) {
    return (
        <div className={styles.banner}>
            <div className={styles.iconCircle}>
                <FiX size={18} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
    );
}
