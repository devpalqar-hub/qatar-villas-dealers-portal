"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    FiArrowLeft,
    FiUser,
    FiMail,
    FiPhone,
    FiShield,
    FiBriefcase,
    FiCalendar,
    FiInfo,
    FiCheckCircle,
    FiXCircle,
    FiKey,
    FiClock,
    FiHash,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import { AppLayout, Button, Badge } from "@/components/ui";
import { staffService, StaffMember } from "@/services/staff.service";
import styles from "./page.module.css";

// Deterministically pick an avatar colour from a name
const AVATAR_COLORS = [
    "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6",
];
const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || "?").length; i++) {
        hash = (name || "?").charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string) =>
    (name || "?")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-QA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

export default function StaffDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const t = useTranslations("staff.detail");
    const tStaff = useTranslations("staff");
    const tCommon = useTranslations("common");
    const tSidebar = useTranslations("sidebar");
    const tPerm = useTranslations("permissionEnum");

    const [staff, setStaff] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchStaffDetail(id);
    }, [id]);

    const fetchStaffDetail = async (staffId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await staffService.getStaffById(staffId);
            setStaff(data);
        } catch (err: any) {
            console.error("Failed to fetch staff details:", err);
            setError(err.response?.data?.message || t("loadError"));
        } finally {
            setLoading(false);
        }
    };

    /* ─── Loading skeleton ─────────────────────────────────────────── */
    if (loading) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={styles.breadcrumbs}>
                        <Link href="/dashboard">{tSidebar("dashboard")}</Link>
                        <span>&gt;</span>
                        <Link href="/staff">{tSidebar("staff")}</Link>
                        <span>&gt;</span>
                        <span>{t("breadcrumbLoading")}</span>
                    </div>

                    <div className={styles.headerCard}>
                        <div className={styles.skeletonAvatar} />
                        <div className={styles.skeletonLines}>
                            <div className={styles.skeletonLine} style={{ width: "40%" }} />
                            <div className={styles.skeletonLine} style={{ width: "25%", height: 16 }} />
                        </div>
                    </div>

                    <div className={styles.layoutGrid}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.sectionCard} style={{ height: 180, background: "#e2e8f0" }} />
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    /* ─── Error / Not Found ────────────────────────────────────────── */
    if (error || !staff) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={styles.breadcrumbs}>
                        <Link href="/dashboard">{tSidebar("dashboard")}</Link>
                        <span>&gt;</span>
                        <Link href="/staff">{tSidebar("staff")}</Link>
                        <span>&gt;</span>
                        <span>{t("breadcrumbError")}</span>
                    </div>
                    <div className={styles.errorContainer}>
                        <FiInfo size={48} color="var(--primary)" />
                        <h2 className={styles.errorTitle}>{t("notFoundTitle")}</h2>
                        <p className={styles.errorSubtext}>
                            {error || t("notFoundSubtext")}
                        </p>
                        <Button onClick={() => router.push("/staff")} leftIcon={<FiArrowLeft />}>
                            {t("backToStaff")}
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const user = staff.staffUser;
    const isActive = staff.isActive && user?.isActive;
    const avatarColor = getAvatarColor(user?.name || "");
    const initials = getInitials(user?.name || "");

    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Breadcrumbs */}
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                    <Link href="/dashboard">{tSidebar("dashboard")}</Link>
                    <span>&gt;</span>
                    <Link href="/staff">{tSidebar("staff")}</Link>
                    <span>&gt;</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>
                        {user?.name || t("defaultName")}
                    </span>
                </nav>

                <button className={styles.backBtn} onClick={() => router.push("/staff")}>
                    <FiArrowLeft size={16} /> {t("backToStaff")}
                </button>

                {/* Header Card */}
                <div className={styles.headerCard}>
                    <div className={styles.headerLeft}>
                        <div
                            className={styles.avatar}
                            style={{ background: avatarColor }}
                        >
                            {initials}
                        </div>

                        <div className={styles.headerInfo}>
                            <div className={styles.titleRow}>
                                <h1 className={styles.title}>{user?.name || tCommon("notAvailable")}</h1>
                                <div className={styles.badgeGroup}>
                                    <Badge variant={isActive ? "success" : "danger"}>
                                        {isActive ? tStaff("statusActive") : tStaff("statusInactive")}
                                    </Badge>
                                    <span className={styles.roleBadge}>{user?.role}</span>
                                </div>
                            </div>

                            <div className={styles.metaRow}>
                                <span className={styles.metaItem}>
                                    <FiBriefcase size={14} />
                                    {staff.position || "—"}
                                </span>
                                <span className={styles.metaSeparator}>·</span>
                                <span className={styles.metaItem}>
                                    <FiMail size={14} />
                                    {user?.email || "—"}
                                </span>
                                <span className={styles.metaSeparator}>·</span>
                                <span className={styles.metaItem}>
                                    <FiPhone size={14} />
                                    {user?.phone || "—"}
                                </span>
                            </div>

                            <div className={styles.idRow}>
                                <FiHash size={12} />
                                {t("idPrefix", { id: staff.id })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Detail Grid */}
                <div className={styles.layoutGrid}>
                    {/* Left column */}
                    <div className={styles.mainColumn}>

                        {/* Personal Information */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiUser size={18} /> {t("personalInfo")}
                            </h2>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{t("fullName")}</span>
                                    <span className={styles.infoValue}>{user?.name || "—"}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{t("emailAddress")}</span>
                                    <span className={styles.infoValue}>
                                        <a href={`mailto:${user?.email}`} className={styles.link}>
                                            {user?.email || "—"}
                                        </a>
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{t("phoneNumber")}</span>
                                    <span className={styles.infoValue}>
                                        <a href={`tel:${user?.phone}`} className={styles.link}>
                                            {user?.phone || "—"}
                                        </a>
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{t("systemRole")}</span>
                                    <span className={styles.infoValue}>{user?.role || "—"}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{t("accountStatus")}</span>
                                    <span className={styles.infoValue}>
                                        {user?.isActive ? (
                                            <span className={styles.activeChip}>
                                                <FiCheckCircle size={13} /> {tStaff("statusActive")}
                                            </span>
                                        ) : (
                                            <span className={styles.inactiveChip}>
                                                <FiXCircle size={13} /> {tStaff("statusInactive")}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{t("userId")}</span>
                                    <span className={styles.infoValue} style={{ fontFamily: "monospace", fontSize: 13 }}>
                                        {user?.id || "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Position & Permissions */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiKey size={18} /> {t("rolePermissions")}
                            </h2>

                            <div className={styles.positionRow}>
                                <FiBriefcase size={16} />
                                <div>
                                    <span className={styles.positionLabel}>{t("position")}</span>
                                    <span className={styles.positionValue}>{staff.position || "—"}</span>
                                </div>
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.permissionsBlock}>
                                <span className={styles.permissionsHeading}>
                                    {t("assignedPermissions", { count: staff.permissions?.length || 0 })}
                                </span>
                                {staff.permissions && staff.permissions.length > 0 ? (
                                    <div className={styles.permGrid}>
                                        {staff.permissions.map((perm) => (
                                            <div key={perm} className={styles.permCard}>
                                                <FiShield size={14} className={styles.permIcon} />
                                                {tPerm(perm)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.noPerms}>{t("noPermissionsAssigned")}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className={styles.sideColumn}>

                        {/* Status Card */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiCheckCircle size={18} /> {t("statusOverview")}
                            </h2>
                            <div className={styles.statusGrid}>
                                <div className={styles.statusRow}>
                                    <span className={styles.statusLabel}>{t("staffRecord")}</span>
                                    <Badge variant={staff.isActive ? "success" : "danger"}>
                                        {staff.isActive ? tStaff("statusActive") : tStaff("statusInactive")}
                                    </Badge>
                                </div>
                                <div className={styles.statusRow}>
                                    <span className={styles.statusLabel}>{t("userAccount")}</span>
                                    <Badge variant={user?.isActive ? "success" : "danger"}>
                                        {user?.isActive ? tStaff("statusActive") : tStaff("statusInactive")}
                                    </Badge>
                                </div>
                                <div className={styles.statusRow}>
                                    <span className={styles.statusLabel}>{tStaff("table.permissions")}</span>
                                    <Badge variant="info">
                                        {t("permissionsGranted", { count: staff.permissions?.length || 0 })}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiCalendar size={18} /> {t("timeline")}
                            </h2>
                            <div className={styles.timeline}>
                                <div className={styles.timelineItem}>
                                    <div className={styles.timelineIcon}>
                                        <FiClock size={14} />
                                    </div>
                                    <div className={styles.timelineContent}>
                                        <span className={styles.timelineLabel}>{t("memberSince")}</span>
                                        <span className={styles.timelineValue}>
                                            {formatDate(staff.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.timelineItem}>
                                    <div className={styles.timelineIcon}>
                                        <FiCalendar size={14} />
                                    </div>
                                    <div className={styles.timelineContent}>
                                        <span className={styles.timelineLabel}>{t("lastUpdated")}</span>
                                        <span className={styles.timelineValue}>
                                            {formatDate(staff.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                                {user?.createdAt && (
                                    <div className={styles.timelineItem}>
                                        <div className={styles.timelineIcon}>
                                            <FiUser size={14} />
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <span className={styles.timelineLabel}>{t("userCreated")}</span>
                                            <span className={styles.timelineValue}>
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* System IDs */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiHash size={18} /> {t("systemReferences")}
                            </h2>
                            <div className={styles.idGrid}>
                                <div className={styles.idItem}>
                                    <span className={styles.idLabel}>{t("staffRecordId")}</span>
                                    <span className={styles.idValue}>{staff.id}</span>
                                </div>
                                <div className={styles.idItem}>
                                    <span className={styles.idLabel}>{t("staffUserId")}</span>
                                    <span className={styles.idValue}>{staff.staffUserId}</span>
                                </div>
                                <div className={styles.idItem}>
                                    <span className={styles.idLabel}>{t("dealerId")}</span>
                                    <span className={styles.idValue}>{staff.dealerUserId}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
