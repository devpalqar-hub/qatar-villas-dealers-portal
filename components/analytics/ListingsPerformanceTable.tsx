"use client";

import React from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import {
    AnalyticsListingItem,
    DealerAnalyticsMeta,
    DealerAnalyticsParams,
} from "@/types/analytics";
import styles from "./ListingsPerformanceTable.module.css";

const IconEye = FI.FiEye;
const IconUsers = FI.FiUsers;
const IconActivity = FI.FiActivity;
const IconStar = FI.FiStar;
const IconChevronLeft = FI.FiChevronLeft;
const IconChevronRight = FI.FiChevronRight;

interface ListingsPerformanceTableProps {
    listings: AnalyticsListingItem[];
    meta: DealerAnalyticsMeta;
    params: DealerAnalyticsParams;
    onPageChange: (newPage: number) => void;
    loading?: boolean;
}

export default function ListingsPerformanceTable({
    listings,
    meta,
    params,
    onPageChange,
    loading = false,
}: ListingsPerformanceTableProps) {
    const t = useTranslations("analyticsPage.table");

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-QA", {
            style: "currency",
            currency: "QAR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>{t("title")}</h3>
                    <p className={styles.subtitle}>
                        Detailed metrics breakdown for each listed property
                    </p>
                </div>
                <div className={styles.metaCount}>
                    Showing {listings.length} of {meta?.total || listings.length} properties
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{t("property")}</th>
                            <th>{t("status")}</th>
                            <th>{t("purpose")}</th>
                            <th>{t("metrics")}</th>
                            <th>{t("price")}</th>
                            <th>{t("agent")}</th>
                            <th>{t("created")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    <td colSpan={7}>
                                        <div className={styles.skeletonRow} />
                                    </td>
                                </tr>
                            ))
                        ) : listings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.emptyCell}>
                                    No properties match the current analytics filter.
                                </td>
                            </tr>
                        ) : (
                            listings.map((item) => (
                                <tr key={item.id} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.propertyCell}>
                                            <div className={styles.propertyInfo}>
                                                <div className={styles.titleRow}>
                                                    <span className={styles.propertyName}>
                                                        {item.propertyName}
                                                    </span>
                                                    {item.isFeatured && (
                                                        <span
                                                            className={styles.featuredBadge}
                                                            title="Featured Listing"
                                                        >
                                                            <IconStar size={11} />
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={styles.propertyType}>
                                                    {item.type?.title || "Property"} • {item.slug}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`${styles.statusBadge} ${
                                                styles[`status_${item.status}`] || ""
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`${styles.purposeBadge} ${
                                                item.purpose === "SALE"
                                                    ? styles.purposeSale
                                                    : styles.purposeRent
                                            }`}
                                        >
                                            {item.purpose === "SALE" ? "For Sale" : "For Rent"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className={styles.metricsGroup}>
                                            <span
                                                className={styles.metricPill}
                                                title="Total Views"
                                            >
                                                <IconEye size={12} className={styles.iconSky} />
                                                <span>{item.viewsCount}</span>
                                            </span>
                                            <span
                                                className={styles.metricPill}
                                                title="Total Impressions"
                                            >
                                                <IconActivity
                                                    size={12}
                                                    className={styles.iconIndigo}
                                                />
                                                <span>{item.impressionsCount}</span>
                                            </span>
                                            <span
                                                className={styles.metricPill}
                                                title="Total Reach"
                                            >
                                                <IconUsers
                                                    size={12}
                                                    className={styles.iconEmerald}
                                                />
                                                <span>{item.reachCount}</span>
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <span className={styles.priceValue}>
                                            {formatCurrency(item.price)}
                                        </span>
                                    </td>

                                    <td>
                                        <div className={styles.agentCell}>
                                            <span className={styles.agentName}>
                                                {item.createdBy?.name || "Dealer Admin"}
                                            </span>
                                            <span className={styles.agentRole}>
                                                {item.createdBy?.role || "DEALER"}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <span className={styles.dateCell}>
                                            {formatDate(item.createdAt)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={meta.page <= 1 || loading}
                        onClick={() => onPageChange(meta.page - 1)}
                    >
                        <IconChevronLeft size={16} />
                        <span>Previous</span>
                    </button>

                    <div className={styles.pageInfo}>
                        Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong>
                    </div>

                    <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={meta.page >= meta.totalPages || loading}
                        onClick={() => onPageChange(meta.page + 1)}
                    >
                        <span>Next</span>
                        <IconChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
