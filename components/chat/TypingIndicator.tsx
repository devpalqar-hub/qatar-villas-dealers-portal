"use client";

import React from "react";
import styles from "./TypingIndicator.module.css";

interface TypingIndicatorProps {
    name?: string;
    avatar?: string;
}

export default function TypingIndicator({
    name = "Customer",
    avatar,
}: TypingIndicatorProps) {
    const displayName = name || "Customer";
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
                <div className={styles.avatarFallback}>{initials || "C"}</div>
            )}
            <div className={styles.bubble}>
                <span className={styles.text}>{displayName} is typing...</span>
                <div className={styles.dots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            </div>
        </div>
    );
}
