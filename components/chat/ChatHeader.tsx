"use client";

import React from "react";
import { FiPhone, FiMoreVertical, FiArrowLeft } from "react-icons/fi";
import { Conversation } from "@/types/chat";
import styles from "./ChatHeader.module.css";

interface ChatHeaderProps {
    conversation: Conversation;
    onBack?: () => void;
}

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
    const { user, listing, isOnline } = conversation;

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={styles.header}>
            <div className={styles.left}>
                {onBack && (
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={onBack}
                        aria-label="Back to conversations"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                )}

                <div className={styles.avatarWrapper}>
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarFallback}>{initials}</div>
                    )}
                    {isOnline && <span className={styles.onlineBadge} />}
                </div>

                <div className={styles.userInfo}>
                    <span className={styles.name}>{user.name}</span>
                    <span className={styles.listingName}>
                        {listing.propertyName}
                    </span>
                </div>
            </div>

            <div className={styles.rightActions}>
                <button
                    type="button"
                    className={styles.actionBtn}
                    aria-label="Call customer placeholder"
                    title="Call customer"
                >
                    <FiPhone size={18} />
                </button>

                <button
                    type="button"
                    className={styles.actionBtn}
                    aria-label="Conversation menu placeholder"
                    title="Menu"
                >
                    <FiMoreVertical size={18} />
                </button>
            </div>
        </div>
    );
}
