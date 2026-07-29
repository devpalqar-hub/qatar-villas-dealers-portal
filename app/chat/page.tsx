"use client";

import React, { useEffect, useCallback, useState } from "react";
import AppLayout from "@/components/layout/AppLayout/AppLayout";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyState from "@/components/chat/EmptyState";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { CURRENT_DEALER_USER } from "@/data/mockChatData";
import { Conversation, ChatMessage } from "@/types/chat";
import { chatService } from "@/services/chat.service";
import styles from "./page.module.css";

export default function ChatPage() {
    // ── Conversations ──────────────────────────────────────────────────────────
    const {
        conversations,
        loading: convsLoading,
        error: convsError,
        refetch: refetchConversations,
        updateConversationLocally,
        clearUnread,
    } = useConversations();

    // ── Selected conversation ──────────────────────────────────────────────────
    const [selectedId, setSelectedId] = useState<string>("");

    // ── Messages ───────────────────────────────────────────────────────────────
    const {
        messages,
        meta: messagesMeta,
        loading: msgsLoading,
        loadingMore,
        error: msgsError,
        fetchMessages,
        fetchMoreMessages,
        appendMessage,
        resetMessages,
    } = useMessages();

    // ── Typing ─────────────────────────────────────────────────────────────────
    const [isTyping, setIsTyping] = useState<boolean>(false);

    // ── Load messages whenever selected conversation changes ───────────────────
    useEffect(() => {
        if (!selectedId) return;
        resetMessages();
        fetchMessages(selectedId);
    }, [selectedId, fetchMessages, resetMessages]);

    const activeConversation = conversations.find((c) => c.id === selectedId);
    const hasMoreMessages = messagesMeta
        ? messagesMeta.page < messagesMeta.totalPages
        : false;

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleSelectConversation = useCallback(
        (conv: Conversation) => {
            if (conv.id === selectedId) return;
            setSelectedId(conv.id);
            clearUnread(conv.id);
            setIsTyping(false);
        },
        [selectedId, clearUnread]
    );

    const handleLoadMore = useCallback(() => {
        if (!selectedId) return;
        fetchMoreMessages(selectedId);
    }, [selectedId, fetchMoreMessages]);

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!selectedId || !activeConversation) return;

            // Optimistic message — append immediately for instant UX
            const tempId = `temp-${Date.now()}`;
            const optimisticMsg: ChatMessage = {
                id: tempId,
                conversationId: selectedId,
                type: "TEXT",
                content: text,
                createdAt: new Date().toISOString(),
                status: "sent",
                isOptimistic: true,
                sender: CURRENT_DEALER_USER,
            };
            appendMessage(optimisticMsg);

            // Update conversation list preview optimistically
            updateConversationLocally({
                ...activeConversation,
                lastMessage: optimisticMsg,
                updatedAt: optimisticMsg.createdAt,
            });

            // Dismiss typing indicator when dealer responds
            setIsTyping(false);

            // NOTE: Actual send will be via Socket.IO in Step 3.
            // For Step 2 the optimistic message stays in local state.
        },
        [selectedId, activeConversation, appendMessage, updateConversationLocally]
    );

    const handleAttachImage = useCallback(
        async (file: File) => {
            if (!selectedId || !activeConversation) return;

            // Optimistic local preview while uploading
            const localPreviewUrl = URL.createObjectURL(file);
            const tempId = `temp-img-${Date.now()}`;
            const optimisticMsg: ChatMessage = {
                id: tempId,
                conversationId: selectedId,
                type: "IMAGE",
                mediaUrls: [localPreviewUrl],
                content: null,
                createdAt: new Date().toISOString(),
                status: "sent",
                isOptimistic: true,
                sender: CURRENT_DEALER_USER,
            };
            appendMessage(optimisticMsg);

            try {
                // Upload image to server and get presigned URL
                const { url } = await chatService.uploadImage(file);

                // Replace optimistic message with server-confirmed URL
                const confirmedMsg: ChatMessage = {
                    ...optimisticMsg,
                    id: `img-${Date.now()}`,
                    mediaUrls: [url],
                    isOptimistic: false,
                };
                // replaceMessage will be used in Step 3 after socket confirmation;
                // for now just update the URL in the appended message via re-append
                appendMessage(confirmedMsg);

                // Update conversation preview
                updateConversationLocally({
                    ...activeConversation,
                    lastMessage: { ...confirmedMsg, content: "📷 Photo" },
                    updatedAt: confirmedMsg.createdAt,
                });
            } catch {
                // On upload failure, mark the optimistic message as failed (no-op for Step 2)
                console.error("Image upload failed");
            }
        },
        [selectedId, activeConversation, appendMessage, updateConversationLocally]
    );

    const handleRetryMessages = useCallback(() => {
        if (selectedId) fetchMessages(selectedId);
    }, [selectedId, fetchMessages]);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <AppLayout>
            <div className={styles.pageContainer}>
                {/* Left Column: Conversation List */}
                <div
                    className={`${styles.leftColumn} ${
                        selectedId ? styles.hideMobile : ""
                    }`}
                >
                    <ConversationList
                        conversations={conversations}
                        selectedConversationId={selectedId}
                        onSelectConversation={handleSelectConversation}
                        loading={convsLoading}
                        error={convsError}
                        onRetry={refetchConversations}
                    />
                </div>

                {/* Right Column: Chat Window or Empty State */}
                <div
                    className={`${styles.rightColumn} ${
                        !selectedId ? styles.hideMobile : ""
                    }`}
                >
                    {activeConversation ? (
                        <ChatWindow
                            conversation={activeConversation}
                            messages={messages}
                            currentUserId={CURRENT_DEALER_USER.id}
                            isTyping={isTyping}
                            loading={msgsLoading}
                            loadingMore={loadingMore}
                            hasMore={hasMoreMessages}
                            error={msgsError}
                            onSendMessage={handleSendMessage}
                            onAttachImage={handleAttachImage}
                            onBack={() => setSelectedId("")}
                            onLoadMore={handleLoadMore}
                            onRetry={handleRetryMessages}
                        />
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
