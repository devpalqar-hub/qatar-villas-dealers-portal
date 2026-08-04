"use client";

import React, { useState } from "react";
import {useTranslations} from "next-intl";
import { FiSearch, FiSliders, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { Conversation, ChatTabFilter } from "@/types/chat";
import ConversationItem from "./ConversationItem";
import ConversationSkeleton from "./ConversationSkeleton";
import styles from "./ConversationList.module.css";

interface ConversationListProps { conversations: Conversation[]; selectedConversationId?: string; onSelectConversation: (conversation: Conversation) => void; loading?: boolean; error?: string | null; onRetry?: () => void; }

export default function ConversationList({ conversations, selectedConversationId, onSelectConversation, loading = false, error = null, onRetry }: ConversationListProps) {
    const t = useTranslations("chat");
    const tPagination = useTranslations("pagination");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<ChatTabFilter>("all");
    const totalCount = conversations.length;
    const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    const filteredConversations = conversations.filter((c) => { if (activeTab === "unread" && (!c.unreadCount || c.unreadCount === 0)) return false; if (searchQuery.trim()) { const query = searchQuery.toLowerCase().trim(); const matchesName = c.user.name.toLowerCase().includes(query); const matchesListing = c.listing.propertyName.toLowerCase().includes(query); const matchesMsg = c.lastMessage?.content?.toLowerCase().includes(query); return matchesName || matchesListing || !!matchesMsg; } return true; });

    const renderBody = () => {
        if (loading) return <ConversationSkeleton count={6} />;
        if (error) return <div className={styles.errorState}><FiAlertCircle size={32} className={styles.errorIcon} /><p className={styles.errorTitle}>{t("failedToLoad")}</p><p className={styles.errorMsg}>{error}</p>{onRetry && <button type="button" className={styles.retryBtn} onClick={onRetry}><FiRefreshCw size={14} />{t("retry")}</button>}</div>;
        if (filteredConversations.length === 0) return <div className={styles.emptySearch}>{searchQuery ? t("noResults", {query: searchQuery}) : t("noConversations")}</div>;
        return filteredConversations.map((c) => <ConversationItem key={c.id} conversation={c} isSelected={c.id === selectedConversationId} onSelect={onSelectConversation} />);
    };

    return <div className={styles.container}><div className={styles.header}><h2 className={styles.title}>{t("title")}</h2><button type="button" className={styles.filterBtn} aria-label={t("filterConversations")}><FiSliders size={18} /></button></div><div className={styles.searchWrapper}><FiSearch className={styles.searchIcon} size={16} /><input type="text" placeholder={t("searchPlaceholder")} className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={loading || !!error} /></div><div className={styles.tabsRow}><button type="button" className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabActive : ""}`} onClick={() => setActiveTab("all")}>{t("tabs.all")}{!loading && <span className={styles.tabBadge}>{totalCount}</span>}</button><button type="button" className={`${styles.tabBtn} ${activeTab === "unread" ? styles.tabActive : ""}`} onClick={() => setActiveTab("unread")}>{t("tabs.unread")}{!loading && <span className={styles.tabBadge}>{unreadTotal}</span>}</button><button type="button" className={`${styles.tabBtn} ${activeTab === "my_listings" ? styles.tabActive : ""}`} onClick={() => setActiveTab("my_listings")}>{t("tabs.myListings")}</button></div><div className={styles.list}>{renderBody()}</div></div>;
}
