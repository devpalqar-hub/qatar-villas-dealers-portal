"use client";

import React, { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DashboardGraph, DashboardGranularity } from "@/types/dashboard";
import styles from "./DashboardTrendChart.module.css";

const IconTrendingUp = FI.FiTrendingUp;

type SeriesKey = "views" | "visits" | "chats" | "whatsappChats";

interface DashboardTrendChartProps {
    graph: DashboardGraph | null | undefined;
    loading?: boolean;
}

const PADDING_LEFT = 44;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;
const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 320;

function formatPeriodLabel(period: string, granularity: DashboardGranularity, locale: string): string {
    if (granularity === "yearly") return period;
    if (granularity === "monthly") {
        const [year, month] = period.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        return date.toLocaleDateString(locale, { month: "short", year: "2-digit" });
    }
    const date = new Date(`${period}T00:00:00`);
    if (Number.isNaN(date.getTime())) return period;
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export default function DashboardTrendChart({ graph, loading = false }: DashboardTrendChartProps) {
    const t = useTranslations("dashboard.charts");
    const locale = useLocale();
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [activeSeries, setActiveSeries] = useState<Record<SeriesKey, boolean>>({
        views: true,
        visits: true,
        chats: true,
        whatsappChats: true,
    });

    const granularity = graph?.granularity || "daily";
    const series = graph?.series || [];

    const SERIES_META: { key: SeriesKey; label: string; color: string }[] = [
        { key: "views", label: t("seriesViews"), color: "#8A1538" },
        { key: "visits", label: t("seriesVisits"), color: "#0d9488" },
        { key: "chats", label: t("seriesChats"), color: "#4f46e5" },
        { key: "whatsappChats", label: t("seriesWhatsapp"), color: "#16a34a" },
    ];

    const maxValue = useMemo(() => {
        let max = 0;
        series.forEach((point) => {
            SERIES_META.forEach(({ key }) => {
                if (activeSeries[key] && point[key] > max) max = point[key];
            });
        });
        return max || 1;
    }, [series, activeSeries]);

    const innerWidth = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const innerHeight = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const stepX = series.length > 1 ? innerWidth / (series.length - 1) : 0;

    const xAt = (index: number) => PADDING_LEFT + index * stepX;
    const yAt = (value: number) => PADDING_TOP + innerHeight - (value / maxValue) * innerHeight;

    const buildLinePath = (key: SeriesKey) => {
        if (series.length === 0) return "";
        return series.map((point, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(point[key]).toFixed(2)}`).join(" ");
    };

    const buildAreaPath = (key: SeriesKey) => {
        if (series.length === 0) return "";
        const line = series.map((point, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(point[key]).toFixed(2)}`).join(" ");
        const lastX = xAt(series.length - 1);
        const baseline = PADDING_TOP + innerHeight;
        return `${line} L${lastX.toFixed(2)},${baseline} L${xAt(0).toFixed(2)},${baseline} Z`;
    };

    const pathLength = (key: SeriesKey) => {
        let total = 0;
        for (let i = 1; i < series.length; i++) {
            const dx = xAt(i) - xAt(i - 1);
            const dy = yAt(series[i][key]) - yAt(series[i - 1][key]);
            total += Math.sqrt(dx * dx + dy * dy);
        }
        return total || 1;
    };

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    const labelStep = Math.max(1, Math.ceil(series.length / 8));

    const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || series.length === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const viewX = ratio * VIEW_WIDTH;
        const index = Math.round((viewX - PADDING_LEFT) / (stepX || 1));
        setHoverIndex(Math.min(series.length - 1, Math.max(0, index)));
    };

    const toggleSeries = (key: SeriesKey) => {
        setActiveSeries((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            if (!Object.values(next).some(Boolean)) return prev;
            return next;
        });
    };

    const hoverPoint = hoverIndex !== null ? series[hoverIndex] : null;
    const isEmpty = series.every((p) => p.views === 0 && p.visits === 0 && p.chats === 0 && p.whatsappChats === 0);

    if (loading) {
        return <div className={styles.skeleton} />;
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.headerTitleGroup}>
                    <div className={styles.iconBadge}>
                        <IconTrendingUp size={18} />
                    </div>
                    <div>
                        <h3 className={styles.cardTitle}>{t("trendTitle")}</h3>
                        <p className={styles.cardSubtitle}>{t("trendSubtitle")}</p>
                    </div>
                </div>

                <div className={styles.legend}>
                    {SERIES_META.map((s) => (
                        <button
                            key={s.key}
                            type="button"
                            className={`${styles.legendItem} ${!activeSeries[s.key] ? styles.legendItemOff : ""}`}
                            onClick={() => toggleSeries(s.key)}
                        >
                            <span className={styles.legendDot} style={{ backgroundColor: s.color }} />
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.chartWrapper}>
                {isEmpty && <div className={styles.emptyOverlay}>{t("noData")}</div>}

                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                    className={styles.svg}
                    onMouseMove={handleMove}
                    onMouseLeave={() => setHoverIndex(null)}
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="dashboardAreaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8A1538" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#8A1538" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal gridlines + y-axis labels */}
                    {gridLines.map((g) => {
                        const y = PADDING_TOP + innerHeight * (1 - g);
                        return (
                            <g key={g}>
                                <line
                                    x1={PADDING_LEFT}
                                    x2={VIEW_WIDTH - PADDING_RIGHT}
                                    y1={y}
                                    y2={y}
                                    className={styles.gridLine}
                                />
                                <text x={PADDING_LEFT - 8} y={y + 3} className={styles.axisLabel} textAnchor="end">
                                    {Math.round(maxValue * g)}
                                </text>
                            </g>
                        );
                    })}

                    {/* X axis labels */}
                    {series.map((point, i) =>
                        i % labelStep === 0 || i === series.length - 1 ? (
                            <text
                                key={point.period}
                                x={xAt(i)}
                                y={VIEW_HEIGHT - 10}
                                className={styles.axisLabel}
                                textAnchor="middle"
                            >
                                {formatPeriodLabel(point.period, granularity, locale)}
                            </text>
                        ) : null
                    )}

                    {/* Area fill for views (primary series) */}
                    {activeSeries.views && series.length > 0 && (
                        <path d={buildAreaPath("views")} fill="url(#dashboardAreaFill)" className={styles.areaPath} />
                    )}

                    {/* Lines */}
                    {SERIES_META.filter((s) => activeSeries[s.key]).map((s) => (
                        <path
                            key={s.key}
                            d={buildLinePath(s.key)}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={s.key === "views" ? 3 : 2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={styles.linePath}
                            style={
                                {
                                    strokeDasharray: pathLength(s.key),
                                    strokeDashoffset: 0,
                                    animation: `dashTrendDraw 1.1s ease-out both`,
                                    "--dash-length": pathLength(s.key),
                                } as React.CSSProperties
                            }
                        />
                    ))}

                    {/* Hover crosshair */}
                    {hoverPoint && (
                        <g>
                            <line
                                x1={xAt(hoverIndex!)}
                                x2={xAt(hoverIndex!)}
                                y1={PADDING_TOP}
                                y2={PADDING_TOP + innerHeight}
                                className={styles.crosshair}
                            />
                            {SERIES_META.filter((s) => activeSeries[s.key]).map((s) => (
                                <circle
                                    key={s.key}
                                    cx={xAt(hoverIndex!)}
                                    cy={yAt(hoverPoint[s.key])}
                                    r={4.5}
                                    fill="#ffffff"
                                    stroke={s.color}
                                    strokeWidth={2.5}
                                />
                            ))}
                        </g>
                    )}
                </svg>

                {hoverPoint && (
                    <div
                        className={styles.tooltip}
                        style={{
                            left: `${(xAt(hoverIndex!) / VIEW_WIDTH) * 100}%`,
                        }}
                    >
                        <div className={styles.tooltipDate}>
                            {formatPeriodLabel(hoverPoint.period, granularity, locale)}
                        </div>
                        {SERIES_META.filter((s) => activeSeries[s.key]).map((s) => (
                            <div key={s.key} className={styles.tooltipRow}>
                                <span className={styles.legendDot} style={{ backgroundColor: s.color }} />
                                <span className={styles.tooltipLabel}>{s.label}</span>
                                <span className={styles.tooltipValue}>{hoverPoint[s.key]}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
