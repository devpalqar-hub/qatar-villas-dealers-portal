"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DashboardFilterParams, DashboardGranularity } from "@/types/dashboard";
import styles from "./DashboardFilters.module.css";

const IconCalendar = FI.FiCalendar;
const IconFilter = FI.FiFilter;
const IconRefresh = FI.FiRefreshCw;
const IconChevronDown = FI.FiChevronDown;
const IconChevronUp = FI.FiChevronUp;
const IconMapPin = FI.FiMapPin;
const IconLayers = FI.FiLayers;
const IconUser = FI.FiUser;
const IconHome = FI.FiHome;
const IconTag = FI.FiTag;
const IconCheckCircle = FI.FiCheckCircle;

export interface DashboardFilterOption {
    value: string;
    label: string;
}

interface DashboardFiltersProps {
    params: DashboardFilterParams;
    onParamsChange: (next: Partial<DashboardFilterParams>) => void;
    onReset: () => void;
    loading?: boolean;
    listingOptions: DashboardFilterOption[];
    staffOptions: DashboardFilterOption[];
    typeOptions: DashboardFilterOption[];
    municipalityOptions: DashboardFilterOption[];
    statusOptions: DashboardFilterOption[];
    purposeOptions: DashboardFilterOption[];
}

function toDateInputValue(iso?: string): string {
    if (!iso) return "";
    return iso.split("T")[0];
}

