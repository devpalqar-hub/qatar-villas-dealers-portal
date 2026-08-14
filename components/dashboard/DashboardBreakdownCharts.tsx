"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DashboardListingsOverview, DashboardVisitsOverview } from "@/types/dashboard";
import styles from "./DashboardBreakdownCharts.module.css";

const IconPieChart = FI.FiPieChart;
const IconBarChart2 = FI.FiBarChart2;

interface DashboardBreakdownChartsProps {
    listings: DashboardListingsOverview | null | undefined;
    visits: DashboardVisitsOverview | null | undefined;
    loading?: boolean;
}

const CIRCUMFERENCE = 2 * Math.PI * 40;

export default function DashboardBreakdownCharts({
    listings,
    visits,
    loading = false,
}: DashboardBreakdownChartsProps) {
    const t = useTranslations("dashboard.charts");
    const tKpi = useTranslations("dashboard.kpi");
    const tVisitStatus = useTranslations("dashboard.visitStatus");
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

    if (loading || !listings || !visits) {
        return (
            <div className={styles.grid}>
                <div className={styles.skeletonCard} />
                <div className={styles.skeletonCard} />
            </div>
        );
    }

    const statusSlices = [
        { key: "open", label: tKpi("open"), count: listings.open, color: "#16a34a" },
        { key: "pending", label: tKpi("pending"), count: listings.pending, color: "#d97706" },
        { key: "sold", label: tKpi("sold"), count: listings.sold, color: "#4f46e5" },
        { key: "rejected", label: tKpi("rejected"), count: listings.rejected, color: "#dc2626" },
        { key: "inactive", label: tKpi("inactive"), count: listings.inactive, color: "#64748b" },
    ].filter((s) => s.count > 0);

    const totalListings = statusSlices.reduce((sum, s) => sum + s.count, 0) || listings.total || 1;

    let accumulated = 0;
    const donutArcs = statusSlices.map((slice) => {
        const fraction = slice.count / totalListings;
        const dasharray = `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE * (1 - fraction)}`;
        const dashoffset = -accumulated * CIRCUMFERENCE;
        accumulated += fraction;
        return { ...slice, percentage: (fraction * 100).toFixed(1), dasharray, dashoffset };
    });

    const visitStatuses: { key: keyof DashboardVisitsOverview["byStatus"]; color: string }[] = [
        { key: "PENDING", color: "#d97706" },
        { key: "ACCEPTED", color: "#16a34a" },
        { key: "RESCHEDULED", color: "#4f46e5" },
        { key: "REJECTED", color: "#dc2626" },
        { key: "CANCELLED", color: "#64748b" },
    ];

    const maxVisitCount = Math.max(1, ...visitStatuses.map((v) => visits.byStatus[v.key] || 0));

    return (
        <div className={styles.grid}>
            {/* Status Donut */}
            <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTitleGroup}>
                        <div className={styles.iconBadgeIndigo}>
                            <IconPieChart size={18} />
                        </div>
                        <div>
                            <h3 className={styles.cardTitle}>{t("statusTitle")}</h3>
                            <p className={styles.cardSubtitle}>{t("statusSubtitle")}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.donutContainer}>
                    <div className={styles.donutSvgWrapper}>
                        <svg viewBox="0 0 100 100" className={styles.donutSvg}>
                            {donutArcs.length === 0 ? (
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="16" />
                            ) : (
                                donutArcs.map((arc) => (
                                    <circle
                                        key={arc.key}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke={arc.color}
                                        strokeWidth="16"
                                        strokeDasharray={arc.dasharray}
                                        strokeDashoffset={arc.dashoffset}
                                        className={styles.donutSegment}
                                        onMouseEnter={() => setHoveredSlice(arc.key)}
                                        onMouseLeave={() => setHoveredSlice(null)}
                                        style={{
                                            opacity: hoveredSlice && hoveredSlice !== arc.key ? 0.4 : 1,
                                        }}
                                    />
                                ))
                            )}
                        </svg>
                        <div className={styles.donutCenter}>
                            <span className={styles.donutCenterValue}>
                                {hoveredSlice
                                    ? statusSlices.find((s) => s.key === hoveredSlice)?.count
                                    : listings.total}
                            </span>
                            <span className={styles.donutCenterLabel}>
                                {hoveredSlice
                                    ? statusSlices.find((s) => s.key === hoveredSlice)?.label
                                    : tKpi("totalListings")}
                            </span>
                        </div>
                    </div>

                    <div className={styles.donutLegend}>
                        {donutArcs.map((slice) => (
                            <div
                                key={slice.key}
                                className={styles.legendItem}
                                onMouseEnter={() => setHoveredSlice(slice.key)}
                                onMouseLeave={() => setHoveredSlice(null)}
                            >
                                <span className={styles.legendDot} style={{ backgroundColor: slice.color }} />
                                <span className={styles.legendLabel}>{slice.label}</span>
                                <span className={styles.legendCount}>{slice.count}</span>
                                <span className={styles.legendPercent}>({slice.percentage}%)</span>
                            </div>
                        ))}
                        {donutArcs.length === 0 && (
                            <div className={styles.emptyLegend}>{t("noData")}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Visits by Status Bar */}
            <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTitleGroup}>
                        <div className={styles.iconBadgeTeal}>
                            <IconBarChart2 size={18} />
                        </div>
                        <div>
                            <h3 className={styles.cardTitle}>{t("visitsTitle")}</h3>
                            <p className={styles.cardSubtitle}>{t("visitsSubtitle")}</p>
                        </div>
                    </div>
                    <div className={styles.totalPill}>
                        {t("totalLabel")}: {visits.total}
                    </div>
                </div>

                <div className={styles.barChartContainer}>
                    {visitStatuses.map((status) => {
                        const value = visits.byStatus[status.key] || 0;
                        const percent = Math.min(100, Math.max(value > 0 ? 6 : 0, Math.round((value / maxVisitCount) * 100)));
                        return (
                            <div key={status.key} className={styles.barItem}>
                                <div className={styles.barHeader}>
                                    <span className={styles.barLabel}>{tVisitStatus(status.key)}</span>
                                    <span className={styles.barValue}>{value}</span>
                                </div>
                                <div className={styles.barTrack}>
                                    <div
                                        className={styles.barFill}
                                        style={{ width: `${percent}%`, backgroundColor: status.color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
