"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
    FiBarChart2,
    FiEye,
    FiUsers,
    FiTrendingUp,
    FiTrendingDown,
    FiMessageCircle,
    FiUserCheck,
    FiCalendar,
    FiAlertTriangle,
    FiRefreshCw,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui";
import { propertyService } from "@/services/property.service";
import { PropertyAnalyticsGranularity, PropertyAnalyticsResponse } from "@/types/propertyAnalytics";
import PropertyAnalyticsTrendChart from "./PropertyAnalyticsTrendChart";
import styles from "./PropertyAnalyticsSection.module.css";

interface PropertyAnalyticsSectionProps {
    listingId: string;
}

function defaultDateRange(): { startDate: string; endDate: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
    };
}

export default function PropertyAnalyticsSection({ listingId }: PropertyAnalyticsSectionProps) {
    const t = useTranslations("propertyAnalytics");

    const [granularity, setGranularity] = useState<PropertyAnalyticsGranularity>("daily");
    const [{ startDate, endDate }, setDateRange] = useState(defaultDateRange);
    const [data, setData] = useState<PropertyAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await propertyService.getListingAnalytics(listingId, {
                startDate,
                endDate,
                granularity,
            });
            setData(res);
        } catch {
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
    }, [listingId, startDate, endDate, granularity, t]);

    useEffect(() => {
        void fetchAnalytics();
    }, [fetchAnalytics]);

    const growthPercent = data?.period.viewsGrowthPercent ?? 0;
    const GrowthIcon = growthPercent > 0 ? FiTrendingUp : growthPercent < 0 ? FiTrendingDown : FiTrendingUp;

    const kpiTiles = data
        ? [
              { key: "views", icon: <FiEye size={16} />, label: t("kpi.views"), period: data.period.views, total: data.totals.views },
              { key: "reach", icon: <FiUsers size={16} />, label: t("kpi.reach"), period: data.period.reach, total: data.totals.reach },
              { key: "impressions", icon: <FiBarChart2 size={16} />, label: t("kpi.impressions"), period: null, total: data.totals.impressions },
              { key: "whatsapp", icon: <FaWhatsapp size={15} />, label: t("kpi.whatsappClicks"), period: data.period.whatsappClicks, total: data.totals.whatsappClicks },
              { key: "messages", icon: <FiMessageCircle size={16} />, label: t("kpi.messagesStarted"), period: data.period.messagesStarted, total: data.totals.messagesStarted },
              { key: "engaged", icon: <FiUserCheck size={16} />, label: t("kpi.usersEngaged"), period: data.period.usersEngaged, total: data.totals.usersEngaged },
              { key: "visits", icon: <FiCalendar size={16} />, label: t("kpi.visitRequests"), period: data.period.propertyVisitRequests, total: data.totals.propertyVisitRequests },
          ]
        : [];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <FiBarChart2 size={18} /> {t("title")}
                </h2>

                <div className={styles.filtersRow}>
                    <select
                        className={styles.select}
                        value={granularity}
                        onChange={(e) => setGranularity(e.target.value as PropertyAnalyticsGranularity)}
                        aria-label={t("filters.granularity")}
                    >
                        <option value="daily">{t("filters.daily")}</option>
                        <option value="weekly">{t("filters.weekly")}</option>
                        <option value="monthly">{t("filters.monthly")}</option>
                        <option value="yearly">{t("filters.yearly")}</option>
                    </select>

                    <div className={styles.dateRangeGroup}>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={startDate}
                            max={endDate}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                            aria-label={t("filters.startDate")}
                        />
                        <span className={styles.dateSeparator}>&rarr;</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                            aria-label={t("filters.endDate")}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={styles.skeleton} />
            ) : error ? (
                <div className={styles.errorState}>
                    <FiAlertTriangle size={24} />
                    <p>{error}</p>
                    <Button variant="secondary" onClick={fetchAnalytics}>
                        <FiRefreshCw size={14} /> {t("retry")}
                    </Button>
                </div>
            ) : data ? (
                <>
                    <div className={styles.kpiGrid}>
                        {kpiTiles.map((tile) => (
                            <div key={tile.key} className={styles.kpiTile}>
                                <div className={styles.kpiIcon}>{tile.icon}</div>
                                <div className={styles.kpiInfo}>
                                    <span className={styles.kpiValue}>
                                        {tile.period !== null ? tile.period.toLocaleString() : tile.total.toLocaleString()}
                                    </span>
                                    <span className={styles.kpiLabel}>{tile.label}</span>
                                    {tile.period !== null && (
                                        <span className={styles.kpiSubtext}>
                                            {t("kpi.allTimeValue", { count: tile.total.toLocaleString() })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.chartSection}>
                        <div className={styles.chartHeader}>
                            <div>
                                <h3 className={styles.chartTitle}>{t("chart.title")}</h3>
                                <p className={styles.chartSubtitle}>{t("chart.subtitle")}</p>
                            </div>
                            {data.period.previousPeriodViews > 0 && (
                                <div
                                    className={`${styles.growthBadge} ${
                                        growthPercent > 0 ? styles.growthUp : growthPercent < 0 ? styles.growthDown : styles.growthFlat
                                    }`}
                                >
                                    <GrowthIcon size={13} />
                                    {t("kpi.growthVsPrevious", { percent: Math.abs(Math.round(growthPercent)) })}
                                </div>
                            )}
                        </div>

                        <PropertyAnalyticsTrendChart trend={data.trend} granularity={data.granularity} />
                    </div>
                </>
            ) : null}
        </div>
    );
}
