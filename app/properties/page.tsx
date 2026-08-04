"use client";

import React, { useEffect, useState, useRef } from "react";
import { FiPlus, FiSearch, FiEye, FiImage, FiChevronLeft, FiChevronRight, FiFilter, FiX, FiRotateCcw, FiCheckCircle } from "react-icons/fi";
import {useFormatter, useTranslations} from "next-intl";
import { AppLayout, Button, Badge, ConfirmModal } from "@/components/ui";
import { propertyService, PropertyListing, PropertyFilterParams } from "@/services/property.service";
import {useRouter} from "@/i18n/navigation";
import styles from "./page.module.css";

const PROPERTY_TYPES = ["VILLA", "APARTMENT", "TOWNHOUSE", "PENTHOUSE", "STUDIO", "COMMERCIAL", "LAND"];
const PROPERTY_PURPOSES = ["SALE", "RENT"];
const PROPERTY_STATUSES = ["PENDING", "ACTIVE", "INACTIVE", "RESUBMITED", "REJECTED", "SOLD"];

export default function PropertiesPage() {
    const t = useTranslations();
    const router = useRouter();
    const format = useFormatter();
    const [propertiesList, setPropertiesList] = useState<PropertyListing[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [propertyToMarkSold, setPropertyToMarkSold] = useState<PropertyListing | null>(null);
    const [sellingPropertyId, setSellingPropertyId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params: PropertyFilterParams = { page, limit, search: searchQuery.trim() || undefined, type: selectedType || undefined, purpose: selectedPurpose || undefined, status: selectedStatus || undefined };
            const res = await propertyService.getProperties(params);
            setPropertiesList(res.data || []);
            if (res.meta) setMeta(res.meta);
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void fetchProperties(); }, [page, limit, searchQuery, selectedType, selectedPurpose, selectedStatus]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const clearAllFilters = () => { setSelectedType(""); setSelectedPurpose(""); setSelectedStatus(""); setPage(1); };
    const handleOpenMarkSold = (property: PropertyListing) => { setActionError(null); setPropertyToMarkSold(property); };
    const handleConfirmMarkSold = async () => {
        if (!propertyToMarkSold) return;
        setSellingPropertyId(propertyToMarkSold.id); setActionError(null);
        try {
            await propertyService.markPropertyAsSold(propertyToMarkSold.id);
            setPropertiesList((current) => current.map((property) => property.id === propertyToMarkSold.id ? { ...property, status: "SOLD" } : property));
            setPropertyToMarkSold(null);
        } catch (error: unknown) {
            const serviceError = error as { response?: { data?: { message?: string } } };
            setActionError(serviceError.response?.data?.message || t("property.markSoldError"));
        } finally { setSellingPropertyId(null); }
    };

    const activeFilterCount = [selectedType, selectedPurpose, selectedStatus].filter(Boolean).length;
    const displayedProperties = propertiesList.filter((prop) => (!selectedType || prop.type?.title?.toUpperCase() === selectedType.toUpperCase()) && (!selectedPurpose || prop.purpose?.toUpperCase() === selectedPurpose.toUpperCase()) && (!selectedStatus || prop.status?.toUpperCase() === selectedStatus.toUpperCase()));
    const getStatusVariant = (status: string) => status?.toUpperCase() === "ACTIVE" ? "success" : status?.toUpperCase() === "PENDING" || status?.toUpperCase() === "RESUBMITED" ? "warning" : status?.toUpperCase() === "REJECTED" ? "danger" : status?.toUpperCase() === "SOLD" ? "info" : "default";
    const totalProperties = meta.total || displayedProperties.length;
    const startItem = totalProperties > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
    const endItem = Math.min(meta.page * meta.limit, totalProperties);

    return (
        <AppLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div><h1 className={styles.title}>{t("property.inventoryTitle")}</h1><p className={styles.subtitle}>{t("property.inventorySubtitle")}</p></div>
                    <Button onClick={() => router.push("/properties/create")}><FiPlus /> {t("property.addProperty")}</Button>
                </div>
                {actionError && <div className={styles.actionErrorBanner}>{actionError}</div>}
                <div className={styles.filtersSection}>
                    <div className={styles.toolbar}>
                        <div className={styles.searchWrapper}><FiSearch className={styles.searchIcon} /><input type="text" placeholder={t("property.searchPlaceholder")} className={styles.searchInput} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} /></div>
                        <div className={styles.filterMenuWrapper} ref={filterRef}>
                            <button type="button" className={`${styles.filterToggleBtn} ${activeFilterCount > 0 ? styles.filterToggleActive : ""}`} onClick={() => setIsFilterOpen(!isFilterOpen)}><FiFilter size={16} /><span>{t("property.filter")}</span>{activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}</button>
                            {isFilterOpen && <div className={styles.filterDropdown}><div className={styles.filterDropdownHeader}><div className={styles.filterTitle}><FiFilter size={15} /> {t("property.filterTitle")}</div><div className={styles.headerActions}>{activeFilterCount > 0 && <button type="button" className={styles.clearBtn} onClick={clearAllFilters}><FiRotateCcw size={12} /> {t("property.clearAll")}</button>}<button type="button" className={styles.closeBtn} onClick={() => setIsFilterOpen(false)}><FiX size={16} /></button></div></div>
                                <div className={styles.filterSection}><label className={styles.filterLabel}>{t("property.filters.type")}</label><div className={styles.pillGrid}><button type="button" className={`${styles.pillOption} ${!selectedType ? styles.pillActive : ""}`} onClick={() => { setSelectedType(""); setPage(1); }}>{t("property.filters.all")}</button>{PROPERTY_TYPES.map((item) => <button key={item} type="button" className={`${styles.pillOption} ${selectedType === item ? styles.pillActive : ""}`} onClick={() => { setSelectedType(selectedType === item ? "" : item); setPage(1); }}>{t(`propertyTypeEnum.${item}`)}</button>)}</div></div>
                                <div className={styles.filterSection}><label className={styles.filterLabel}>{t("property.filters.purpose")}</label><div className={styles.pillGrid}><button type="button" className={`${styles.pillOption} ${!selectedPurpose ? styles.pillActive : ""}`} onClick={() => { setSelectedPurpose(""); setPage(1); }}>{t("property.filters.all")}</button>{PROPERTY_PURPOSES.map((item) => <button key={item} type="button" className={`${styles.pillOption} ${selectedPurpose === item ? styles.pillActive : ""}`} onClick={() => { setSelectedPurpose(selectedPurpose === item ? "" : item); setPage(1); }}>{t(`purposeEnum.${item}`)}</button>)}</div></div>
                                <div className={styles.filterSection}><label className={styles.filterLabel}>{t("property.filters.status")}</label><div className={styles.pillGrid}><button type="button" className={`${styles.pillOption} ${!selectedStatus ? styles.pillActive : ""}`} onClick={() => { setSelectedStatus(""); setPage(1); }}>{t("property.filters.all")}</button>{PROPERTY_STATUSES.map((item) => <button key={item} type="button" className={`${styles.pillOption} ${selectedStatus === item ? styles.pillActive : ""}`} onClick={() => { setSelectedStatus(selectedStatus === item ? "" : item); setPage(1); }}>{t(`statusEnum.${item}`)}</button>)}</div></div>
                            </div>}
                        </div>
                        {!loading && searchQuery.trim() && <span className={styles.resultCount}>{t("pagination.results", {count: totalProperties})}</span>}
                    </div>
                    {activeFilterCount > 0 && <div className={styles.activeFiltersRow}><span className={styles.activeFiltersLabel}>{t("property.activeFilters")}</span>{selectedType && <span className={styles.filterChip}>{t("property.filters.typePrefix")} <strong>{t(`propertyTypeEnum.${selectedType}`)}</strong><button onClick={() => { setSelectedType(""); setPage(1); }} title={t("property.filters.remove")}><FiX size={12} /></button></span>}{selectedPurpose && <span className={styles.filterChip}>{t("property.filters.purposePrefix")} <strong>{t(`purposeEnum.${selectedPurpose}`)}</strong><button onClick={() => { setSelectedPurpose(""); setPage(1); }} title={t("property.filters.remove")}><FiX size={12} /></button></span>}{selectedStatus && <span className={styles.filterChip}>{t("property.filters.statusPrefix")} <strong>{t(`statusEnum.${selectedStatus}`)}</strong><button onClick={() => { setSelectedStatus(""); setPage(1); }} title={t("property.filters.remove")}><FiX size={12} /></button></span>}<button className={styles.clearAllLink} onClick={clearAllFilters}>{t("property.resetAll")}</button></div>}
                </div>
                <div className={styles.tableContainer}><div className={styles.tableWrapper}><table className={styles.table}><thead><tr><th className={styles.th}>{t("property.thumbnail")}</th><th className={styles.th}>{t("property.name")}</th><th className={styles.th}>{t("property.type")}</th><th className={styles.th}>{t("property.price")}</th><th className={styles.th}>{t("property.location")}</th><th className={styles.th}>{t("property.status")}</th><th className={styles.th} style={{ textAlign: "right" }}>{t("property.actions")}</th></tr></thead><tbody>{loading ? Array.from({ length: 5 }).map((_, i) => <tr key={`skeleton-${i}`}><td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 64, height: 48, borderRadius: 6 }} /></td><td className={styles.td}><div style={{ display: "flex", flexDirection: "column", gap: 6 }}><div className={styles.skeletonBlock} style={{ width: 140, height: 16 }} /><div className={styles.skeletonBlock} style={{ width: 80, height: 12 }} /></div></td><td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 70, height: 22 }} /></td><td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 90, height: 16 }} /></td><td className={styles.td}><div style={{ display: "flex", flexDirection: "column", gap: 6 }}><div className={styles.skeletonBlock} style={{ width: 100, height: 16 }} /><div className={styles.skeletonBlock} style={{ width: 80, height: 12 }} /></div></td><td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 60, height: 22 }} /></td><td className={styles.td} style={{ textAlign: "right" }}><div className={styles.actionsCell}><div className={styles.skeletonBlock} style={{ width: 32, height: 32, borderRadius: "50%" }} /><div className={styles.skeletonBlock} style={{ width: 32, height: 32, borderRadius: "50%" }} /></div></td></tr>) : displayedProperties.length === 0 ? <tr><td colSpan={7} className={styles.emptyState}>{t("property.empty")}</td></tr> : displayedProperties.map((prop) => { const isSold = prop.status?.toUpperCase() === "SOLD"; const isSelling = sellingPropertyId === prop.id; return <tr key={prop.id} className={styles.tr}><td className={styles.td}>{prop.photos && prop.photos.length > 0 ? <img src={prop.photos[0].url} alt={prop.propertyName} className={styles.thumbnail} /> : <div className={styles.thumbnail} style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}><FiImage size={24} /></div>}</td><td className={styles.td}><div className={styles.propName}>{prop.propertyName}</div><div className={styles.propLocation}>REF: {prop.id.substring(0, 8)}</div></td><td className={styles.td}><span className={styles.typeBadge}>{prop.type?.title}</span></td><td className={styles.td}><span className={styles.price}>{format.number(prop.price)}</span></td><td className={styles.td}><div className={styles.propName}>{prop.areaName}</div><div className={styles.propLocation}>{prop.municipality?.name}</div></td><td className={styles.td}><Badge variant={getStatusVariant(prop.status)}>{t(`statusEnum.${prop.status.toUpperCase()}`)}</Badge></td><td className={styles.td} style={{ textAlign: "right" }}><div className={styles.actionsCell}><button className={styles.actionBtn} title={t("property.viewProperty")} onClick={() => router.push(`/properties/${prop.id}`)}><FiEye size={18} /></button><button className={`${styles.actionBtn} ${styles.soldActionBtn} ${isSold ? styles.actionBtnDisabled : ""}`} title={isSold ? t("property.alreadySold") : t("property.markSold")} onClick={() => handleOpenMarkSold(prop)} disabled={isSold || isSelling}><FiCheckCircle size={18} /></button></div></td></tr>; })}</tbody></table></div>
                <div className={styles.pagination}><div className={styles.pageInfo}>{t("pagination.showingProperties", {start: startItem, end: endItem, total: totalProperties})}</div><div className={styles.paginationRight}><div className={styles.pageControls}><button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} aria-label={t("pagination.previous")}><FiChevronLeft size={16} /></button>{Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map((pageNum) => <button key={pageNum} className={`${styles.pageBtn} ${pageNum === page ? styles.active : ""}`} onClick={() => setPage(pageNum)} disabled={loading}>{pageNum}</button>)}<button className={styles.pageBtn} onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))} disabled={page >= (meta.totalPages || 1) || loading} aria-label={t("pagination.next")}><FiChevronRight size={16} /></button></div></div></div></div>
            </div>
            <ConfirmModal open={Boolean(propertyToMarkSold)} title={t("property.markSoldTitle")} description={propertyToMarkSold ? t("property.markSoldDescription", {name: propertyToMarkSold.propertyName}) : undefined} confirmLabel={sellingPropertyId ? t("property.markSoldUpdating") : t("property.markSold")} cancelLabel={t("common.cancel")} intent="warning" onCancel={() => { if (!sellingPropertyId) setPropertyToMarkSold(null); }} onConfirm={() => { void handleConfirmMarkSold(); }} />
        </AppLayout>
    );
}
