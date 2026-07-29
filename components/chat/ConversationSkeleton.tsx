"use client";

import React from "react";
import styles from "./ConversationSkeleton.module.css";

interface ConversationSkeletonProps {
    count?: number;
}

export default function ConversationSkeleton({
    count = 6,
}: ConversationSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={styles.skeletonItem}>
                    <div className={styles.avatarSkeleton} />
                    <div className={styles.contentSkeleton}>
                        <div
                            className={styles.lineSkeleton}
                            style={{ height: 14, width: `${60 + (i % 3) * 15}%` }}
                        />
                        <div
                            className={styles.lineSkeleton}
                            style={{ height: 12, width: "40%" }}
                        />
                        <div
                            className={styles.lineSkeleton}
                            style={{ height: 12, width: `${50 + (i % 4) * 10}%` }}
                        />
                    </div>
                </div>
            ))}
        </>
    );
}
