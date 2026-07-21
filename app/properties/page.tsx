"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiSearch, FiEye, FiImage } from "react-icons/fi";
import { AppLayout, Button, Badge } from "@/components/ui";
import { propertyService, PropertyListing, GetPropertiesResponse } from "@/services/property.service";
import styles from "./page.module.css";

export default function PropertiesPage() {
    const router = useRouter();
    const [data, setData] = useState<GetPropertiesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 12;

    useEffect(() => {
        fetchProperties(page);
    }, [page]);

    const fetchProperties = async (p: number) => {
        setLoading(true);
        try {
            const res = await propertyService.getProperties(p, limit);
            setData(res);
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIntent = (status: string) => {
        switch (status.toUpperCase()) {
            case "ACTIVE": return "success";
            case "PENDING": return "warning";
            case "REJECTED": return "danger";
            default: return "neutral";
        }
    };

    return (
        <AppLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Property Inventory</h1>
                        <p className={styles.subtitle}>Manage and monitor your property portfolio.</p>
                    </div>
                    <Button onClick={() => router.push("/properties/create")}>
                        <FiPlus /> Add Property
                    </Button>
                </div>

                <div className={styles.filters}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            className={styles.searchInput}
                        />
                    </div>
                    {/* Add more filters here later if needed */}
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Thumbnail</th>
                                    <th className={styles.th}>Property Name</th>
                                    <th className={styles.th}>Type</th>
                                    <th className={styles.th}>Price (QAR)</th>
                                    <th className={styles.th}>Location</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={styles.th} style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className={styles.td} style={{ textAlign: "center", padding: "40px" }}>
                                            Loading properties...
                                        </td>
                                    </tr>
                                ) : data?.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.td} style={{ textAlign: "center", padding: "40px" }}>
                                            No properties found.
                                        </td>
                                    </tr>
                                ) : (
                                    data?.data.map((prop: PropertyListing) => (
                                        <tr key={prop.id} className={styles.tr}>
                                            <td className={styles.td}>
                                                {prop.photos && prop.photos.length > 0 ? (
                                                    <img
                                                        src={prop.photos[0].url}
                                                        alt={prop.propertyName}
                                                        className={styles.thumbnail}
                                                    />
                                                ) : (
                                                    <div className={styles.thumbnail} style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                                                        <FiImage size={24} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.propName}>{prop.propertyName}</div>
                                                <div className={styles.propLocation}>REF: {prop.id.substring(0, 8)}</div>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.typeBadge}>{prop.type}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.price}>{prop.price.toLocaleString()}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.propName}>{prop.areaName}</div>
                                                <div className={styles.propLocation}>{prop.municipality}</div>
                                            </td>
                                            <td className={styles.td}>
                                                <Badge intent={getStatusIntent(prop.status)}>
                                                    {prop.status}
                                                </Badge>
                                            </td>
                                            <td className={styles.td} style={{ textAlign: "right" }}>
                                                <button 
                                                    className={styles.actionBtn}
                                                    title="View Property"
                                                    onClick={() => router.push(`/properties/${prop.id}`)}
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && data && data.meta.totalPages > 1 && (
                        <div className={styles.pagination}>
                            <div className={styles.pageInfo}>
                                Showing page <strong>{data.meta.page}</strong> of <strong>{data.meta.totalPages}</strong> ({data.meta.total} total)
                            </div>
                            <div className={styles.pageControls}>
                                <button
                                    className={styles.pageBtn}
                                    disabled={data.meta.page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &lt;
                                </button>
                                <button className={`${styles.pageBtn} ${styles.active}`}>
                                    {data.meta.page}
                                </button>
                                <button
                                    className={styles.pageBtn}
                                    disabled={data.meta.page === data.meta.totalPages}
                                    onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
