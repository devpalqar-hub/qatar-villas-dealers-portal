"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiMoreVertical, FiArrowLeft, FiFlag } from "react-icons/fi";
import { Conversation } from "@/types/chat";
import ReportUserModal from "./ReportUserModal";
import styles from "./ChatHeader.module.css";

interface ChatHeaderProps {
    conversation: Conversation;
    onBack?: () => void;
}

export default function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
    const t = useTranslations("chat");
    const { user, listing, isOnline } = conversation || {};

    const userName = user?.name || user?.email || "User";
    const initials = userName
        ? userName
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

    const propertyName = listing?.propertyName || "";
    const avatar = user?.avatar;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    {onBack && (
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={onBack}
                            aria-label={t("backToConversations")}
                        >
                            <FiArrowLeft size={18} />
                        </button>
                    )}
                    <div className={styles.avatarWrapper}>
                        {avatar ? (
                            <img src={avatar} alt={userName} className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarFallback}>{initials}</div>
                        )}
                        {isOnline && <span className={styles.onlineBadge} />}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.name}>{userName}</span>
                        {propertyName ? <span className={styles.listingName}>{propertyName}</span> : null}
                    </div>
                </div>

                <div className={styles.rightActions}>
                    <div className={styles.menuContainer} ref={menuRef}>
                        <button
                            type="button"
                            className={styles.actionBtn}
                            aria-label={t("menu")}
                            title={t("menu")}
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                        >
                            <FiMoreVertical size={18} />
                        </button>
                        {isMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                <button
                                    type="button"
                                    className={styles.dropdownItemDanger}
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setIsReportModalOpen(true);
                                    }}
                                >
                                    <FiFlag size={15} />
                                    <span>Report User</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReportUserModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                reportedUserId={user?.id || ""}
                reportedUserName={userName}
                listingId={listing?.id}
            />
        </>
    );
}
