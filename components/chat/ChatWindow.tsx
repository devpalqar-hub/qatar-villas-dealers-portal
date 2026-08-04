"use client";

import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import {useLocale, useTranslations} from "next-intl";
import { Conversation, ChatMessage } from "@/types/chat";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import { MessageSkeleton, MessageError, LoadMoreBar } from "./MessageSkeleton";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps { conversation: Conversation; messages: ChatMessage[]; currentUserId: string; isTyping?: boolean; loading?: boolean; loadingMore?: boolean; hasMore?: boolean; error?: string | null; onSendMessage: (text: string) => void; onAttachImage?: (file: File) => void; onBack?: () => void; onLoadMore?: () => void; onRetry?: () => void; }

const ChatWindow = memo(function ChatWindow({ conversation, messages, currentUserId, isTyping = false, loading = false, loadingMore = false, hasMore = false, error = null, onSendMessage, onAttachImage, onBack, onLoadMore, onRetry }: ChatWindowProps) {
    const t = useTranslations("chat");
    const locale = useLocale();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const prevScrollHeightRef = useRef(0);

    const groupMessagesByDate = (items: ChatMessage[]) => {
        const groups: { label: string; messages: ChatMessage[] }[] = [];
        items.forEach((msg) => {
            let label = t("today");
            try {
                const d = new Date(msg.createdAt);
                if (!isNaN(d.getTime())) {
                    const now = new Date();
                    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                    if (diff === 0) label = t("today");
                    else if (diff === 1) label = t("yesterday");
                    else label = d.toLocaleDateString(locale, { month: "short", day: "numeric", year: diff > 365 ? "numeric" : undefined });
                }
            } catch { label = t("today"); }
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.label === label) lastGroup.messages.push(msg); else groups.push({ label, messages: [msg] });
        });
        return groups;
    };

    const handleScroll = useCallback(() => { const el = scrollContainerRef.current; if (!el) return; const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight; setIsAtBottom(distanceFromBottom < 120); if (el.scrollTop < 80 && hasMore && !loadingMore && onLoadMore) { prevScrollHeightRef.current = el.scrollHeight; onLoadMore(); } }, [hasMore, loadingMore, onLoadMore]);
    useEffect(() => { if (!loadingMore && prevScrollHeightRef.current && scrollContainerRef.current) { const newScrollHeight = scrollContainerRef.current.scrollHeight; scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current; prevScrollHeightRef.current = 0; } }, [loadingMore, messages.length]);
    useEffect(() => { if (loading) return; if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); setIsAtBottom(true); }, [conversation.id, loading]);
    useEffect(() => { if (isAtBottom && messagesEndRef.current && !loading) messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages.length, isTyping, isAtBottom, loading]);
    const dateGroups = groupMessagesByDate(messages);

    const renderBody = () => {
        if (loading) return <MessageSkeleton />;
        if (error) return <MessageError message={error} onRetry={onRetry} />;
        return <>{loadingMore && <LoadMoreBar />}{messages.length === 0 ? <div className={styles.noMessages}>{t("noMessages")}</div> : dateGroups.map((group) => <React.Fragment key={group.label}><div className={styles.dateSeparator}><span className={styles.dateLabel}>{group.label}</span></div>{group.messages.map((msg) => <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} />)}</React.Fragment>)}{isTyping && <TypingIndicator name={conversation.user.name} avatar={conversation.user.avatar} />}<div ref={messagesEndRef} /></>;
    };

    return <div className={styles.container}><ChatHeader conversation={conversation} onBack={onBack} /><div className={styles.messagesArea} ref={scrollContainerRef} onScroll={handleScroll}>{renderBody()}</div><MessageInput onSendMessage={onSendMessage} onAttachImage={onAttachImage} disabled={loading || !!error} /></div>;
});

export default ChatWindow;
