import api from "@/lib/axios";

export interface InquiryVisitor {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface InquiryListingType {
    id: string;
    title: string;
}

export interface InquiryListingMunicipality {
    id: string;
    name: string;
    image?: string | null;
    latitude?: number;
    longitude?: number;
}

export interface InquiryListingFurnishing {
    id: string;
    title: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface InquiryListingAmenity {
    id: string;
    title: string;
    image?: string | null;
}

export interface InquiryListingNearbyTag {
    id: string;
    title: string;
    image?: string | null;
}

export interface InquiryListingPhoto {
    id: string;
    url: string;
    minioKey?: string | null;
    caption?: string | null;
    sortOrder: number;
    uploadedAt?: string;
}

export interface InquiryListingCreatedBy {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    dealerProfile?: {
        id: string;
        dealerName: string;
        coverImage?: string | null;
        contactPhone: string;
    };
}

export interface InquiryListing {
    id: string;
    referenceCode: string;
    slug?: string | null;
    propertyName: string;
    description: string;
    purpose: string;
    typeId: string;
    type: InquiryListingType;
    latitude?: number;
    longitude?: number;
    isPotentialDuplicate?: boolean;
    duplicateOfId?: string | null;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    livingRooms?: number;
    parkingSpaces?: number;
    floorNumber?: number;
    totalFloors?: number;
    yearBuilt?: number;
    furnishingId?: string;
    furnishing?: InquiryListingFurnishing;
    extraProperties?: Record<string, any>;
    price?: number;
    priceNegotiable?: boolean;
    addressLine1?: string;
    addressLine2?: string;
    areaName?: string;
    municipalityId?: string;
    municipality?: InquiryListingMunicipality;
    country?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    contactVerified?: boolean;
    amenities?: InquiryListingAmenity[];
    nearbyTags?: InquiryListingNearbyTag[];
    otherFeatures?: string;
    status?: string;
    submissionCount?: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: InquiryListingCreatedBy;
    photos?: InquiryListingPhoto[];
}

export interface Inquiry {
    id: string;
    listingId: string;
    visitorId: string;
    ownerId: string;
    scheduledAt: string;
    proposedAt?: string | null;
    status: "PENDING" | "APPROVED" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    listing: InquiryListing;
    visitor: InquiryVisitor;
}

export const inquiryService = {
    getInquiriesAsOwner: async (): Promise<Inquiry[]> => {
        const response = await api.get("/visits/as-owner");
        return response.data;
    },

    acceptVisit: async (visitId: string): Promise<Inquiry> => {
        const response = await api.patch(`/visits/${visitId}/accept`);
        return response.data;
    },
};
