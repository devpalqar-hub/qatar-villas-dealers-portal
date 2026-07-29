"use client";

import React from "react";
import { Conversation } from "@/types/chat";
import styles from "./ConversationItem.module.css";

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: (conversation: Conversation) => void;
}

export default function ConversationItem({
    conversation,
    isSelected,
    onSelect,
}: ConversationItemProps) {
    const { user, listing, lastMessage, unreadCount, isOnline } = conversation;

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className={`${styles.item} ${isSelected ? styles.active : ""}`}
            onClick={() => onSelect(conversation)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onSelect(conversation);
                }
            }}
        >
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

            <div className={styles.content}>
                <div className={styles.headerRow}>
                    <span className={styles.name}>{user.name}</span>
                    <span className={styles.timestamp}>
                        {lastMessage?.createdAt || ""}
                    </span>
                </div>

                <div className={styles.listingTitle}>
                    {listing.propertyName}
                </div>

                <div className={styles.bodyRow}>
                    <span className={styles.preview}>
                        {lastMessage?.content || "No messages yet"}
                    </span>
                    {unreadCount && unreadCount > 0 ? (
                        <span className={styles.unreadBadge}>{unreadCount}</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
