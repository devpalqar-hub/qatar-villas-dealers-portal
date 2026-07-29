// Socket Hook stub for Step 1
export interface UseChatSocketReturn {
    isConnected: boolean;
    sendMessage: (payload: any) => void;
    sendTyping: (conversationId: string) => void;
    joinConversation: (listingId: string) => void;
}

export function useChatSocket(): UseChatSocketReturn {
    return {
        isConnected: false,
        sendMessage: () => {},
        sendTyping: () => {},
        joinConversation: () => {},
    };
}
