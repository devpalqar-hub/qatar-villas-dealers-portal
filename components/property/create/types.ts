import { CreatePropertyPayload, PropertyOptionsResponse } from "@/services/property.service";
import { DraftWarningField } from "@/utils/draftFieldWarnings";

export interface StepProps {
    formData: Partial<CreatePropertyPayload>;
    updateFormData: (data: Partial<CreatePropertyPayload>) => void;
    options: PropertyOptionsResponse | null;
    locationError?: string | null;
    /** Bulk-upload draft validation errors bucketed by the field they concern. */
    draftFieldWarnings?: Partial<Record<DraftWarningField, string[]>>;
}
