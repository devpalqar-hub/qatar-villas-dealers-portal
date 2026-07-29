"use client";

import React from "react";
import { FiMessageSquare } from "react-icons/fi";
import styles from "./EmptyState.module.css";

export default function EmptyState() {
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <FiMessageSquare size={32} />
            </div>
            <h3 className={styles.title}>Select a conversation</h3>
            <p className={styles.subtitle}>
                Choose a conversation from the list to view inquiry details and message history.
            </p>
        </div>
    );
}
