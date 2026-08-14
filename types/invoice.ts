export type InvoiceType = "LISTING_PAYMENT" | "FEATURED_LISTING" | "DEALER_SUBSCRIPTION";

export type InvoiceStatus = "PAID" | "FREE";

export interface InvoiceLineItem {
    amount: number;
    quantity: number;
    unitPrice: number;
    description: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    type: InvoiceType;
    status: InvoiceStatus;
    billedToId: string;
    billedToName: string;
    billedToEmail: string;
    billedToPhone: string;
    billedToCompany: string;
    billedToTradeNumber: string;
    billedToAddress: string;
    description: string;
    lineItems: InvoiceLineItem[];
    referenceId: string;
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    paidAt: string | null;
    pdfObjectKey: string | null;
    emailedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceListMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface InvoiceListResponse {
    data: Invoice[];
    meta: InvoiceListMeta;
}

export interface InvoiceFilters {
    page?: number;
    limit?: number;
    type?: InvoiceType | "";
    status?: InvoiceStatus | "";
    search?: string;
    from?: string;
    to?: string;
    userId?: string;
}
