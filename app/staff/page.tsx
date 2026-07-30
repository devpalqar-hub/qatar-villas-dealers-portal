"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FiPlus,
    FiSearch,
    FiEye,
    FiEdit2,
    FiUsers,
    FiCheckCircle,
    FiClock,
    FiShield,
    FiDownload,
    FiChevronLeft,
    FiChevronRight,
    FiUserX,
} from "react-icons/fi";
import { AppLayout, Button, Badge, ConfirmModal } from "@/components/ui";
import { staffService, StaffMember, GetStaffResponse } from "@/services/staff.service";
import AddStaffModal from "@/components/staff/AddStaffModal";
import EditStaffModal from "@/components/staff/EditStaffModal";
import styles from "./page.module.css";

const AVATAR_CLASSES = [
    styles.avatar0,
    styles.avatar1,
    styles.avatar2,
    styles.avatar3,
    styles.avatar4,
    styles.avatar5,
];

// Deterministically pick an avatar color from a name so it stays stable across renders
const getAvatarClass = (name: string) => {
    const seed = name || "?";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_CLASSES[Math.abs(hash) % AVATAR_CLASSES.length];
};

const MAX_VISIBLE_PERMISSIONS = 3;

export default function StaffPage() {
    const router = useRouter();
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number }>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(20);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [staffToDeactivate, setStaffToDeactivate] = useState<StaffMember | null>(null);
    const [isDeactivating, setIsDeactivating] = useState<boolean>(false);
    const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);

    useEffect(() => {
        fetchStaff(page, limit);
    }, [page, limit]);

    const fetchStaff = async (currentPage: number, currentLimit: number) => {
        setLoading(true);
        try {
            const res: GetStaffResponse = await staffService.getStaff(currentPage, currentLimit);
            setStaffList(res.data || []);
            if (res.meta) {
                setMeta(res.meta);
            }
        } catch (error) {
            console.error("Failed to fetch staff members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDeactivate = async () => {
        if (!staffToDeactivate) return;
        setIsDeactivating(true);
        try {
            await staffService.deleteStaff(staffToDeactivate.id);
            setStaffToDeactivate(null);
            fetchStaff(page, limit);
        } catch (error) {
            console.error("Failed to deactivate staff member:", error);
        } finally {
            setIsDeactivating(false);
        }
    };

    // Filter staff locally based on search query
    const filteredStaff = staffList.filter((member) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const name = member.staffUser?.name?.toLowerCase() || "";
        const email = member.staffUser?.email?.toLowerCase() || "";
        const position = member.position?.toLowerCase() || "";
        const phone = member.staffUser?.phone?.toLowerCase() || "";
        return (
            name.includes(query) ||
            email.includes(query) ||
            position.includes(query) ||
            phone.includes(query)
        );
    });

    // Format permission text e.g. "MANAGE_LISTINGS" -> "Manage Listings"
    const formatPermission = (perm: string) => {
        return perm
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    // Calculate stats
    const totalStaff = meta.total || staffList.length;
    const activeStaff = staffList.filter((s) => s.isActive || s.staffUser?.isActive).length;
    const inactiveStaff = totalStaff - activeStaff;
    const uniquePermissionsCount = Array.from(
        new Set(staffList.flatMap((s) => s.permissions || []))
    ).length;

    const startItem = meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
    const endItem = Math.min(meta.page * meta.limit, meta.total);

    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Breadcrumbs */}
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <span>&gt;</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>Staff</span>
                </nav>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>Staff</h1>
                        <p className={styles.subtitle}>
                            Manage your team members and their access.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        <Button leftIcon={<FiPlus size={16} />} onClick={() => setIsAddModalOpen(true)}>
                            Add Staff
                        </Button>

                        <Button
                            variant="secondary"
                            leftIcon={<FiDownload size={16} />}
                        >
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className={styles.statGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrapper} ${styles.iconRed}`}>
                            <FiUsers />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Total Staff</span>
                            <span className={styles.statValue}>{totalStaff}</span>
                            <span className={styles.statSubtext}>All team members</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrapper} ${styles.iconGreen}`}>
                            <FiCheckCircle />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Active Staff</span>
                            <span className={styles.statValue}>{activeStaff}</span>
                            <span className={styles.statSubtext}>Currently active</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrapper} ${styles.iconAmber}`}>
                            <FiClock />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Inactive / On Leave</span>
                            <span className={styles.statValue}>{inactiveStaff}</span>
                            <span className={styles.statSubtext}>Currently inactive</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrapper} ${styles.iconPurple}`}>
                            <FiShield />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Permissions Active</span>
                            <span className={styles.statValue}>{uniquePermissionsCount}</span>
                            <span className={styles.statSubtext}>Across organization</span>
                        </div>
                    </div>
                </div>

                {/* Main Table Container */}
                <div className={styles.tableContainer}>
                    {/* Search Toolbar */}
                    <div className={styles.toolbar}>
                        <div className={styles.searchWrapper}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search by name, email, position..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {!loading && searchQuery.trim() && (
                            <span className={styles.resultCount}>
                                {filteredStaff.length} result{filteredStaff.length === 1 ? "" : "s"}
                            </span>
                        )}
                    </div>

                    {/* Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Staff Member</th>
                                    <th className={styles.th}>Role</th>
                                    <th className={styles.th}>Permissions</th>
                                    <th className={styles.th}>Email</th>
                                    <th className={styles.th}>Phone</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={styles.th} style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={`skeleton-${i}`} className={styles.skeletonRow}>
                                            <td className={styles.td}>
                                                <div className={styles.skeletonAvatarRow}>
                                                    <div className={styles.skeletonAvatar} />
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                        <div className={styles.skeletonBlock} style={{ width: 120 }} />
                                                        <div className={styles.skeletonBlock} style={{ width: 60, height: 10 }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 80 }} /></td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 140 }} /></td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 150 }} /></td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 100 }} /></td>
                                            <td className={styles.td}><div className={styles.skeletonBlock} style={{ width: 60 }} /></td>
                                            <td className={styles.td} style={{ textAlign: "right" }}>
                                                <div className={styles.skeletonBlock} style={{ width: 60, marginLeft: "auto" }} />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyState}>
                                            <div className={styles.emptyStateIcon}>
                                                <FiUserX />
                                            </div>
                                            <div className={styles.emptyStateTitle}>No staff members found</div>
                                            <div className={styles.emptyStateSubtext}>
                                                {searchQuery.trim()
                                                    ? "Try a different name, email, or position."
                                                    : "Add your first team member to get started."}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((item, index) => {
                                        const user = item.staffUser || {};
                                        const initials = user.name
                                            ? user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .substring(0, 2)
                                            : "ST";
                                        const isItemActive = item.isActive && (user.isActive ?? true);
                                        const displayId = `ST-${(index + 1).toString().padStart(3, "0")}`;
                                        const permissions = item.permissions || [];
                                        const visiblePermissions = permissions.slice(0, MAX_VISIBLE_PERMISSIONS);
                                        const extraPermissionsCount = permissions.length - visiblePermissions.length;

                                        return (
                                            <tr key={item.id} className={styles.tr}>
                                                {/* Staff Member */}
                                                <td className={styles.td}>
                                                    <div className={styles.staffMember}>
                                                        <div className={`${styles.avatar} ${getAvatarClass(user.name || "?")}`}>
                                                            {initials}
                                                        </div>
                                                        <div className={styles.staffDetails}>
                                                            <span className={styles.staffName}>
                                                                {user.name || "N/A"}
                                                            </span>
                                                            <span className={styles.staffId}>
                                                                ID: {displayId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Position / Role */}
                                                <td className={styles.td}>
                                                    <span className={styles.positionBadge}>
                                                        {item.position || user.role || "Staff"}
                                                    </span>
                                                </td>

                                                {/* Permissions */}
                                                <td className={styles.td}>
                                                    <div className={styles.permissionsWrapper}>
                                                        {visiblePermissions.length > 0 ? (
                                                            <>
                                                                {visiblePermissions.map((perm) => (
                                                                    <span key={perm} className={styles.permChip}>
                                                                        {formatPermission(perm)}
                                                                    </span>
                                                                ))}
                                                                {extraPermissionsCount > 0 && (
                                                                    <span className={styles.permChipMore}>
                                                                        +{extraPermissionsCount} more
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className={styles.permChip}>No Permissions</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className={styles.td}>{user.email || "—"}</td>

                                                {/* Phone */}
                                                <td className={styles.td}>{user.phone || "—"}</td>

                                                {/* Status */}
                                                <td className={styles.td}>
                                                    <Badge variant={isItemActive ? "success" : "danger"}>
                                                        {isItemActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </td>

                                                {/* Actions */}
                                                <td className={styles.td} style={{ textAlign: "right" }}>
                                                    <div className={styles.actionsGroup}>
                                                        <button
                                                            className={styles.actionBtn}
                                                            title="View Staff Member"
                                                            onClick={() => router.push(`/staff/${item.id}`)}
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                        <button
                                                            className={styles.actionBtn}
                                                            title="Edit Staff Member"
                                                            onClick={() => setStaffToEdit(item)}
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.dangerActionBtn}`}
                                                            title={isItemActive ? "Deactivate Staff Member" : "Staff Member Deactivated"}
                                                            onClick={() => setStaffToDeactivate(item)}
                                                            disabled={!isItemActive}
                                                        >
                                                            <FiUserX size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <div className={styles.pageInfo}>
                            Showing {startItem} to {endItem} of {meta.total || filteredStaff.length} staff members
                        </div>

                        <div className={styles.paginationRight}>

                            <div className={styles.pageControls}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    aria-label="Previous Page"
                                >
                                    <FiChevronLeft size={16} />
                                </button>

                                {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map(
                                    (pageNum) => (
                                        <button
                                            key={pageNum}
                                            className={`${styles.pageBtn} ${pageNum === page ? styles.active : ""
                                                }`}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                )}

                                <button
                                    className={styles.pageBtn}
                                    onClick={() =>
                                        setPage((p) => Math.min(meta.totalPages || 1, p + 1))
                                    }
                                    disabled={page >= (meta.totalPages || 1)}
                                    aria-label="Next Page"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddStaffModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => fetchStaff(page, limit)}
            />

            <EditStaffModal
                open={!!staffToEdit}
                staffMember={staffToEdit}
                onClose={() => setStaffToEdit(null)}
                onSuccess={() => {
                    setStaffToEdit(null);
                    fetchStaff(page, limit);
                }}
            />

            <ConfirmModal
                open={!!staffToDeactivate}
                title="Deactivate Staff Member"
                description={`Are you sure you want to deactivate ${staffToDeactivate?.staffUser?.name || "this staff member"}? They will lose access to the dealer portal.`}
                confirmLabel={isDeactivating ? "Deactivating..." : "Deactivate"}
                cancelLabel="Cancel"
                intent="danger"
                onConfirm={handleConfirmDeactivate}
                onCancel={() => setStaffToDeactivate(null)}
            />
        </AppLayout>
    );
}