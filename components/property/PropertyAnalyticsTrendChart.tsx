"use client";

import React, { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PropertyAnalyticsGranularity, PropertyAnalyticsTrendPoint } from "@/types/propertyAnalytics";
import styles from "./PropertyAnalyticsTrendChart.module.css";

interface PropertyAnalyticsTrendChartProps {
    trend: PropertyAnalyticsTrendPoint[];
    granularity: PropertyAnalyticsGranularity;
}

const PADDING_LEFT = 40;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 30;
const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 260;

function formatPeriodLabel(period: string, granularity: PropertyAnalyticsGranularity, locale: string): string {
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

export default function PropertyAnalyticsTrendChart({ trend, granularity }: PropertyAnalyticsTrendChartProps) {
    const t = useTranslations("propertyAnalytics");
    const locale = useLocale();
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const maxValue = useMemo(() => Math.max(1, ...trend.map((p) => p.views)), [trend]);

    const innerWidth = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const innerHeight = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const stepX = trend.length > 1 ? innerWidth / (trend.length - 1) : 0;

    const xAt = (index: number) => PADDING_LEFT + index * stepX;
    const yAt = (value: number) => PADDING_TOP + innerHeight - (value / maxValue) * innerHeight;

    const linePath = trend.length
        ? trend.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(p.views).toFixed(2)}`).join(" ")
        : "";

    const areaPath = trend.length
        ? `${linePath} L${xAt(trend.length - 1).toFixed(2)},${(PADDING_TOP + innerHeight).toFixed(2)} L${xAt(0).toFixed(2)},${(PADDING_TOP + innerHeight).toFixed(2)} Z`
        : "";

    const pathLength = useMemo(() => {
        let total = 0;
        for (let i = 1; i < trend.length; i++) {
            const dx = xAt(i) - xAt(i - 1);
            const dy = yAt(trend[i].views) - yAt(trend[i - 1].views);
            total += Math.sqrt(dx * dx + dy * dy);
        }
        return total || 1;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trend, maxValue]);

    const gridLines = [0, 0.25, 0.5, 0.75, 1];
    const labelStep = Math.max(1, Math.ceil(trend.length / 8));

    const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || trend.length === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const viewX = ratio * VIEW_WIDTH;
        const index = Math.round((viewX - PADDING_LEFT) / (stepX || 1));
        setHoverIndex(Math.min(trend.length - 1, Math.max(0, index)));
    };

    const hoverPoint = hoverIndex !== null ? trend[hoverIndex] : null;
    const isEmpty = trend.every((p) => p.views === 0);

    return (
        <div className={styles.chartWrapper}>
            {isEmpty && <div className={styles.emptyOverlay}>{t("chart.noData")}</div>}

            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className={styles.svg}
                onMouseMove={handleMove}
                onMouseLeave={() => setHoverIndex(null)}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="propertyAnalyticsAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8A1538" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#8A1538" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {gridLines.map((g) => {
                    const y = PADDING_TOP + innerHeight * (1 - g);
                    return (
                        <g key={g}>
                            <line x1={PADDING_LEFT} x2={VIEW_WIDTH - PADDING_RIGHT} y1={y} y2={y} className={styles.gridLine} />
                            <text x={PADDING_LEFT - 8} y={y + 3} className={styles.axisLabel} textAnchor="end">
                                {Math.round(maxValue * g)}
                            </text>
                        </g>
                    );
                })}

                {trend.map((point, i) =>
                    i % labelStep === 0 || i === trend.length - 1 ? (
                        <text key={point.period} x={xAt(i)} y={VIEW_HEIGHT - 8} className={styles.axisLabel} textAnchor="middle">
                            {formatPeriodLabel(point.period, granularity, locale)}
                        </text>
                    ) : null
                )}

                {trend.length > 0 && <path d={areaPath} fill="url(#propertyAnalyticsAreaFill)" className={styles.areaPath} />}

                {trend.length > 0 && (
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#8A1538"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.linePath}
                        style={
                            {
                                strokeDasharray: pathLength,
                                strokeDashoffset: 0,
                                animation: "propertyTrendDraw 1s ease-out both",
                                "--dash-length": pathLength,
                            } as React.CSSProperties
                        }
                    />
                )}

                {hoverPoint && (
                    <g>
                        <line
                            x1={xAt(hoverIndex!)}
                            x2={xAt(hoverIndex!)}
                            y1={PADDING_TOP}
                            y2={PADDING_TOP + innerHeight}
                            className={styles.crosshair}
                        />
                        <circle cx={xAt(hoverIndex!)} cy={yAt(hoverPoint.views)} r={4.5} fill="#ffffff" stroke="#8A1538" strokeWidth={2.5} />
                    </g>
                )}
            </svg>

            {hoverPoint && (
                <div className={styles.tooltip} style={{ left: `${(xAt(hoverIndex!) / VIEW_WIDTH) * 100}%` }}>
                    <div className={styles.tooltipDate}>{formatPeriodLabel(hoverPoint.period, granularity, locale)}</div>
                    <div className={styles.tooltipValue}>
                        {t("chart.viewsValue", { count: hoverPoint.views })}
                    </div>
                </div>
            )}
        </div>
    );
}
