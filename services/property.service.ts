import api from "@/lib/axios";

export interface PropertyPhoto {
    url: string;
    caption?: string;
    sortOrder: number;
}

interface Amenity {
    id: string;
    title: string;
    image: string | null;
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

interface FurnishingOption {
    id: string;
    title: string;
}

interface NearbyTagOption {
    id: string;
    title: string;
    image: string | null;
}
    
export interface PropertyOptionsResponse {
    amenities: Amenity[];
    nearbyTags: NearbyTagOption[];
    furnishingOptions: FurnishingOption[];
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

export interface PropertyFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    purpose?: string;
    status?: string;
}

export interface PropertyDetailPhoto {
    id: string;
    url: string;
    minioKey?: string | null;
    caption?: string | null;
    sortOrder: number;
    uploadedAt?: string;
}

export interface PropertyCreatedBy {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
}

export interface PropertyDetail {
    id: string;
    slug?: string | null;
    propertyName: string;
    description: string;
    purpose: string;
    type: string;
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
    extraProperties?: {
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
    country?: string;
    contactPhone: string;
    contactWhatsapp: string;
    contactVerified?: boolean;
    amenities: Amenity[];
    nearbyTags: string[];
    otherFeatures?: string;
    status: string;
    submissionCount?: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: PropertyCreatedBy;
    photos: PropertyDetailPhoto[];
    featuredSubscriptions?: any[];
    isWishlisted?: boolean;
    isFeatured?: boolean;
}

export const propertyService = {
    getProperties: async (params: PropertyFilterParams = {}): Promise<GetPropertiesResponse> => {
        const { page = 1, limit = 10, search, type, purpose, status } = params;
        const queryParams: Record<string, any> = { page, limit };
        if (search) queryParams.search = search;
        if (type) queryParams.type = type;
        if (purpose) queryParams.purpose = purpose;
        if (status) queryParams.status = status;
        const response = await api.get(`/listings/dealer`, { params: queryParams });
        return response.data;
    },

    getPropertyById: async (id: string): Promise<PropertyDetail> => {
        const response = await api.get(`/listings/${id}`);
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
