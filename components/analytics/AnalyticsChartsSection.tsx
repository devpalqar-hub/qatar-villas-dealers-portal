"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import {
    DealerAnalyticsOverview,
    AnalyticsListingItem,
    AnalyticsSortBy,
} from "@/types/analytics";
import styles from "./AnalyticsChartsSection.module.css";

const IconPieChart = FI.FiPieChart;
const IconBarChart2 = FI.FiBarChart2;
const IconAward = FI.FiAward;
const IconTag = FI.FiTag;

interface AnalyticsChartsSectionProps {
    overview: DealerAnalyticsOverview;
    listings: AnalyticsListingItem[];
}

export default function AnalyticsChartsSection({
    overview,
    listings,
}: AnalyticsChartsSectionProps) {
    const t = useTranslations("analyticsPage.charts");

    const [metricTab, setMetricTab] = useState<AnalyticsSortBy>("viewsCount");
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

    // Prepare Donut Chart Data from overview/listings
    const statusCounts = {
        ACTIVE: overview?.activeListings || listings.filter((l) => l.status === "ACTIVE").length,
        PENDING: overview?.pendingListings || listings.filter((l) => l.status === "PENDING").length,
        SOLD: overview?.soldListings || listings.filter((l) => l.status === "SOLD").length,
        REJECTED: overview?.rejectedListings || listings.filter((l) => l.status === "REJECTED").length,
        INACTIVE: listings.filter((l) => l.status === "INACTIVE").length,
    };

    const totalStatusCount =
        statusCounts.ACTIVE +
        statusCounts.PENDING +
        statusCounts.SOLD +
        statusCounts.REJECTED +
        statusCounts.INACTIVE || overview?.totalListings || 1;

    const donutSlices = [
        { key: "ACTIVE", label: "Active", count: statusCounts.ACTIVE, color: "#10b981" },
        { key: "PENDING", label: "Pending", count: statusCounts.PENDING, color: "#f59e0b" },
        { key: "SOLD", label: "Sold", count: statusCounts.SOLD, color: "#6366f1" },
        { key: "REJECTED", label: "Rejected", count: statusCounts.REJECTED, color: "#ef4444" },
        { key: "INACTIVE", label: "Inactive", count: statusCounts.INACTIVE, color: "#64748b" },
    ].filter((s) => s.count > 0);

    // SVG Donut calculation
    let accumulatedAngle = 0;
    const donutArcs = donutSlices.map((slice) => {
        const percentage = slice.count / totalStatusCount;
        const angle = percentage * 360;
        const strokeDasharray = `${percentage * 251.2} ${251.2 * (1 - percentage)}`;
        const strokeDashoffset = -accumulatedAngle * (251.2 / 360);
        accumulatedAngle += angle;

        return {
            ...slice,
            percentage: (percentage * 100).toFixed(1),
            strokeDasharray,
            strokeDashoffset,
        };
    });

    // Purpose split calculation (Sale vs Rent)
    const saleCount = listings.filter((l) => l.purpose === "SALE").length;
    const rentCount = listings.filter((l) => l.purpose === "RENT").length;
    const totalPurpose = saleCount + rentCount || 1;
    const salePercent = Math.round((saleCount / totalPurpose) * 100);
    const rentPercent = Math.round((rentCount / totalPurpose) * 100);

    // Top listings sorted by active metricTab
    const sortedTopListings = [...listings]
        .sort((a, b) => {
            if (metricTab === "price") return b.price - a.price;
            if (metricTab === "impressionsCount") return b.impressionsCount - a.impressionsCount;
            if (metricTab === "reachCount") return b.reachCount - a.reachCount;
            if (metricTab === "createdAt")
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return b.viewsCount - a.viewsCount;
        })
        .slice(0, 5);

    const maxMetricValue = Math.max(
        1,
        ...sortedTopListings.map((l) => {
            if (metricTab === "price") return l.price;
            if (metricTab === "impressionsCount") return l.impressionsCount;
            if (metricTab === "reachCount") return l.reachCount;
            return l.viewsCount;
        })
    );

    return (
        <div className={styles.chartsGrid}>
            {/* Left Box: Status Donut Chart & Purpose Split */}
            <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTitleGroup}>
                        <div className={styles.iconBadgeIndigo}>
                            <IconPieChart size={18} />
                        </div>
                        <div>
                            <h3 className={styles.cardTitle}>{t("statusTitle")}</h3>
                            <p className={styles.cardSubtitle}>
                                Distribution by listing status & purpose
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.donutContainer}>
                    {/* SVG Donut Visual */}
                    <div className={styles.donutSvgWrapper}>
                        <svg viewBox="0 0 100 100" className={styles.donutSvg}>
                            {donutArcs.length === 0 ? (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#e2e8f0"
                                    strokeWidth="16"
                                />
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
                                        strokeDasharray={arc.strokeDasharray}
                                        strokeDashoffset={arc.strokeDashoffset}
                                        className={styles.donutSegment}
                                        onMouseEnter={() => setHoveredSlice(arc.key)}
                                        onMouseLeave={() => setHoveredSlice(null)}
                                        style={{
                                            opacity:
                                                hoveredSlice && hoveredSlice !== arc.key
                                                    ? 0.45
                                                    : 1,
                                        }}
                                    />
                                ))
                            )}
                        </svg>
                        <div className={styles.donutCenter}>
                            <span className={styles.donutCenterValue}>
                                {hoveredSlice
                                    ? statusCounts[hoveredSlice as keyof typeof statusCounts]
                                    : overview?.totalListings || listings.length}
                            </span>
                            <span className={styles.donutCenterLabel}>
                                {hoveredSlice
                                    ? donutSlices.find((s) => s.key === hoveredSlice)?.label
                                    : "Listings"}
                            </span>
                        </div>
                    </div>

                    {/* Donut Legend */}
                    <div className={styles.donutLegend}>
                        {donutArcs.map((slice) => (
                            <div
                                key={slice.key}
                                className={styles.legendItem}
                                onMouseEnter={() => setHoveredSlice(slice.key)}
                                onMouseLeave={() => setHoveredSlice(null)}
                            >
                                <span
                                    className={styles.legendDot}
                                    style={{ backgroundColor: slice.color }}
                                />
                                <span className={styles.legendLabel}>{slice.label}</span>
                                <span className={styles.legendCount}>{slice.count}</span>
                                <span className={styles.legendPercent}>({slice.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Purpose Split Section */}
                <div className={styles.purposeSection}>
                    <div className={styles.purposeHeader}>
                        <IconTag size={15} />
                        <span>{t("purposeTitle")}</span>
                    </div>
                    <div className={styles.purposeBarWrapper}>
                        <div className={styles.purposeTrack}>
                            <div
                                className={styles.purposeFillSale}
                                style={{ width: `${salePercent}%` }}
                            />
                            <div
                                className={styles.purposeFillRent}
                                style={{ width: `${rentPercent}%` }}
                            />
                        </div>
                        <div className={styles.purposeLabels}>
                            <span className={styles.saleLabel}>For Sale ({saleCount})</span>
                            <span className={styles.rentLabel}>For Rent ({rentCount})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Box: Top Performing Listings Bar Chart */}
            <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerTitleGroup}>
                        <div className={styles.iconBadgeEmerald}>
                            <IconBarChart2 size={18} />
                        </div>
                        <div>
                            <h3 className={styles.cardTitle}>{t("topListingsTitle")}</h3>
                            <p className={styles.cardSubtitle}>
                                Top properties ranked by performance metrics
                            </p>
                        </div>
                    </div>

                    {/* Metric Switcher Tabs */}
                    <div className={styles.tabsGroup}>
                        {(
                            [
                                { key: "viewsCount", label: t("viewsCount") },
                                { key: "impressionsCount", label: t("impressionsCount") },
                                { key: "reachCount", label: t("reachCount") },
                                { key: "price", label: t("price") },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`${styles.tabBtn} ${
                                    metricTab === tab.key ? styles.tabActive : ""
                                }`}
                                onClick={() => setMetricTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Horizontal Bar Graphs */}
                <div className={styles.barChartContainer}>
                    {sortedTopListings.length === 0 ? (
                        <div className={styles.emptyState}>No listing data available</div>
                    ) : (
                        sortedTopListings.map((item, index) => {
                            const val =
                                metricTab === "price"
                                    ? item.price
                                    : metricTab === "impressionsCount"
                                    ? item.impressionsCount
                                    : metricTab === "reachCount"
                                    ? item.reachCount
                                    : item.viewsCount;

                            const barPercent = Math.min(
                                100,
                                Math.max(8, Math.round((val / maxMetricValue) * 100))
                            );

                            return (
                                <div key={item.id} className={styles.barItem}>
                                    <div className={styles.barHeader}>
                                        <div className={styles.rankBadge}>#{index + 1}</div>
                                        <span className={styles.propertyName}>
                                            {item.propertyName}
                                        </span>
                                        <span
                                            className={`${styles.statusPill} ${
                                                item.status === "ACTIVE"
                                                    ? styles.statusActive
                                                    : item.status === "SOLD"
                                                    ? styles.statusSold
                                                    : styles.statusPending
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className={styles.barTrackRow}>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{ width: `${barPercent}%` }}
                                            />
                                        </div>
                                        <span className={styles.barValue}>
                                            {metricTab === "price"
                                                ? `${val.toLocaleString()} QAR`
                                                : val.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
