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
    typeId: string;
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
    furnishingId: string;
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
    municipalityId: string;
    contactPhone: string;
    contactWhatsapp: string;
    contactVerified: boolean;
    amenities: string[];
    nearbyTags: string[];
    otherFeatures?: string;
    photos: PropertyPhoto[];
}

export interface PropertyTypeOption {
    id: string;
    title: string;
    image: string | null;
    listingCount: number;
}

export interface FurnishingOption {
    id: string;
    title: string;
}

export interface MunicipalityOption {
    id: string;
    name: string;
    image: string | null;
    latitude: number;
    longitude: number;
    isPopular: boolean;
    listingCount: number;
    cheapestListingPrice: number | null;
}

interface NearbyTagOption {
    id: string;
    title: string;
    image: string | null;
}

interface Amenity {
    id: string;
    title: string;
    image: string | null;
}

export interface PropertyOptionsResponse {
    amenities: Amenity[];
    nearbyTags: NearbyTagOption[];
    furnishingOptions: FurnishingOption[];
    listingTypes: PropertyTypeOption[];
    municipalities: MunicipalityOption[];
}

export interface PropertyListingType {
    id: string;
    title: string;
}

export interface PropertyListingMunicipality {
    id: string;
    name: string;
    image?: string | null;
    latitude?: number;
    longitude?: number;
}

export interface PropertyListingFurnishing {
    id: string;
    title: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PropertyListing {
    id: string;
    referenceCode: string;
    slug: string | null;
    propertyName: string;
    description: string;
    purpose: "SALE" | "RENT";

    typeId: string;
    type: PropertyListingType;

    price: number;
    areaName: string;

    municipalityId: string;
    municipality: PropertyListingMunicipality;

    furnishingId: string;
    furnishing: PropertyListingFurnishing;

    status: string;

    photos: {
        url: string;
        sortOrder: number;
    }[];

    [key: string]: any;
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

export interface PropertyDetailType {
    id: string;
    title: string;
}

export interface PropertyDetailFurnishing {
    id: string;
    title: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PropertyDetailMunicipality {
    id: string;
    name: string;
    image?: string | null;
    latitude?: number;
    longitude?: number;
}

export interface PropertyDetail {
    id: string;
    referenceCode: string;
    slug?: string | null;

    propertyName: string;
    description: string;
    purpose: "SALE" | "RENT";

    typeId: string;
    type: PropertyDetailType;

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

    furnishingId: string;
    furnishing: PropertyDetailFurnishing;

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

    municipalityId: string;
    municipality: PropertyDetailMunicipality;

    country?: string;

    contactPhone: string;
    contactWhatsapp: string;
    contactVerified?: boolean;

    amenities: Amenity[];
    nearbyTags: NearbyTagOption[];

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
