"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import styles from "./ActionRequiredBanner.module.css";

interface Props {
    title?: string;
    description?: string;
}

export default function ActionRequiredBanner({
    title,
    description,
}: Props) {
    const t = useTranslations("onboarding.actionRequired");
    const resolvedTitle = title ?? t("title");
    const resolvedDescription = description ?? t("description");
    return (
        <div className={styles.banner}>
            <div className={styles.iconCircle}>
                <FiX size={18} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{resolvedTitle}</h3>
                <p className={styles.description}>{resolvedDescription}</p>
            </div>
        </div>
    );
}
