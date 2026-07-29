"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { chatService } from "@/services/chat.service";

interface MessagesMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface UseMessagesReturn {
    messages: ChatMessage[];
    meta: MessagesMeta | null;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    fetchMessages: (conversationId: string, page?: number) => Promise<void>;
    fetchMoreMessages: (conversationId: string) => Promise<void>;
    appendMessage: (message: ChatMessage) => void;
    replaceMessage: (tempId: string, confirmed: ChatMessage) => void;
    resetMessages: () => void;
}

const LIMIT = 50;

export function useMessages(): UseMessagesReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [meta, setMeta] = useState<MessagesMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Track which conversationId was last loaded to avoid stale fetches
    const lastConvIdRef = useRef<string | null>(null);

    const fetchMessages = useCallback(
        async (conversationId: string, page = 1) => {
            setLoading(true);
            setError(null);
            lastConvIdRef.current = conversationId;
            try {
                const res = await chatService.getMessages(
                    conversationId,
                    page,
                    LIMIT
                );
                // Guard: ignore response if user switched conversation mid-flight
                if (lastConvIdRef.current !== conversationId) return;
                setMessages(res.data);
                setMeta(res.meta);
            } catch (err: unknown) {
                if (lastConvIdRef.current !== conversationId) return;
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to load messages.";
                setError(message);
            } finally {
                if (lastConvIdRef.current === conversationId) {
                    setLoading(false);
                }
            }
        },
        []
    );

    const fetchMoreMessages = useCallback(
        async (conversationId: string) => {
            if (!meta || meta.page >= meta.totalPages || loadingMore) return;
            setLoadingMore(true);
            try {
                const nextPage = meta.page + 1;
                const res = await chatService.getMessages(
                    conversationId,
                    nextPage,
                    LIMIT
                );
                if (lastConvIdRef.current !== conversationId) return;
                // Older messages are prepended
                setMessages((prev) => [...res.data, ...prev]);
                setMeta(res.meta);
            } catch {
                // silently ignore load-more failures
            } finally {
                setLoadingMore(false);
            }
        },
        [meta, loadingMore]
    );

    const appendMessage = useCallback((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    const replaceMessage = useCallback(
        (tempId: string, confirmed: ChatMessage) => {
            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? confirmed : m))
            );
        },
        []
    );

    const resetMessages = useCallback(() => {
        setMessages([]);
        setMeta(null);
        setError(null);
        setLoading(false);
        setLoadingMore(false);
        lastConvIdRef.current = null;
    }, []);

    return {
        messages,
        meta,
        loading,
        loadingMore,
        error,
        fetchMessages,
        fetchMoreMessages,
        appendMessage,
        replaceMessage,
        resetMessages,
    };
}
