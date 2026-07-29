export type MessageType = "TEXT" | "IMAGE" | "LOCATION";

export type UserRole = "USER" | "DEALER" | "DEALER_STAFF" | "ADMIN";

export interface ChatUser {
    id: string;
    name: string;
    email?: string;
    role?: UserRole | string;
    avatar?: string;
}

export interface ChatListingPhoto {
    url: string;
    caption?: string;
    sortOrder?: number;
}

export interface ChatListing {
    id: string;
    propertyName: string;
    type?: string;
    purpose?: string;
    price?: number;
    areaName?: string;
    municipality?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    addressLine1?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    photos?: ChatListingPhoto[];
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    type: MessageType;
    content?: string | null;
    mediaUrl?: string | null;
    mediaUrls?: string[];
    latitude?: number | null;
    longitude?: number | null;
    locationLabel?: string | null;
    createdAt: string;
    sender: ChatUser;
    isOptimistic?: boolean;
    status?: "sent" | "delivered" | "read";
}

export interface ConversationParticipant {
    userId: string;
    user: ChatUser;
}

export interface Conversation {
    id: string;
    listingId?: string;
    userId?: string;
    participantIds?: string[];
    createdAt: string;
    updatedAt: string;
    listing: ChatListing;
    user: ChatUser;
    participants?: ConversationParticipant[];
    lastMessage?: ChatMessage | null;
    unreadCount?: number;
    isOnline?: boolean;
}

export type ChatTabFilter = "all" | "unread" | "my_listings";
