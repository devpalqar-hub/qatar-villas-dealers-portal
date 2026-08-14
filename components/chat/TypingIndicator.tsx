"use client";

import React from "react";
import { useTranslations } from "next-intl";
import styles from "./TypingIndicator.module.css";

interface TypingIndicatorProps {
    name?: string;
    avatar?: string;
}

export default function TypingIndicator({
    name,
    avatar,
}: TypingIndicatorProps) {
    const t = useTranslations("chat");
    const displayName = name || t("defaultCustomerName");
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={styles.wrapper}>
            {avatar ? (
                <img src={avatar} alt={displayName} className={styles.avatar} />
            ) : (
                <div className={styles.avatarFallback}>{initials || displayName[0]}</div>
            )}
            <div className={styles.bubble}>
                <span className={styles.text}>{t("isTyping", { name: displayName })}</span>
                <div className={styles.dots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            </div>
        </div>
    );
}
