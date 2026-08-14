"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { dashboardService } from "@/services/dashboard.service";
import { propertyService } from "@/services/property.service";
import { staffService } from "@/services/staff.service";
import { DashboardFilterParams, DashboardResponse } from "@/types/dashboard";
import DashboardFilters, { DashboardFilterOption } from "./DashboardFilters";
import DashboardOverviewCards from "./DashboardOverviewCards";
import DashboardTrendChart from "./DashboardTrendChart";
import DashboardBreakdownCharts from "./DashboardBreakdownCharts";
import DashboardTopListings from "./DashboardTopListings";
import DashboardSidePanels from "./DashboardSidePanels";
import styles from "./DashboardView.module.css";

const IconAlertCircle = FI.FiAlertCircle;
const IconRefresh = FI.FiRefreshCw;

const STATUS_KEYS = ["PENDING", "ACTIVE", "INACTIVE", "RESUBMITED", "REJECTED", "SOLD", "PENDING_PAYMENT"] as const;
const PURPOSE_KEYS = ["SALE", "RENT"] as const;

function defaultDateRange(): { startDate: string; endDate: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
    };
}

export default function DashboardView() {
    const t = useTranslations("dashboard");
    const tStatus = useTranslations("statusEnum");
    const tPurpose = useTranslations("purposeEnum");

    const [params, setParams] = useState<DashboardFilterParams>(() => ({
        ...defaultDateRange(),
        granularity: "daily",
    }));
    const [areaInput, setAreaInput] = useState("");

    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [listingOptions, setListingOptions] = useState<DashboardFilterOption[]>([]);
    const [staffOptions, setStaffOptions] = useState<DashboardFilterOption[]>([]);
    const [typeOptions, setTypeOptions] = useState<DashboardFilterOption[]>([]);
    const [municipalityOptions, setMunicipalityOptions] = useState<DashboardFilterOption[]>([]);

    // Load filter reference data once.
    useEffect(() => {
        (async () => {
            try {
                const [propertiesRes, optionsRes, staffRes] = await Promise.all([
                    propertyService.getProperties({ limit: 100 }),
                    propertyService.getPropertyOptions(),
                    staffService.getStaff(1, 100),
                ]);

                setListingOptions(
                    (propertiesRes.data || []).map((p) => ({ value: p.id, label: p.propertyName }))
                );
                setTypeOptions((optionsRes.listingTypes || []).map((tp) => ({ value: tp.id, label: tp.title })));
                setMunicipalityOptions(
                    (optionsRes.municipalities || []).map((m) => ({ value: m.id, label: m.name }))
                );
                setStaffOptions(
                    (staffRes.data || []).map((s) => ({ value: s.staffUserId, label: s.staffUser?.name || s.position }))
                );
            } catch {
                // Filter option lists are a progressive enhancement; ignore failures silently.
            }
        })();
    }, []);

    const fetchDashboard = useCallback(async (activeParams: DashboardFilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const res = await dashboardService.getDashboard(activeParams);
            setData(res);
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string } } };
            setError(serviceError?.response?.data?.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce area name text input before it lands in `params`.
    useEffect(() => {
        const handle = setTimeout(() => {
            setParams((prev) => (prev.areaName === (areaInput || undefined) ? prev : { ...prev, areaName: areaInput || undefined }));
        }, 450);
        return () => clearTimeout(handle);
    }, [areaInput]);

    useEffect(() => {
        void fetchDashboard(params);
    }, [params, fetchDashboard]);

    const handleParamsChange = (next: Partial<DashboardFilterParams>) => {
        if (typeof next.areaName !== "undefined" || "areaName" in next) {
            setAreaInput(next.areaName || "");
            return;
        }
        setParams((prev) => ({ ...prev, ...next }));
    };

    const handleReset = () => {
        setAreaInput("");
        setParams({ ...defaultDateRange(), granularity: "daily" });
    };

    const statusOptions = useMemo<DashboardFilterOption[]>(
        () => STATUS_KEYS.map((key) => ({ value: key, label: tStatus(key) })),
        [tStatus]
    );
    const purposeOptions = useMemo<DashboardFilterOption[]>(
        () => PURPOSE_KEYS.map((key) => ({ value: key, label: tPurpose(key) })),
        [tPurpose]
    );

    return (
        <div className={styles.wrapper}>
            <DashboardFilters
                params={{ ...params, areaName: areaInput }}
                onParamsChange={handleParamsChange}
                onReset={handleReset}
                loading={loading}
                listingOptions={listingOptions}
                staffOptions={staffOptions}
                typeOptions={typeOptions}
                municipalityOptions={municipalityOptions}
                statusOptions={statusOptions}
                purposeOptions={purposeOptions}
            />

            {error && (
                <div className={styles.errorBanner}>
                    <IconAlertCircle size={18} />
                    <div className={styles.errorText}>
                        <strong>{t("errorTitle")}</strong>
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        className={styles.retryBtn}
                        onClick={() => void fetchDashboard(params)}
                    >
                        <IconRefresh size={14} />
                        {t("retry")}
                    </button>
                </div>
            )}

            <DashboardOverviewCards overview={data?.overview} loading={loading && !data} />

            <div className={styles.mainGrid}>
                <div className={styles.mainColumn}>
                    <DashboardTrendChart graph={data?.graph} loading={loading && !data} />
                    <DashboardBreakdownCharts
                        listings={data?.overview.listings}
                        visits={data?.overview.visits}
                        loading={loading && !data}
                    />
                    <DashboardTopListings listings={data?.topListings || []} loading={loading && !data} />
                </div>

                <div className={styles.sideColumn}>
                    <DashboardSidePanels
                        subscription={data?.overview.subscription}
                        quota={data?.overview.quota}
                        staff={data?.overview.staff}
                        loading={loading && !data}
                    />
                </div>
            </div>
        </div>
    );
}
