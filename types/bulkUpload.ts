import { PropertyPhoto } from "@/services/property.service";

export type DraftStatus = "PENDING" | "USED" | "DISCARDED";

export type DraftSource = "EXCEL" | "CSV" | "JSON";

/**
 * Normalized property fields resolved by the backend from a bulk-upload row.
 * Every field is optional — a row that failed validation for a given field
 * simply omits it here, while `errors` explains why.
 */
export interface BulkUploadDraftData {
    propertyName?: string;
    description?: string;
    purpose?: "SALE" | "RENT";
    typeId?: string;
    price?: number;
    priceNegotiable?: boolean;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    livingRooms?: number;
    parkingSpaces?: number;
    floorNumber?: number;
    totalFloors?: number;
    yearBuilt?: number;
    furnishingId?: string;
    addressLine1?: string;
    addressLine2?: string;
    areaName?: string;
    municipalityId?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    contactVerified?: boolean;
    amenities?: string[];
    nearbyTags?: string[];
    otherFeatures?: string;
    latitude?: number;
    longitude?: number;
    extraProperties?: Record<string, unknown>;
    photos?: PropertyPhoto[];
}

/** A single row result returned inline from POST /listings/bulk-upload. */
export interface BulkUploadDraftResult {
    id: string;
    rowNumber: number;
    isValid: boolean;
    errors: string[];
    data: BulkUploadDraftData;
}

export interface BulkUploadResponse {
    batchId: string;
    source: DraftSource;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    drafts: BulkUploadDraftResult[];
}

export interface DraftCreatedBy {
    id: string;
    name: string;
    email: string;
}

/** A draft as returned by GET /listings/drafts and GET /listings/drafts/{id}. */
export interface PropertyDraft {
    id: string;
    batchId: string;
    source: DraftSource;
    rowNumber: number;
    dealerUserId: string;
    createdById: string;
    status: DraftStatus;
    data: BulkUploadDraftData;
    errors: string[];
    listingId: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: DraftCreatedBy;
}

export type DraftDetail = PropertyDraft;

export interface DraftListMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DraftListResponse {
    data: PropertyDraft[];
    meta: DraftListMeta;
}

export interface BulkUploadFilters {
    page?: number;
    limit?: number;
    batchId?: string;
    status?: DraftStatus | "";
}

/** Locally-derived, user-friendly label for a batch (not a backend concept). */
export interface KnownBatch {
    batchId: string;
    source: DraftSource;
    createdAt: string;
    count: number;
}
