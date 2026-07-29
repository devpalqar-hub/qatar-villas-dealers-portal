"use client";

import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import styles from "./MessageSkeleton.module.css";

// ─── Message Skeleton ─────────────────────────────────────────────────────────

const SKELETON_ROWS: Array<{
    type: "incoming" | "outgoing";
    width: string;
    height: string;
}> = [
    { type: "incoming", width: "55%", height: "48px" },
    { type: "outgoing", width: "45%", height: "36px" },
    { type: "incoming", width: "65%", height: "60px" },
    { type: "outgoing", width: "50%", height: "48px" },
    { type: "incoming", width: "40%", height: "36px" },
    { type: "outgoing", width: "60%", height: "48px" },
];

export function MessageSkeleton() {
    return (
        <div className={styles.skeletonWrapper}>
            {/* Date separator skeleton */}
            <div className={styles.headerSkeleton} />

            {SKELETON_ROWS.map((row, i) => (
                <div
                    key={i}
                    className={
                        row.type === "incoming"
                            ? styles.incomingRow
                            : styles.outgoingRow
                    }
                >
                    {row.type === "incoming" && (
                        <div className={styles.avatarSkeleton} />
                    )}
                    <div
                        className={`${styles.bubbleSkeleton} ${
                            row.type === "incoming"
                                ? styles.incomingBubble
                                : styles.outgoingBubble
                        }`}
                        style={{ width: row.width, height: row.height }}
                    />
                </div>
            ))}
        </div>
    );
}

// ─── Message Error State ──────────────────────────────────────────────────────

interface MessageErrorProps {
    message?: string;
    onRetry?: () => void;
}

export function MessageError({
    message = "Failed to load messages.",
    onRetry,
}: MessageErrorProps) {
    return (
        <div className={styles.errorState}>
            <div className={styles.errorIcon}>
                <FiAlertCircle size={36} />
            </div>
            <p className={styles.errorTitle}>Something went wrong</p>
            <p className={styles.errorMessage}>{message}</p>
            {onRetry && (
                <button
                    type="button"
                    className={styles.retryBtn}
                    onClick={onRetry}
                >
                    Try again
                </button>
            )}
        </div>
    );
}

// ─── Load More Bar ─────────────────────────────────────────────────────────────

export function LoadMoreBar() {
    return (
        <div className={styles.loadMoreBar}>
            <div className={styles.loadMoreSpinner} />
            <span>Loading older messages…</span>
        </div>
    );
}
