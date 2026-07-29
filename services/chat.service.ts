import api from "@/lib/axios";
import { Conversation, ChatMessage } from "@/types/chat";

export interface GetMessagesResponse {
    data: ChatMessage[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const chatService = {
    getConversations: async (): Promise<Conversation[]> => {
        const response = await api.get<Conversation[]>("/chat/conversations");
        return response.data;
    },

    getMessages: async (
        conversationId: string,
        page = 1,
        limit = 50
    ): Promise<GetMessagesResponse> => {
        const response = await api.get<GetMessagesResponse>(
            `/chat/conversations/${conversationId}/messages`,
            {
                params: { page, limit },
            }
        );
        return response.data;
    },

    uploadImage: async (file: File): Promise<{ url: string; key: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<{ url: string; key: string }>(
            "/chat/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },
};
