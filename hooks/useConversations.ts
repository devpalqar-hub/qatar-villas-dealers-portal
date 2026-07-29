"use client";

import { useState, useEffect, useCallback } from "react";
import { Conversation } from "@/types/chat";
import { chatService } from "@/services/chat.service";

interface UseConversationsReturn {
    conversations: Conversation[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    updateConversationLocally: (updated: Conversation) => void;
    clearUnread: (conversationId: string) => void;
}

export function useConversations(): UseConversationsReturn {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to load conversations.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const updateConversationLocally = useCallback(
        (updated: Conversation) => {
            setConversations((prev) => {
                const exists = prev.find((c) => c.id === updated.id);
                if (exists) {
                    // Move updated conversation to top of list
                    return [
                        updated,
                        ...prev.filter((c) => c.id !== updated.id),
                    ];
                }
                return prev;
            });
        },
        []
    );

    const clearUnread = useCallback((conversationId: string) => {
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            )
        );
    }, []);

    return {
        conversations,
        loading,
        error,
        refetch: fetch,
        updateConversationLocally,
        clearUnread,
    };
}
