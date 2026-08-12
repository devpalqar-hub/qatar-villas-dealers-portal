"use client";

import React from "react";
import { useTranslations } from "next-intl";
import * as FI from "react-icons/fi";
import { DealerAnalyticsOverview } from "@/types/analytics";
import styles from "./EngagementFunnelFlow.module.css";

const IconEye = FI.FiEye;
const IconUsers = FI.FiUsers;
const IconActivity = FI.FiActivity;
const IconMessageSquare = FI.FiMessageSquare;
const IconArrowRight = FI.FiArrowRight;

interface EngagementFunnelFlowProps {
    overview: DealerAnalyticsOverview;
}

export default function EngagementFunnelFlow({
    overview,
}: EngagementFunnelFlowProps) {
    const t = useTranslations("analyticsPage.funnel");

    const impressions = overview?.periodImpressions || overview?.totalImpressions || 0;
    const reach = overview?.periodReach || overview?.totalReach || 0;
    const views = overview?.periodViews || overview?.totalViews || 0;
    const inquiries =
        (overview?.totalVisitsCount || 0) + (overview?.totalConversationsCount || 0);

    // Calculate rates
    const reachRate = impressions > 0 ? ((reach / impressions) * 100).toFixed(1) : "0.0";
    const viewRate = reach > 0 ? ((views / reach) * 100).toFixed(1) : "0.0";
    const leadRate = views > 0 ? ((inquiries / views) * 100).toFixed(1) : "0.0";

    const stages = [
        {
            id: "impressions",
            title: t("impressions"),
            count: impressions,
            desc: t("impressionsDesc"),
            icon: IconEye,
            colorClass: styles.stageIndigo,
            iconClass: styles.iconIndigo,
        },
        {
            id: "reach",
            title: t("reach"),
            count: reach,
            desc: t("reachDesc"),
            conversion: `${reachRate}% CTR`,
            icon: IconUsers,
            colorClass: styles.stageSky,
            iconClass: styles.iconSky,
        },
        {
            id: "views",
            title: t("views"),
            count: views,
            desc: t("viewsDesc"),
            conversion: `${viewRate}% Open Rate`,
            icon: IconActivity,
            colorClass: styles.stageEmerald,
            iconClass: styles.iconEmerald,
        },
        {
            id: "conversions",
            title: t("conversions"),
            count: inquiries,
            desc: t("conversionsDesc"),
            conversion: `${leadRate}% Lead Rate`,
            icon: IconMessageSquare,
            colorClass: styles.stageViolet,
            iconClass: styles.iconViolet,
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>{t("title")}</h3>
                    <p className={styles.subtitle}>{t("subtitle")}</p>
                </div>
                <div className={styles.liveBadge}>
                    <span className={styles.pulseDot} />
                    <span>Real-time Funnel</span>
                </div>
            </div>

            {/* Funnel Flow Diagram */}
            <div className={styles.funnelFlow}>
                {stages.map((stage, idx) => {
                    const IconComponent = stage.icon;
                    const isLast = idx === stages.length - 1;

                    return (
                        <React.Fragment key={stage.id}>
                            <div className={`${styles.stageCard} ${stage.colorClass}`}>
                                <div className={styles.stageTop}>
                                    <div className={stage.iconClass}>
                                        <IconComponent size={20} />
                                    </div>
                                    <span className={styles.stageTitle}>{stage.title}</span>
                                </div>

                                <div className={styles.stageValueRow}>
                                    <span className={styles.stageCount}>
                                        {stage.count.toLocaleString()}
                                    </span>
                                </div>

                                <p className={styles.stageDesc}>{stage.desc}</p>
                            </div>

                            {!isLast && (
                                <div className={styles.connector}>
                                    <div className={styles.connectorLine} />
                                    {stage.conversion && (
                                        <div className={styles.conversionChip}>
                                            <span>{stages[idx + 1].conversion}</span>
                                        </div>
                                    )}
                                    <div className={styles.connectorArrow}>
                                        <IconArrowRight size={16} />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