export default function DashboardFilters({
    params,
    onParamsChange,
    onReset,
    loading = false,
    listingOptions,
    staffOptions,
    typeOptions,
    municipalityOptions,
    statusOptions,
    purposeOptions,
}: DashboardFiltersProps) {
    const t = useTranslations("dashboard.filters");
    const [expanded, setExpanded] = useState(false);

    const applyPreset = (days: number | "thisMonth" | "thisYear") => {
        const now = new Date();
        const endDateStr = now.toISOString().split("T")[0];

        if (days === "thisMonth") {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            onParamsChange({ startDate: toDateInputValue(start.toISOString()), endDate: endDateStr });
            return;
        }
        if (days === "thisYear") {
            const start = new Date(now.getFullYear(), 0, 1);
            onParamsChange({ startDate: toDateInputValue(start.toISOString()), endDate: endDateStr });
            return;
        }

        const start = new Date();
        start.setDate(now.getDate() - (days - 1));
        onParamsChange({ startDate: toDateInputValue(start.toISOString()), endDate: endDateStr });
    };

    const advancedFilterCount =
        (params.listingId ? 1 : 0) +
        (params.staffUserId ? 1 : 0) +
        (params.typeId ? 1 : 0) +
        (params.purpose ? 1 : 0) +
        (params.status ? 1 : 0) +
        (params.municipalityId ? 1 : 0) +
        (params.areaName ? 1 : 0);

    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <div className={styles.groupLabel}>
                    <IconCalendar size={13} />
                    <span>{t("dateRange")}</span>
                </div>

                <div className={styles.dateRangeGroup}>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={params.startDate || ""}
                        max={params.endDate || undefined}
                        onChange={(e) => onParamsChange({ startDate: e.target.value || undefined })}
                        aria-label={t("startDate")}
                    />
                    <span className={styles.dateSeparator}>&rarr;</span>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={params.endDate || ""}
                        min={params.startDate || undefined}
                        onChange={(e) => onParamsChange({ endDate: e.target.value || undefined })}
                        aria-label={t("endDate")}
                    />
                </div>

                <div className={styles.presetsGroup}>
                    <button type="button" className={styles.presetBtn} onClick={() => applyPreset(7)}>
                        {t("last7Days")}
                    </button>
                    <button type="button" className={styles.presetBtn} onClick={() => applyPreset(30)}>
                        {t("last30Days")}
                    </button>
                    <button type="button" className={styles.presetBtn} onClick={() => applyPreset(90)}>
                        {t("last90Days")}
                    </button>
                    <button type="button" className={styles.presetBtn} onClick={() => applyPreset("thisMonth")}>
                        {t("thisMonth")}
                    </button>
                    <button type="button" className={styles.presetBtn} onClick={() => applyPreset("thisYear")}>
                        {t("thisYear")}
                    </button>
                </div>

                <div className={styles.granularityGroup}>
                    <IconLayers size={13} />
                    <select
                        className={styles.selectInputCompact}
                        value={params.granularity || "daily"}
                        onChange={(e) =>
                            onParamsChange({ granularity: e.target.value as DashboardGranularity })
                        }
                        aria-label={t("granularity")}
                    >
                        <option value="daily">{t("granularityDaily")}</option>
                        <option value="weekly">{t("granularityWeekly")}</option>
                        <option value="monthly">{t("granularityMonthly")}</option>
                        <option value="yearly">{t("granularityYearly")}</option>
                    </select>
                </div>

                <button
                    type="button"
                    className={`${styles.moreFiltersBtn} ${expanded ? styles.moreFiltersActive : ""}`}
                    onClick={() => setExpanded((v) => !v)}
                >
                    <IconFilter size={14} />
                    <span>{expanded ? t("hideFilters") : t("moreFilters")}</span>
                    {advancedFilterCount > 0 && (
                        <span className={styles.badgeCount}>{advancedFilterCount}</span>
                    )}
                    {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </button>

                {(advancedFilterCount > 0 || params.startDate || params.endDate) && (
                    <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={onReset}
                        disabled={loading}
                        title={t("reset")}
                    >
                        <IconRefresh size={14} className={loading ? styles.spinning : ""} />
                        <span className={styles.resetLabel}>{t("reset")}</span>
                    </button>
                )}
            </div>

            <div className={`${styles.advancedRow} ${expanded ? styles.advancedRowOpen : ""}`}>
                <div className={styles.advancedInner}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <IconHome size={13} />
                            <span>{t("listing")}</span>
                        </label>
                        <select
                            className={styles.selectInput}
                            value={params.listingId || ""}
                            onChange={(e) => onParamsChange({ listingId: e.target.value || undefined })}
                        >
                            <option value="">{t("allListings")}</option>
                            {listingOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <IconUser size={13} />
                            <span>{t("staff")}</span>
                        </label>
                        <select
                            className={styles.selectInput}
                            value={params.staffUserId || ""}
                            onChange={(e) => onParamsChange({ staffUserId: e.target.value || undefined })}
                        >
                            <option value="">{t("allStaff")}</option>
                            {staffOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <IconTag size={13} />
                            <span>{t("propertyType")}</span>
                        </label>
                        <select
                            className={styles.selectInput}
                            value={params.typeId || ""}
                            onChange={(e) => onParamsChange({ typeId: e.target.value || undefined })}
                        >
                            <option value="">{t("allPropertyTypes")}</option>
                            {typeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <IconCheckCircle size={13} />
                            <span>{t("purpose")}</span>
                        </label>
                        <select
                            className={styles.selectInput}
                            value={params.purpose || ""}
                            onChange={(e) =>
                                onParamsChange({
                                    purpose: (e.target.value as DashboardFilterParams["purpose"]) || undefined,
                                })
                            }
                        >
                            <option value="">{t("allPurposes")}</option>
                            {purposeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

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
                                    status: (e.target.value as DashboardFilterParams["status"]) || undefined,
                                })
                            }
                        >
                            <option value="">{t("allStatuses")}</option>
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <IconMapPin size={13} />
                            <span>{t("municipality")}</span>
                        </label>
                        <select
                            className={styles.selectInput}
                            value={params.municipalityId || ""}
                            onChange={(e) =>
                                onParamsChange({ municipalityId: e.target.value || undefined })
                            }
                        >
                            <option value="">{t("allMunicipalities")}</option>
                            {municipalityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <IconMapPin size={13} />
                            <span>{t("areaName")}</span>
                        </label>
                        <input
                            type="text"
                            className={styles.textInput}
                            placeholder={t("areaNamePlaceholder")}
                            value={params.areaName || ""}
                            onChange={(e) => onParamsChange({ areaName: e.target.value || undefined })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
