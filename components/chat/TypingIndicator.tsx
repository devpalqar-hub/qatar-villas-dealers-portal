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
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={styles.wrapper}>
            {avatar ? (
                <img src={avatar} alt={name} className={styles.avatar} />
            ) : (
                <div className={styles.avatarFallback}>{initials}</div>
            )}
            <div className={styles.bubble}>
                <span className={styles.text}>{name} is typing...</span>
                <div className={styles.dots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            </div>
        </div>
    );
}
