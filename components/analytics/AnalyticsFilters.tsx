"use client";

import React from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import {
    DealerAnalyticsParams,
    ListingStatus,
    ListingPurpose,
    AnalyticsSortBy,
    SortOrder,
} from "@/types/analytics";
import styles from "./AnalyticsFilters.module.css";

// React icons safe import fallback
const IconSearch = FI.FiSearch;
const IconCalendar = FI.FiCalendar;
const IconFilter = FI.FiFilter;
const IconRefresh = FI.FiRefreshCw;
const IconSliders = FI.FiSliders;
const IconArrowUp = FI.FiArrowUp;
const IconArrowDown = FI.FiArrowDown;
const IconX = FI.FiX;

interface AnalyticsFiltersProps {
    params: DealerAnalyticsParams;
    onParamsChange: (newParams: Partial<DealerAnalyticsParams>) => void;
    onReset: () => void;
    loading?: boolean;
}

const STATUS_OPTIONS: { value: ListingStatus | ""; label: string }[] = [
    { value: "", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING", label: "Pending" },
    { value: "SOLD", label: "Sold" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "REJECTED", label: "Rejected" },
];

const PURPOSE_OPTIONS: { value: ListingPurpose | ""; label: string }[] = [
    { value: "", label: "All Purposes" },
    { value: "SALE", label: "For Sale" },
    { value: "RENT", label: "For Rent" },
];

const SORT_BY_OPTIONS: { value: AnalyticsSortBy; label: string }[] = [
    { value: "viewsCount", label: "Views" },
    { value: "impressionsCount", label: "Impressions" },
    { value: "reachCount", label: "Reach" },
    { value: "createdAt", label: "Date Created" },
    { value: "price", label: "Price" },
];

export default function AnalyticsFilters({
    params,
    onParamsChange,
    onReset,
    loading = false,
}: AnalyticsFiltersProps) {
    const t = useTranslations("analyticsPage.filters");

    // Quick date preset helper
    const applyDatePreset = (days: number | "all" | "thisMonth") => {
        if (days === "all") {
            onParamsChange({ startDate: undefined, endDate: undefined, page: 1 });
            return;
        }

        const now = new Date();
        const endDateStr = now.toISOString().split("T")[0];

        if (days === "thisMonth") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startDateStr = startOfMonth.toISOString().split("T")[0];
            onParamsChange({ startDate: startDateStr, endDate: endDateStr, page: 1 });
            return;
        }

        const start = new Date();
        start.setDate(now.getDate() - days);
        const startDateStr = start.toISOString().split("T")[0];
        onParamsChange({ startDate: startDateStr, endDate: endDateStr, page: 1 });
    };

    const activeFilterCount =
        (params.startDate ? 1 : 0) +
        (params.endDate ? 1 : 0) +
        (params.search ? 1 : 0) +
        (params.status ? 1 : 0) +
        (params.purpose ? 1 : 0);

    return (
        <div className={styles.container}>
            {/* Top Toolbar */}
            <div className={styles.topRow}>
                {/* Search Bar */}
                <div className={styles.searchWrapper}>
                    <IconSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={t("searchPlaceholder")}
                        value={params.search || ""}
                        onChange={(e) => onParamsChange({ search: e.target.value, page: 1 })}
                    />
                    {params.search && (
                        <button
                            type="button"
                            className={styles.clearSearchBtn}
                            onClick={() => onParamsChange({ search: "", page: 1 })}
                            aria-label="Clear search"
                        >
                            <IconX size={14} />
                        </button>
                    )}
                </div>

                {/* Date Presets */}
                <div className={styles.presetsGroup}>
                    <button
                        type="button"
                        className={`${styles.presetBtn} ${
                            !params.startDate && !params.endDate ? styles.presetActive : ""
                        }`}
                        onClick={() => applyDatePreset("all")}
                    >
                        {t("allTime")}
                    </button>
                    <button
                        type="button"
                        className={styles.presetBtn}
                        onClick={() => applyDatePreset(7)}
                    >
                        {t("last7Days")}
                    </button>
                    <button
                        type="button"
                        className={styles.presetBtn}
                        onClick={() => applyDatePreset(30)}
                    >
                        {t("last30Days")}
                    </button>
                    <button
                        type="button"
                        className={styles.presetBtn}
                        onClick={() => applyDatePreset("thisMonth")}
                    >
                        {t("thisMonth")}
                    </button>
                </div>

                {/* Reset Filters */}
                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={onReset}
                        disabled={loading}
                    >
                        <IconRefresh size={14} className={loading ? styles.spinning : ""} />
                        <span>{t("reset")}</span>
                        <span className={styles.badgeCount}>{activeFilterCount}</span>
                    </button>
                )}
            </div>

            {/* Filter Controls Row */}
            <div className={styles.bottomRow}>
                {/* Custom Date Picker Inputs */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <IconCalendar size={13} />
                        <span>Date Range</span>
                    </label>
                    <div className={styles.dateRangeGroup}>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={params.startDate || ""}
                            onChange={(e) =>
                                onParamsChange({ startDate: e.target.value || undefined, page: 1 })
                            }
                        />
                        <span className={styles.dateSeparator}>to</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={params.endDate || ""}
                            onChange={(e) =>
                                onParamsChange({ endDate: e.target.value || undefined, page: 1 })
                            }
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <IconFilter size={13} />
                        <span>{t("status")}</span>
                    </label>
                    <select
                        className={styles.selectInput}
                        value={params.status || ""}
                        onChange={(e) =>
                            onParamsChange({
                                status: (e.target.value as ListingStatus) || "",
                                page: 1,
                            })
                        }
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Purpose Filter */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <IconSliders size={13} />
                        <span>{t("purpose")}</span>
                    </label>
                    <select
                        className={styles.selectInput}
                        value={params.purpose || ""}
                        onChange={(e) =>
                            onParamsChange({
                                purpose: (e.target.value as ListingPurpose) || "",
                                page: 1,
                            })
                        }
                    >
                        {PURPOSE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By & Order */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <span>{t("sortBy")}</span>
                    </label>
                    <div className={styles.sortGroup}>
                        <select
                            className={styles.selectInput}
                            value={params.sortBy || "viewsCount"}
                            onChange={(e) =>
                                onParamsChange({
                                    sortBy: e.target.value as AnalyticsSortBy,
                                    page: 1,
                                })
                            }
                        >
                            {SORT_BY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className={styles.sortOrderBtn}
                            title={`Order: ${params.sortOrder || "desc"}`}
                            onClick={() =>
                                onParamsChange({
                                    sortOrder: params.sortOrder === "asc" ? "desc" : "asc",
                                    page: 1,
                                })
                            }
                        >
                            {params.sortOrder === "asc" ? (
                                <IconArrowUp size={15} />
                            ) : (
                                <IconArrowDown size={15} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
