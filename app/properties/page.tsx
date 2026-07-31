"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    FiPlus,
    FiSearch,
    FiEye,
    FiImage,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiX,
    FiRotateCcw,
} from "react-icons/fi";
import { AppLayout, Button, Badge } from "@/components/ui";
import { propertyService, PropertyListing, PropertyFilterParams } from "@/services/property.service";
import styles from "./page.module.css";

const PROPERTY_TYPES = ["VILLA", "APARTMENT", "TOWNHOUSE", "PENTHOUSE", "STUDIO", "COMMERCIAL", "LAND"];
const PROPERTY_PURPOSES = ["SALE", "RENT"];
const PROPERTY_STATUSES = ["PENDING", "ACTIVE", "INACTIVE", "RESUBMITED", "REJECTED", "SOLD"];

export default function PropertiesPage() {
    const router = useRouter();
    const [propertiesList, setPropertiesList] = useState<PropertyListing[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number }>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectedPurpose, setSelectedPurpose] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(10);

    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProperties();
    }, [page, limit, searchQuery, selectedType, selectedPurpose, selectedStatus]);

    // Close filter dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params: PropertyFilterParams = {
                page,
                limit,
                search: searchQuery.trim() || undefined,
                type: selectedType || undefined,
                purpose: selectedPurpose || undefined,
                status: selectedStatus || undefined,
            };
            const res = await propertyService.getProperties(params);
            
            setPropertiesList(res.data || []);
            if (res.meta) {
                setMeta(res.meta);
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const clearAllFilters = () => {
        setSelectedType("");
        setSelectedPurpose("");
        setSelectedStatus("");
        setPage(1);
    };

    const activeFilterCount = [selectedType, selectedPurpose, selectedStatus].filter(Boolean).length;

    const displayedProperties = propertiesList.filter((prop) => {
        if (selectedType && prop.type?.title?.toUpperCase() !== selectedType.toUpperCase()) return false;
        if (selectedPurpose && prop.purpose?.toUpperCase() !== selectedPurpose.toUpperCase()) return false;
        if (selectedStatus && prop.status?.toUpperCase() !== selectedStatus.toUpperCase()) return false;
        return true;
    });

    const getStatusVariant = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "success";
            case "PENDING": return "warning";
            case "RESUBMITED": return "warning";
            case "REJECTED": return "danger";
            case "SOLD": return "info";
            case "INACTIVE":
            default: return "default";
        }
    };

    const totalProperties = meta.total || displayedProperties.length;
    const startItem = totalProperties > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
    const endItem = Math.min(meta.page * meta.limit, totalProperties);

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

                <div className={styles.filtersSection}>
                    <div className={styles.toolbar}>
                        <div className={styles.searchWrapper}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by name, reference, location..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className={styles.filterMenuWrapper} ref={filterRef}>
                            <button
                                type="button"
                                className={`${styles.filterToggleBtn} ${activeFilterCount > 0 ? styles.filterToggleActive : ""}`}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <FiFilter size={16} />
                                <span>Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className={styles.filterBadge}>{activeFilterCount}</span>
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className={styles.filterDropdown}>
                                    <div className={styles.filterDropdownHeader}>
                                        <div className={styles.filterTitle}>
                                            <FiFilter size={15} /> Filter Properties
                                        </div>
                                        <div className={styles.headerActions}>
                                            {activeFilterCount > 0 && (
                                                <button
                                                    type="button"
                                                    className={styles.clearBtn}
                                                    onClick={clearAllFilters}
                                                >
                                                    <FiRotateCcw size={12} /> Clear all
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className={styles.closeBtn}
                                                onClick={() => setIsFilterOpen(false)}
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Property Type Filter */}
                                    <div className={styles.filterSection}>
                                        <label className={styles.filterLabel}>Property Type</label>
                                        <div className={styles.pillGrid}>
                                            <button
                                                type="button"
                                                className={`${styles.pillOption} ${!selectedType ? styles.pillActive : ""}`}
                                                onClick={() => { setSelectedType(""); setPage(1); }}
                                            >
                                                All
                                            </button>
                                            {PROPERTY_TYPES.map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    className={`${styles.pillOption} ${selectedType === t ? styles.pillActive : ""}`}
                                                    onClick={() => { setSelectedType(selectedType === t ? "" : t); setPage(1); }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Purpose Filter */}
                                    <div className={styles.filterSection}>
                                        <label className={styles.filterLabel}>Purpose</label>
                                        <div className={styles.pillGrid}>
                                            <button
                                                type="button"
                                                className={`${styles.pillOption} ${!selectedPurpose ? styles.pillActive : ""}`}
                                                onClick={() => { setSelectedPurpose(""); setPage(1); }}
                                            >
                                                All
                                            </button>
                                            {PROPERTY_PURPOSES.map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    className={`${styles.pillOption} ${selectedPurpose === p ? styles.pillActive : ""}`}
                                                    onClick={() => { setSelectedPurpose(selectedPurpose === p ? "" : p); setPage(1); }}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <div className={styles.filterSection}>
                                        <label className={styles.filterLabel}>Status</label>
                                        <div className={styles.pillGrid}>
                                            <button
                                                type="button"
                                                className={`${styles.pillOption} ${!selectedStatus ? styles.pillActive : ""}`}
                                                onClick={() => { setSelectedStatus(""); setPage(1); }}
                                            >
                                                All
                                            </button>
                                            {PROPERTY_STATUSES.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    className={`${styles.pillOption} ${selectedStatus === s ? styles.pillActive : ""}`}
                                                    onClick={() => { setSelectedStatus(selectedStatus === s ? "" : s); setPage(1); }}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!loading && searchQuery.trim() && (
                            <span className={styles.resultCount}>
                                {totalProperties} result{totalProperties === 1 ? "" : "s"}
                            </span>
                        )}
                    </div>

                    {/* Active Filter Chips */}
                    {activeFilterCount > 0 && (
                        <div className={styles.activeFiltersRow}>
                            <span className={styles.activeFiltersLabel}>Active Filters:</span>
                            {selectedType && (
                                <span className={styles.filterChip}>
                                    Type: <strong>{selectedType}</strong>
                                    <button onClick={() => { setSelectedType(""); setPage(1); }} title="Remove filter">
                                        <FiX size={12} />
                                    </button>
                                </span>
                            )}
                            {selectedPurpose && (
                                <span className={styles.filterChip}>
                                    Purpose: <strong>{selectedPurpose}</strong>
                                    <button onClick={() => { setSelectedPurpose(""); setPage(1); }} title="Remove filter">
                                        <FiX size={12} />
                                    </button>
                                </span>
                            )}
                            {selectedStatus && (
                                <span className={styles.filterChip}>
                                    Status: <strong>{selectedStatus}</strong>
                                    <button onClick={() => { setSelectedStatus(""); setPage(1); }} title="Remove filter">
                                        <FiX size={12} />
                                    </button>
                                </span>
                            )}
                            <button className={styles.clearAllLink} onClick={clearAllFilters}>
                                Reset all
                            </button>
                        </div>
                    )}
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
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={`skeleton-${i}`}>
                                            <td className={styles.td}>
                                                <div className={styles.skeletonBlock} style={{ width: 64, height: 48, borderRadius: 6 }} />
                                            </td>
                                            <td className={styles.td}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                    <div className={styles.skeletonBlock} style={{ width: 140, height: 16 }} />
                                                    <div className={styles.skeletonBlock} style={{ width: 80, height: 12 }} />
                                                </div>
                                            </td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 70, height: 22 }} /></td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 90, height: 16 }} /></td>
                                            <td className={styles.td}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                    <div className={styles.skeletonBlock} style={{ width: 100, height: 16 }} />
                                                    <div className={styles.skeletonBlock} style={{ width: 80, height: 12 }} />
                                                </div>
                                            </td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 60, height: 22 }} /></td>
                                            <td className={styles.td} style={{ textAlign: "right" }}>
                                                <div className={styles.skeletonBlock} style={{ width: 32, height: 32, borderRadius: "50%", marginLeft: "auto" }} />
                                            </td>
                                        </tr>
                                    ))
                                ) : displayedProperties.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyState}>
                                            No properties found matching the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedProperties.map((prop: PropertyListing) => (
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
                                                <span className={styles.typeBadge}>{prop.type?.title}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.price}>{prop.price.toLocaleString()}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.propName}>{prop.areaName}</div>
                                                <div className={styles.propLocation}>{prop.municipality?.name}</div>
                                            </td>
                                            <td className={styles.td}>
                                                <Badge variant={getStatusVariant(prop.status)}>
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

                    <div className={styles.pagination}>
                        <div className={styles.pageInfo}>
                            Showing {startItem} to {endItem} of {totalProperties} properties
                        </div>

                        <div className={styles.paginationRight}>
                            <div className={styles.pageControls}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1 || loading}
                                    aria-label="Previous Page"
                                >
                                    <FiChevronLeft size={16} />
                                </button>

                                {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map(
                                    (pageNum) => (
                                        <button
                                            key={pageNum}
                                            className={`${styles.pageBtn} ${pageNum === page ? styles.active : ""}`}
                                            onClick={() => setPage(pageNum)}
                                            disabled={loading}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                )}

                                <button
                                    className={styles.pageBtn}
                                    onClick={() =>
                                        setPage((p) => Math.min(meta.totalPages || 1, p + 1))
                                    }
                                    disabled={page >= (meta.totalPages || 1) || loading}
                                    aria-label="Next Page"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


