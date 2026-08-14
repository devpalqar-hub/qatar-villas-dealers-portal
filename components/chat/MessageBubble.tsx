"use client";

import React from "react";
import { FiCheck, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { ChatMessage } from "@/types/chat";
import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
    message: ChatMessage;
    currentUserId: string;
}

export default function MessageBubble({
    message,
    currentUserId,
}: MessageBubbleProps) {
    const t = useTranslations("chat");
    const isOutgoing = message.sender.id === currentUserId;

    const renderContent = () => {
        switch (message.type) {
            case "IMAGE":
                const urls = message.mediaUrls || (message.mediaUrl ? [message.mediaUrl] : []);
                return (
                    <div>
                        <div className={styles.imageContainer}>
                            {urls.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`Attachment ${idx + 1}`}
                                    className={styles.imageItem}
                                />
                            ))}
                        </div>
                        {message.content && (
                            <div className={styles.imageCaption}>
                                {message.content}
                            </div>
                        )}
                    </div>
                );

            case "LOCATION":
                return (
                    <div>
                        <div className={styles.locationCard}>
                            <div className={styles.locationIcon}>
                                <FiMapPin size={20} />
                            </div>
                            <div className={styles.locationDetails}>
                                <span className={styles.locationTitle}>
                                    {message.locationLabel || t("sharedLocation")}
                                </span>
                                {message.latitude && message.longitude && (
                                    <span className={styles.locationCoords}>
                                        {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}
                                    </span>
                                )}
                            </div>
                        </div>
                        {message.content && (
                            <div className={styles.textContent}>{message.content}</div>
                        )}
                    </div>
                );

            case "TEXT":
            default:
                return (
                    <div className={styles.textContent}>
                        {message.content}
                    </div>
                );
        }
    };

    return (
        <div
            className={`${styles.row} ${
                isOutgoing ? styles.outgoingRow : styles.incomingRow
            }`}
        >
            <div
                className={`${styles.bubble} ${
                    isOutgoing ? styles.outgoing : styles.incoming
                }`}
            >
                {renderContent()}

                <div className={styles.meta}>
                    <span>{message.createdAt}</span>
                    {isOutgoing && (
                        <span className={styles.statusIcon} title={message.status || "sent"}>
                            {message.status === "read" ? (
                                // Render double checkmarks ✓✓
                                <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: -2 }}>
                                    ✓✓
                                </span>
                            ) : (
                                <FiCheck size={12} />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
