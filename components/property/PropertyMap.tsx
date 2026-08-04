"use client";

import dynamic from "next/dynamic";
import styles from "@/components/property/propertyMap.module.css";

interface PropertyMapProps {
    latitude: number;
    longitude: number;
    propertyName: string;
}

const PropertyMapView = dynamic(() => import("./PropertyMapView"), {
    ssr: false,
    loading: () => <div className={styles.mapShell}><div className={styles.mapCanvas} /></div>,
});

export default function PropertyMap(props: PropertyMapProps) {
    return <PropertyMapView {...props} />;
}
