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
} from "react-icons/fi";
import { inquiryService, Inquiry } from "@/services/inquiry.service";
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
    const map: Record<StatusKey, { label: string; cls: string }> = {
        PENDING: { label: "Pending", cls: styles.statusPending },
        APPROVED: { label: "Approved", cls: styles.statusApproved },
        REJECTED: { label: "Rejected", cls: styles.statusRejected },
        COMPLETED: { label: "Completed", cls: styles.statusCompleted },
        CANCELLED: { label: "Cancelled", cls: styles.statusCancelled },
    };
    const cfg = map[status] ?? { label: status, cls: styles.statusPending };
    return <span className={`${styles.statusBadge} ${cfg.cls}`}>{cfg.label}</span>;
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
            aria-label="Inquiry Details"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <FiClipboard size={17} className={styles.modalTitleIcon} />
                        Inquiry Details
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <FiX size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    {/* ── Visitor ── */}
                    <div className={styles.modalSection}>
                        <h3 className={styles.modalSectionTitle}>
                            <FiUser size={13} /> Visitor Information
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
                                    <FiPhone size={10} /> Phone
                                </span>
                                <span className={styles.fieldValue}>{visitor.phone}</span>
                            </div>
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>
                                    <FiMail size={10} /> Email
                                </span>
                                <span className={styles.fieldValueLight}>{visitor.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Property ── */}
                    <div className={styles.modalSection}>
                        <h3 className={styles.modalSectionTitle}>
                            <FiHome size={13} /> Property
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
                                    REF: {listing.referenceCode} &nbsp;·&nbsp;{" "}
                                    {listing.type?.title} &nbsp;·&nbsp; {listing.purpose}
                                </span>
                            </div>
                        </div>

                        <div className={styles.modalGrid}>
                            {listing.price !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Price</span>
                                    <span className={styles.fieldValue}>
                                        {listing.price.toLocaleString()} QAR
                                        {listing.priceNegotiable && (
                                            <span style={{ fontWeight: 400, fontSize: 11, marginLeft: 6, color: "#0369a1" }}>
                                                (Negotiable)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                            {listing.status && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Listing Status</span>
                                    <span className={styles.fieldValue}>{listing.status}</span>
                                </div>
                            )}
                            {listing.bedrooms !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Bedrooms</span>
                                    <span className={styles.fieldValue}>{listing.bedrooms} Beds</span>
                                </div>
                            )}
                            {listing.bathrooms !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Bathrooms</span>
                                    <span className={styles.fieldValue}>{listing.bathrooms} Baths</span>
                                </div>
                            )}
                            {listing.area !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Area</span>
                                    <span className={styles.fieldValue}>{listing.area} sqm</span>
                                </div>
                            )}
                            {listing.furnishing?.title && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Furnishing</span>
                                    <span className={styles.fieldValue}>{listing.furnishing.title}</span>
                                </div>
                            )}
                            {listing.parkingSpaces !== undefined && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Parking Spaces</span>
                                    <span className={styles.fieldValue}>{listing.parkingSpaces}</span>
                                </div>
                            )}
                            {listing.yearBuilt && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Year Built</span>
                                    <span className={styles.fieldValue}>{listing.yearBuilt}</span>
                                </div>
                            )}
                            {fullAddress && (
                                <div className={styles.modalFieldFull}>
                                    <span className={styles.fieldLabel}>
                                        <FiMapPin size={10} /> Address
                                    </span>
                                    <span className={styles.fieldValueLight}>{fullAddress}</span>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                            <div>
                                <span className={styles.fieldLabel} style={{ display: "block", marginBottom: 8 }}>
                                    <FiStar size={10} /> Amenities
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
                                    <FiTag size={10} /> Nearby Facilities
                                </span>
                                <div className={styles.chipsRow}>
                                    {listing.nearbyTags.map((t) => (
                                        <span key={t.id} className={styles.chip}>{t.title}</span>
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
                                            <FiPhone size={10} /> Contact Phone
                                        </span>
                                        <span className={styles.fieldValue}>{listing.contactPhone}</span>
                                    </div>
                                )}
                                {listing.contactWhatsapp && (
                                    <div className={styles.modalField}>
                                        <span className={styles.fieldLabel}>
                                            <FiMessageSquare size={10} /> WhatsApp
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
                            <FiCalendar size={13} /> Visit Details
                        </h3>

                        <div className={styles.modalGrid}>
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>Status</span>
                                <StatusBadge status={status} />
                            </div>
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>Scheduled At</span>
                                <span className={styles.fieldValue}>
                                    {formatDate(scheduledAt)} at {formatTime(scheduledAt)}
                                </span>
                            </div>
                            {proposedAt && (
                                <div className={styles.modalField}>
                                    <span className={styles.fieldLabel}>Proposed At</span>
                                    <span className={styles.fieldValue}>
                                        {formatDate(proposedAt)} at {formatTime(proposedAt)}
                                    </span>
                                </div>
                            )}
                            <div className={styles.modalField}>
                                <span className={styles.fieldLabel}>Inquiry Submitted</span>
                                <span className={styles.fieldValue}>{formatDate(createdAt)}</span>
                            </div>
                        </div>

                        {notes && (
                            <div>
                                <span
                                    className={styles.fieldLabel}
                                    style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}
                                >
                                    <FiInfo size={10} /> Notes from Visitor
                                </span>
                                <div className={styles.notesBlock}>{notes}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button className={styles.closeModalBtn} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InquiriesSection() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Inquiry | null>(null);

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
            setError(e.response?.data?.message ?? "Failed to load inquiries.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = useCallback(() => setSelected(null), []);

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <span>Loading inquiries…</span>
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
                <p className={styles.emptyTitle}>No Inquiries Yet</p>
                <p className={styles.emptySubtitle}>
                    Visit requests from potential buyers/renters will appear here.
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
                            <th className={styles.th}>Visitor</th>
                            <th className={styles.th}>Property</th>
                            <th className={styles.th}>Scheduled</th>
                            <th className={styles.th}>Status</th>
                            <th className={styles.th}>Submitted</th>
                            <th className={styles.th}>Action</th>
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
                                            REF: {inq.listing.referenceCode}
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
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => setSelected(inq)}
                                    >
                                        <FiEye size={13} /> View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <InquiryDetailModal inquiry={selected} onClose={handleClose} />
            )}
        </div>
    );
}
