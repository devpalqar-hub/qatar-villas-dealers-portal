import api from "@/lib/axios";

export interface PropertyPhoto {
    url: string;
    caption?: string;
    sortOrder: number;
}

export interface CreatePropertyPayload {
    propertyName: string;
    description: string;
    purpose: "SALE" | "RENT";
    type: "VILLA" | "APARTMENT" | "PENTHOUSE" | "LAND";
    latitude: number;
    longitude: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    livingRooms: number;
    parkingSpaces: number;
    floorNumber: number;
    totalFloors: number;
    yearBuilt?: number;
    furnishingStatus: string;
    extraProperties: {
        privatePool?: boolean;
        gardenAreaSqm?: number;
        [key: string]: any;
    };
    price: number;
    priceNegotiable: boolean;
    addressLine1: string;
    addressLine2?: string;
    areaName: string;
    municipality: string;
    contactPhone: string;
    contactWhatsapp: string;
    contactVerified: boolean;
    amenities: string[];
    nearbyTags: string[];
    otherFeatures?: string;
    photos: PropertyPhoto[];
}

export interface PropertyOptionsResponse {
    amenities: string[];
    nearbyTags: string[];
    furnishingOptions: string[];
    areaSuggestions: string[];
}

export interface PropertyListing {
    id: string;
    slug: string | null;
    propertyName: string;
    description: string;
    purpose: string;
    type: string;
    price: number;
    areaName: string;
    municipality: string;
    status: string;
    photos: { url: string; sortOrder: number }[];
    [key: string]: any; // other fields
}

export interface GetPropertiesResponse {
    data: PropertyListing[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const propertyService = {
    getProperties: async (page: number = 1, limit: number = 12): Promise<GetPropertiesResponse> => {
        const response = await api.get(`/listings`, { params: { page, limit } });
        return response.data;
    },

    getPropertyOptions: async (): Promise<PropertyOptionsResponse> => {
        const response = await api.get(`/listings/options`);
        return response.data;
    },

    createProperty: async (data: CreatePropertyPayload): Promise<any> => {
        const response = await api.post(`/listings`, data);
        return response.data;
    },
};
