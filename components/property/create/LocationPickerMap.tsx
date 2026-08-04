"use client";

import React from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import { defaultLeafletIcon } from "@/components/property/leafletIcon";
import { DOHA_COORDINATES } from "@/components/property/mapConstants";
import styles from "@/components/property/propertyMap.module.css";

interface MapPoint {
    latitude: number;
    longitude: number;
}

interface LocationPickerMapProps {
    latitude?: number;
    longitude?: number;
    preferredCenter?: MapPoint | null;
    focusLocation?: MapPoint | null;
    onLocationChange: (lat: number, lng: number) => void;
}

function MapEventHandler({ onLocationChange }: Pick<LocationPickerMapProps, "onLocationChange">) {
    useMapEvents({
        click: (event: LeafletMouseEvent) => {
            onLocationChange(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

function MapViewport({ center, zoom }: { center: MapPoint; zoom: number }) {
    const map = useMap();

    React.useEffect(() => {
        map.setView([center.latitude, center.longitude], zoom, {
            animate: true,
        });

        const frameId = window.requestAnimationFrame(() => {
            if (map.getContainer()) {
                map.invalidateSize();
            }
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [center.latitude, center.longitude, map, zoom]);

    return null;
}

export default function LocationPickerMap({
    latitude,
    longitude,
    preferredCenter,
    focusLocation,
    onLocationChange,
}: LocationPickerMapProps) {
    const hasSelectedLocation = latitude !== undefined && longitude !== undefined;
    const selectedPosition = hasSelectedLocation
        ? ({ latitude, longitude } as MapPoint)
        : null;

    const displayCenter = focusLocation || selectedPosition || preferredCenter || DOHA_COORDINATES;
    const zoom = hasSelectedLocation || focusLocation ? 15 : 12;

    return (
        <div className={styles.mapShell}>
            <MapContainer
                center={[displayCenter.latitude, displayCenter.longitude]}
                zoom={zoom}
                className={styles.mapCanvas}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewport center={displayCenter} zoom={zoom} />
                <MapEventHandler onLocationChange={onLocationChange} />
                {selectedPosition && (
                    <Marker
                        position={[selectedPosition.latitude, selectedPosition.longitude]}
                        draggable
                        icon={defaultLeafletIcon}
                        eventHandlers={{
                            dragend: (event) => {
                                const marker = event.target as L.Marker;
                                const position = marker.getLatLng();
                                onLocationChange(position.lat, position.lng);
                            },
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
