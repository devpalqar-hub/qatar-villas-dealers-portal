"use client";

import React from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { defaultLeafletIcon } from "@/components/property/leafletIcon";
import styles from "@/components/property/propertyMap.module.css";

interface PropertyMapProps {
    latitude: number;
    longitude: number;
    propertyName: string;
}

function PropertyMapViewport({ latitude, longitude }: { latitude: number; longitude: number }) {
    const map = useMap();

    React.useEffect(() => {
        map.setView([latitude, longitude], 15, { animate: true });

        const frameId = window.requestAnimationFrame(() => {
            if (map.getContainer()) {
                map.invalidateSize();
            }
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [latitude, longitude, map]);

    return null;
}

export default function PropertyMapView({ latitude, longitude, propertyName }: PropertyMapProps) {
    return (
        <div className={styles.mapShell}>
            <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                className={styles.mapCanvas}
                scrollWheelZoom={false}
                dragging
                doubleClickZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <PropertyMapViewport latitude={latitude} longitude={longitude} />
                <Marker position={[latitude, longitude]} icon={defaultLeafletIcon}>
                    <Popup>
                        <span className={styles.popupTitle}>{propertyName}</span>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
