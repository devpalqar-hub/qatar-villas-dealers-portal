import { CreatePropertyPayload, PropertyOptionsResponse } from "@/services/property.service";

export interface StepProps {
    formData: Partial<CreatePropertyPayload>;
    updateFormData: (data: Partial<CreatePropertyPayload>) => void;
    options: PropertyOptionsResponse | null;
    locationError?: string | null;
}
