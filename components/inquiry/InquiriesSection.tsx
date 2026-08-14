"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    FiCalendar,
    FiUser,
    FiPhone,
    FiMail,
    FiHome,
    FiInfo,
    FiMessageSquare,
    FiEye,
    FiX,
    FiMapPin,
    FiTag,
    FiClipboard,
    FiStar,
    FiAlertCircle,
    FiCheck,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import { inquiryService, Inquiry } from "@/services/inquiry.service";
import { ConfirmModal } from "@/components/ui";
import styles from "./InquiriesSection.module.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

type StatusKey = Inquiry["status"];

function StatusBadge({ status }: { status: StatusKey }) {
    const t = useTranslations("inquiries.status");
    const clsMap: Record<StatusKey, string> = {
        PENDING: styles.statusPending,
        APPROVED: styles.statusApproved,
        ACCEPTED: styles.statusApproved,
        REJECTED: styles.statusRejected,
        COMPLETED: styles.statusCompleted,
        CANCELLED: styles.statusCancelled,
    };
    const cls = clsMap[status] ?? styles.statusPending;
    const label = clsMap[status] ? t(status) : status;
    return <span className={`${styles.statusBadge} ${cls}`}>{label}</span>;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function InquiryDetailModal({
    inquiry,
    onClose,
}: {
    inquiry: Inquiry;
    onClose: () => void;
}) {
    const { visitor, listing, scheduledAt, proposedAt, status, notes, createdAt } = inquiry;
    const t = useTranslations("inquiries.modal");
    const tInquiries = useTranslations("inquiries");

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const coverPhoto = listing.photos?.[0]?.url;
    const fullAddress = [
        listing.addressLine1,
        listing.addressLine2,
        listing.areaName,
        listing.municipality?.name,
        listing.country,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={t("ariaLabel")}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <FiClipboard size={17} className={styles.modalTitleIcon} />
                        {t("title")}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label={t("close")}>
                        <FiX size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    {/* ── Visitor ── */}
                    <div className={styles.modalSection}>
                        <h3 className={styles.modalSectionTitle}>
                            <FiUser size={13} /> {t("visitorInfo")}
                        </h3>

                        <div className={styles.visitorHeaderRow}>
                            <div className={styles.modalVisitorAvatar}>
                                {getInitials(visitor.name)}
                            </div>
                            <div className={styles.visitorHeaderInfo}>
                                <span className={styles.visitorHeaderName}>{visitor.name}</span>
                                <span className={styles.visitorHeaderSub}>{visitor.email}</span>
                            </div>
                        </div>

                        <div className={styles.modalGrid}>
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>
                                    <FiPhone size={10} /> {t("phone")}
                                </span>
                                <span className={styles.fieldValue}>{visitor.phone}</span>
                            </div>
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>
                                    <FiMail size={10} /> {t("email")}
                                </span>
                                <span className={styles.fieldValueLight}>{visitor.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Property ── */}
                    <div className={styles.modalSection}>
                        <h3 className={styles.modalSectionTitle}>
                            <FiHome size={13} /> {t("property")}
                        </h3>

                        <div className={styles.propertyThumbRow}>
                            {coverPhoto ? (
                                <img
                                    src={coverPhoto}
                                    alt={listing.propertyName}
                                    className={styles.propertyThumb}
                                />
                            ) : (
                                <div className={styles.propertyThumbPlaceholder}>
                                    <FiHome size={20} />
                                </div>
                            )}
                            <div className={styles.propertyThumbInfo}>
                                <span className={styles.propertyThumbName}>
                                    {listing.propertyName}
                                </span>
                                <span className={styles.propertyThumbMeta}>
                                    {tInquiries("referencePrefix", { code: listing.referenceCode })} &nbsp;·&nbsp;{" "}
                                    {listing.type?.title} &nbsp;·&nbsp; {listing.purpose}
                                </span>
                            </div>
                        </div>

                        <div className={styles.modalGrid}>
                            {listing.price !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("price")}</span>
                                    <span className={styles.fieldValue}>
                                        {listing.price.toLocaleString()} QAR
                                        {listing.priceNegotiable && (
                                            <span style={{ fontWeight: 400, fontSize: 11, marginLeft: 6, color: "#0369a1" }}>
                                                {t("negotiable")}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                            {listing.status && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("listingStatus")}</span>
                                    <span className={styles.fieldValue}>{listing.status}</span>
                                </div>
                            )}
                            {listing.bedrooms !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("bedrooms")}</span>
                                    <span className={styles.fieldValue}>{t("bedsSuffix", { count: listing.bedrooms })}</span>
                                </div>
                            )}
                            {listing.bathrooms !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("bathrooms")}</span>
                                    <span className={styles.fieldValue}>{t("bathsSuffix", { count: listing.bathrooms })}</span>
                                </div>
                            )}
                            {listing.area !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("area")}</span>
                                    <span className={styles.fieldValue}>{t("areaSuffix", { value: listing.area })}</span>
                                </div>
                            )}
                            {listing.furnishing?.title && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("furnishing")}</span>
                                    <span className={styles.fieldValue}>{listing.furnishing.title}</span>
                                </div>
                            )}
                            {listing.parkingSpaces !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("parkingSpaces")}</span>
                                    <span className={styles.fieldValue}>{listing.parkingSpaces}</span>
                                </div>
                            )}
                            {listing.yearBuilt && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("yearBuilt")}</span>
                                    <span className={styles.fieldValue}>{listing.yearBuilt}</span>
                                </div>
                            )}
                            {fullAddress && (
                                <div className={styles.modalFieldFull}>
                                    <span className={styles.fieldLabel}>
                                        <FiMapPin size={10} /> {t("address")}
                                    </span>
                                    <span className={styles.fieldValueLight}>{fullAddress}</span>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                            <div>
                                <span className={styles.fieldLabel} style={{ display: "block", marginBottom: 8 }}>
                                    <FiStar size={10} /> {t("amenities")}
                                </span>
                                <div className={styles.chipsRow}>
                                    {listing.amenities.map((a) => (
                                        <span key={a.id} className={styles.chip}>{a.title}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nearby Tags */}
                        {listing.nearbyTags && listing.nearbyTags.length > 0 && (
                            <div>
                                <span className={styles.fieldLabel} style={{ display: "block", marginBottom: 8 }}>
                                    <FiTag size={10} /> {t("nearby")}
                                </span>
                                <div className={styles.chipsRow}>
                                    {listing.nearbyTags.map((tag) => (
                                        <span key={tag.id} className={styles.chip}>{tag.title}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        {(listing.contactPhone || listing.contactWhatsapp) && (
                            <div className={styles.modalGrid}>
                                {listing.contactPhone && (
                                    <div className={styles.modalField}>
                                        <span className={styles.fieldLabel}>
                                            <FiPhone size={10} /> {t("contactPhone")}
                                        </span>
                                        <span className={styles.fieldValue}>{listing.contactPhone}</span>
                                    </div>
                                )}
                                {listing.contactWhatsapp && (
                                    <div className={styles.modalField}>
                                        <span className={styles.fieldLabel}>
                                            <FiMessageSquare size={10} /> {t("whatsapp")}
                                        </span>
                                        <span className={styles.fieldValue}>{listing.contactWhatsapp}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Visit Details ── */}
                    <div className={styles.modalSection}>
                        <h3 className={styles.modalSectionTitle}>
                            <FiCalendar size={13} /> {t("visitDetails")}
                        </h3>

                        <div className={styles.modalGrid}>
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>{t("status")}</span>
                                <StatusBadge status={status} />
                            </div>
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>{t("scheduledAt")}</span>
                                <span className={styles.fieldValue}>
                                    {formatDate(scheduledAt)} {t("at")} {formatTime(scheduledAt)}
                                </span>
                            </div>
                            {proposedAt && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>{t("proposedAt")}</span>
                                    <span className={styles.fieldValue}>
                                        {formatDate(proposedAt)} {t("at")} {formatTime(proposedAt)}
                                    </span>
                                </div>
                            )}
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>{t("inquirySubmitted")}</span>
                                <span className={styles.fieldValue}>{formatDate(createdAt)}</span>
                            </div>
                        </div>

                        {notes && (
                            <div>
                                <span
                                    className={styles.fieldLabel}
                                    style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}
                                >
                                    <FiInfo size={10} /> {t("notesFromVisitor")}
                                </span>
                                <div className={styles.notesBlock}>{notes}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button className={styles.closeModalBtn} onClick={onClose}>
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InquiriesSection() {
    const t = useTranslations("inquiries");
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Inquiry | null>(null);
    const [acceptTarget, setAcceptTarget] = useState<Inquiry | null>(null);
    const [accepting, setAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState<string | null>(null);

    useEffect(() => {
        void fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await inquiryService.getInquiriesAsOwner();
            setInquiries(data);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message ?? t("loadError"));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = useCallback(() => setSelected(null), []);

    const handleConfirmAccept = useCallback(async () => {
        if (!acceptTarget || accepting) return;
        setAccepting(true);
        setAcceptError(null);
        try {
            const updated = await inquiryService.acceptVisit(acceptTarget.id);
            setInquiries((prev) =>
                prev.map((inq) =>
                    inq.id === acceptTarget.id ? { ...inq, ...updated, status: updated?.status ?? "ACCEPTED" } : inq
                )
            );
            setAcceptTarget(null);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setAcceptError(e.response?.data?.message ?? t("acceptError"));
        } finally {
            setAccepting(false);
        }
    }, [acceptTarget, accepting, t]);

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <span>{t("loading")}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <FiAlertCircle size={20} style={{ color: "var(--danger)", marginBottom: 6 }} />
                <p style={{ margin: 0 }}>{error}</p>
            </div>
        );
    }

    if (inquiries.length === 0) {
        return (
            <div className={styles.emptyState}>
                <FiClipboard size={40} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
                <p className={styles.emptySubtitle}>
                    {t("emptySubtitle")}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>{t("table.visitor")}</th>
                            <th className={styles.th}>{t("table.property")}</th>
                            <th className={styles.th}>{t("table.scheduled")}</th>
                            <th className={styles.th}>{t("table.status")}</th>
                            <th className={styles.th}>{t("table.submitted")}</th>
                            <th className={styles.th}>{t("table.action")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.map((inq) => (
                            <tr key={inq.id} className={styles.tr}>
                                {/* Visitor */}
                                <td className={styles.td}>
                                    <div className={styles.visitorCell}>
                                        <div className={styles.visitorAvatar}>
                                            {getInitials(inq.visitor.name)}
                                        </div>
                                        <div className={styles.visitorInfo}>
                                            <span className={styles.visitorName}>{inq.visitor.name}</span>
                                            <span className={styles.visitorContact}>{inq.visitor.phone}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Property */}
                                <td className={styles.td}>
                                    <div className={styles.propertyCell}>
                                        <span className={styles.propertyName}>
                                            {inq.listing.propertyName}
                                        </span>
                                        <span className={styles.propertyRef}>
                                            {t("referencePrefix", { code: inq.listing.referenceCode })}
                                        </span>
                                    </div>
                                </td>

                                {/* Scheduled */}
                                <td className={styles.td}>
                                    <div className={styles.dateCell}>
                                        <span className={styles.dateMain}>{formatDate(inq.scheduledAt)}</span>
                                        <span className={styles.dateTime}>{formatTime(inq.scheduledAt)}</span>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className={styles.td}>
                                    <StatusBadge status={inq.status} />
                                </td>

                                {/* Submitted */}
                                <td className={styles.td}>
                                    <div className={styles.dateCell}>
                                        <span className={styles.dateMain}>{formatDate(inq.createdAt)}</span>
                                    </div>
                                </td>

                                {/* Action */}
                                <td className={styles.td}>
                                    <div className={styles.actionsGroup}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => setSelected(inq)}
                                        >
                                            <FiEye size={13} /> {t("viewDetails")}
                                        </button>
                                        {inq.status === "PENDING" && (
                                            <button
                                                className={styles.acceptBtn}
                                                onClick={() => {
                                                    setAcceptError(null);
                                                    setAcceptTarget(inq);
                                                }}
                                            >
                                                <FiCheck size={13} /> {t("accept")}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <InquiryDetailModal inquiry={selected} onClose={handleClose} />
            )}

            <ConfirmModal
                open={!!acceptTarget}
                title={t("acceptTitle")}
                description={
                    acceptTarget
                        ? t("acceptDescription", {
                            name: acceptTarget.visitor.name,
                            property: acceptTarget.listing.propertyName,
                        })
                        : undefined
                }
                confirmLabel={accepting ? t("accepting") : t("accept")}
                intent="success"
                onConfirm={() => void handleConfirmAccept()}
                onCancel={() => {
                    if (!accepting) setAcceptTarget(null);
                }}
            />

            {acceptError && (
                <div className={styles.errorState} style={{ marginTop: 12 }}>
                    <FiAlertCircle size={16} style={{ color: "var(--danger)", marginBottom: 4 }} />
                    <p style={{ margin: 0 }}>{acceptError}</p>
                </div>
            )}
        </div>
    );
}
