"use client";

import React from "react";
import dynamic from "next/dynamic";
import {useTranslations} from "next-intl";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui";
import { DOHA_COORDINATES, QATAR_BOUNDS } from "@/components/property/mapConstants";
import styles from "@/components/property/propertyMap.module.css";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), { ssr: false, loading: () => <div className={styles.mapShell}><div className={styles.mapCanvas} /></div> });
interface LocationPickerProps { latitude?: number; longitude?: number; onLocationChange: (lat: number, lng: number) => void; municipalityCenter?: { latitude: number; longitude: number; } | null; error?: string | null; }
interface NominatimResult { place_id: number; lat: string; lon: string; display_name: string; name?: string; }
const SEARCH_DEBOUNCE_MS = 450;
const formatCoordinateLabel = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

export default function LocationPicker({ latitude, longitude, onLocationChange, municipalityCenter, error }: LocationPickerProps) {
    const t = useTranslations("property.form");
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<NominatimResult[]>([]);
    const [searching, setSearching] = React.useState(false);
    const [searchMessage, setSearchMessage] = React.useState<string | null>(null);
    const [selectedAddress, setSelectedAddress] = React.useState<string | null>(null);
    const [focusedLocation, setFocusedLocation] = React.useState<{ latitude: number; longitude: number; } | null>(null);
    const hasSelectedLocation = latitude !== undefined && longitude !== undefined;
    const reverseGeocodeAbortRef = React.useRef<AbortController | null>(null);
    const resolvedCoordinatesRef = React.useRef<string | null>(null);
    const coordinateKey = hasSelectedLocation ? `${latitude},${longitude}` : null;

    const resolveAddress = React.useCallback(async (lat: number, lng: number) => {
        reverseGeocodeAbortRef.current?.abort();
        const controller = new AbortController();
        reverseGeocodeAbortRef.current = controller;
        try {
            const params = new URLSearchParams({ format: "jsonv2", lat: String(lat), lon: String(lng), zoom: "18", addressdetails: "1", "accept-language": "en" });
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, { signal: controller.signal });
            if (!response.ok) throw new Error("Failed to reverse geocode selected location.");
            const data = await response.json() as { display_name?: string };
            resolvedCoordinatesRef.current = `${lat},${lng}`;
            setSelectedAddress(data.display_name || formatCoordinateLabel(lat, lng));
        } catch (fetchError) {
            if ((fetchError as Error).name !== "AbortError") {
                resolvedCoordinatesRef.current = `${lat},${lng}`;
                setSelectedAddress(formatCoordinateLabel(lat, lng));
            }
        }
    }, []);

    React.useEffect(() => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            setSearching(true);
            setSearchMessage(null);
            try {
                const params = new URLSearchParams({ q: trimmedQuery, format: "jsonv2", limit: "5", countrycodes: "qa", addressdetails: "1", bounded: "1", viewbox: `${QATAR_BOUNDS.minLongitude},${QATAR_BOUNDS.maxLatitude},${QATAR_BOUNDS.maxLongitude},${QATAR_BOUNDS.minLatitude}`, "accept-language": "en" });
                const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { signal: controller.signal });
                if (!response.ok) throw new Error("Location search failed.");
                const data = await response.json() as NominatimResult[];
                setResults(data);
                setSearchMessage(data.length === 0 ? t("noSearchResults") : null);
            } catch (fetchError) {
                if ((fetchError as Error).name !== "AbortError") {
                    setResults([]);
                    setSearchMessage(t("searchUnavailable"));
                }
            } finally {
                setSearching(false);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => { controller.abort(); window.clearTimeout(timeoutId); };
    }, [query, t]);

    React.useEffect(() => { if (hasSelectedLocation && resolvedCoordinatesRef.current !== coordinateKey) void resolveAddress(latitude, longitude); }, [coordinateKey, hasSelectedLocation, latitude, longitude, resolveAddress]);
    React.useEffect(() => () => { reverseGeocodeAbortRef.current?.abort(); }, []);
    const handleCoordinateSelection = React.useCallback((lat: number, lng: number) => { onLocationChange(lat, lng); setFocusedLocation({ latitude: lat, longitude: lng }); void resolveAddress(lat, lng); }, [onLocationChange, resolveAddress]);
    const handleSearchChange = (value: string) => { setQuery(value); if (!value.trim()) { setResults([]); setSearchMessage(null); setSearching(false); } };
    const handleSearchSelect = (result: NominatimResult) => { const lat = Number(result.lat); const lng = Number(result.lon); setQuery(result.display_name); setResults([]); setSearchMessage(null); setSelectedAddress(result.display_name); handleCoordinateSelection(lat, lng); };
    const selectedLabel = hasSelectedLocation ? (selectedAddress || formatCoordinateLabel(latitude, longitude)) : t("noSelectedLocation");

    return (
        <div className={styles.locationPicker}>
            <Input label={t("exactPropertyLocation")} placeholder={t("searchLocationPlaceholder")} value={query} onChange={(event) => handleSearchChange(event.target.value)} leftIcon={<FiSearch />} required />
            <div className={styles.searchGroup}>{(results.length > 0 || searchMessage || searching) && <div className={styles.searchResults}>{results.map((result) => <button key={result.place_id} type="button" className={styles.searchResultBtn} onClick={() => handleSearchSelect(result)}><span className={styles.searchResultPrimary}>{result.name || result.display_name}</span><span className={styles.searchResultSecondary}>{result.display_name}</span></button>)}{searching && <div className={styles.searchResultBtn}><span className={styles.searchMeta}>{t("searchingLocations")}</span></div>}{!searching && searchMessage && <div className={styles.searchResultBtn}><span className={styles.searchMeta}>{searchMessage}</span></div>}</div>}</div>
            <LocationPickerMap latitude={latitude} longitude={longitude} preferredCenter={municipalityCenter || DOHA_COORDINATES} focusLocation={focusedLocation} onLocationChange={handleCoordinateSelection} />
            <div className={styles.helperRow}><span>{t("mapHelper")}</span><span>{t("mapTip")}</span></div>
            <div className={styles.selectedLocation}><span className={styles.selectedLocationLabel}>{t("selectedLocation")}</span><div className={styles.selectedLocationValue}><FiMapPin className={styles.selectedLocationIcon} />{selectedLabel}</div></div>
            {error && <div className={styles.inlineError}>{error}</div>}
        </div>
    );
}
