/**
 * Buckets bulk-upload draft validation errors (free-text strings from the
 * backend) against the specific Create Property form fields they relate to,
 * so the form can highlight exactly what needs the dealer's attention.
 *
 * Errors that don't match a known field are still shown verbatim in the
 * top-level draft banner — nothing here is ever silently dropped.
 */
export type DraftWarningField = "furnishingId" | "amenities" | "nearbyTags";

export function parseDraftFieldWarnings(
    errors: string[] = []
): Partial<Record<DraftWarningField, string[]>> {
    const warnings: Partial<Record<DraftWarningField, string[]>> = {};

    errors.forEach((error) => {
        const lower = error.toLowerCase();
        if (lower.startsWith("furnishing")) {
            warnings.furnishingId = [...(warnings.furnishingId || []), error];
        } else if (lower.startsWith("amenities") || lower.startsWith("amenity")) {
            warnings.amenities = [...(warnings.amenities || []), error];
        } else if (lower.startsWith("nearbytags") || lower.startsWith("nearby tags") || lower.startsWith("nearby tag")) {
            warnings.nearbyTags = [...(warnings.nearbyTags || []), error];
        }
    });

    return warnings;
}
