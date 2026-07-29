"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    FiFileText,
    FiArrowLeft,
    FiSend,
    FiAlertCircle,
    FiUploadCloud,
    FiX,
} from "react-icons/fi";
import {
    dealerOnboardingService,
    EditApplicationData,
    ApiDocument,
} from "@/services/dealerOnboarding.service";
import ActionRequiredBanner from "@/components/dealer-onboarding/ActionRequiredBanner";
import EditSidebar from "@/components/dealer-onboarding/EditSidebar";
import styles from "./page.module.css";

// ── Document list entry types ─────────────────────────────────────────────────
// An "existing" doc comes from the API (has an id and downloadUrl)
// A "new" doc is a fresh File the user just picked
interface ExistingDocEntry {
    kind: "existing";
    id: string;
    name: string;
    uploadedAt: string;
    downloadUrl: string;
}

interface NewDocEntry {
    kind: "new";
    file: File;
}

type DocEntry = ExistingDocEntry | NewDocEntry;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResubmitApplicationPage() {
    const routeParams = useParams();
    const token = (routeParams?.token as string) || "";
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [docError, setDocError] = useState<string | null>(null);

    const [editData, setEditData] = useState<EditApplicationData | null>(null);

    // ── Form State ─────────────────────────────────────────────────────────

    const [bizData, setBizData] = useState({
        tradeNumber: "",
        reraNumber: "",
        address: "",
        city: "Doha",
        country: "Qatar",
        website: "",
        description: "",
    });

    const [bizErrors, setBizErrors] = useState<Record<string, string>>({});

    // ── Document List ──────────────────────────────────────────────────────
    // Unified list of existing (from API) + newly added files
    const [docEntries, setDocEntries] = useState<DocEntry[]>([]);
    const docInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch Application Data ─────────────────────────────────────────────
    useEffect(() => {
        if (!token) return;
        let isMounted = true;
        setLoading(true);
        setFetchError(null);

        dealerOnboardingService
            .getEditApplication(token)
            .then((data) => {
                if (!isMounted) return;
                setEditData(data);

                // Populate Business Details
                setBizData({
                    tradeNumber: data.tradeNumber || "",
                    reraNumber: data.reraNumber || "",
                    address: data.address || "",
                    city: data.city || "Doha",
                    country: data.country || "Qatar",
                    website: data.website || "",
                    description: data.description || "",
                });

                // Populate existing documents from API
                if (data.documents && Array.isArray(data.documents)) {
                    const existing: ExistingDocEntry[] = data.documents.map(
                        (doc: ApiDocument) => ({
                            kind: "existing" as const,
                            id: doc.id,
                            name: doc.originalName,
                            uploadedAt: doc.uploadedAt,
                            downloadUrl: doc.downloadUrl,
                        })
                    );
                    setDocEntries(existing);
                }
            })
            .catch((err: any) => {
                if (!isMounted) return;
                const msg =
                    err.response?.data?.message ||
                    err.message ||
                    "Invalid or expired edit token. Please contact support.";
                setFetchError(msg);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [token]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleBizChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setBizData((prev) => ({ ...prev, [name]: value }));
        if (bizErrors[name]) setBizErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newEntries: NewDocEntry[] = Array.from(e.target.files).map((f) => ({
            kind: "new" as const,
            file: f,
        }));
        setDocEntries((prev) => [...prev, ...newEntries]);
        setDocError(null);
        e.target.value = "";
    };

    const handleRemoveDoc = (idx: number) => {
        setDocEntries((prev) => prev.filter((_, i) => i !== idx));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatUploadDate = (dateStr: string): string => {
        try {
            const d = new Date(dateStr);
            return `Uploaded ${d.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })}`;
        } catch {
            return dateStr;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setDocError(null);

        // Validate required business fields only
        const errs: Record<string, string> = {};
        if (!bizData.tradeNumber.trim()) errs.tradeNumber = "Trade License Number is required";
        if (!bizData.address.trim()) errs.address = "Registered Address is required";
        if (!bizData.city.trim()) errs.city = "City is required";
        if (!bizData.country.trim()) errs.country = "Country is required";

        if (Object.keys(errs).length > 0) {
            setBizErrors(errs);
            return;
        }

        // At least one document must exist
        if (docEntries.length === 0) {
            setDocError("Please upload at least one document before resubmitting.");
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();

            // Business details only (agency info is not editable)
            formData.append("tradeNumber", bizData.tradeNumber.trim());
            if (bizData.reraNumber.trim()) formData.append("reraNumber", bizData.reraNumber.trim());
            formData.append("address", bizData.address.trim());
            formData.append("city", bizData.city.trim());
            formData.append("country", bizData.country.trim());
            if (bizData.website.trim()) formData.append("website", bizData.website.trim());
            if (bizData.description.trim()) formData.append("description", bizData.description.trim());

            // New file uploads
            docEntries.forEach((entry) => {
                if (entry.kind === "new") {
                    formData.append("documents", entry.file);
                }
            });

            await dealerOnboardingService.resubmitApplication(token, formData);

            // Navigate to status page after success
            const sid = editData?.submissionId;
            router.push(sid ? `/dealer-onboarding/status?submissionId=${sid}` : "/dealer-onboarding/status");
        } catch (err: any) {
            setSubmitError(
                err.response?.data?.message ||
                err.message ||
                "Failed to resubmit application. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading Skeleton ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.contentWrapper}>
                    <div className={styles.skeletonCard}>
                        <div className={styles.skeletonLine} style={{ width: "40%", height: 28 }} />
                        <div className={styles.skeletonLine} style={{ width: "60%", height: 16 }} />
                        <div className={styles.skeletonLine} style={{ width: "100%", height: 120 }} />
                        <div className={styles.skeletonLine} style={{ width: "100%", height: 240 }} />
                    </div>
                </div>
            </div>
        );
    }

    // ── Error State ────────────────────────────────────────────────────────
    if (fetchError) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.contentWrapper}>
                    <div className={styles.errorCard}>
                        <FiAlertCircle size={48} style={{ color: "#ef4444" }} />
                        <h2 className={styles.errorTitle}>Application Link Invalid</h2>
                        <p className={styles.errorDesc}>{fetchError}</p>
                        <Link href="/dealer-onboarding" className={styles.backBtn} style={{ marginTop: 16 }}>
                            <FiArrowLeft /> Back to Dealer Onboarding
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Render ────────────────────────────────────────────────────────
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Top Action Required Banner */}
                <ActionRequiredBanner
                    title="Action Required"
                    description="Your application has been rejected. Please review the feedback below, update the required information, and resubmit your application."
                />

                {/* Page Title */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.title}>Edit Application</h1>
                    <p className={styles.subtitle}>
                        Please update the information below and resubmit your application.
                    </p>
                </div>

                {submitError && (
                    <div style={{ marginBottom: 20, padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#991b1b", fontSize: 14 }}>
                        {submitError}
                    </div>
                )}

                {/* 2-Column Layout */}
                <div className={styles.layoutGrid}>
                    {/* ── LEFT: Form ── */}
                    <div className={styles.formColumn}>
                        <form onSubmit={handleSubmit}>
                            {/* Section 1: Agency Information — read-only */}
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionHeading}>Agency Information</h2>
                                <p className={styles.sectionSubHeading}>
                                    This information cannot be changed. Contact support if you need to update it.
                                </p>
                                <div className={styles.grid2}>
                                    <div>
                                        <label className={styles.fieldLabel}>Agency Name</label>
                                        <div className={styles.readOnlyField}>
                                            {editData?.dealerName || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.fieldLabel}>Contact Person</label>
                                        <div className={styles.readOnlyField}>
                                            {editData?.contactName || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.fieldLabel}>Email</label>
                                        <div className={styles.readOnlyField}>
                                            {editData?.email || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.fieldLabel}>Phone Number</label>
                                        <div className={styles.readOnlyField}>
                                            {editData?.phone || "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Business Details */}
                            <div className={styles.sectionCard} style={{ marginTop: 24 }}>
                                <h2 className={styles.sectionHeading}>Business Details</h2>
                                <div className={styles.grid2}>
                                    <div>
                                        <label className={styles.fieldLabel}>
                                            Trade License Number <span className={styles.requiredStar}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="tradeNumber"
                                            className={`${styles.textInput} ${bizErrors.tradeNumber ? styles.textInputError : ""}`}
                                            style={{ paddingLeft: 14 }}
                                            value={bizData.tradeNumber}
                                            onChange={handleBizChange}
                                            placeholder="12345/2024"
                                            required
                                        />
                                        {bizErrors.tradeNumber && <span className={styles.errorText}>{bizErrors.tradeNumber}</span>}
                                    </div>

                                    <div>
                                        <label className={styles.fieldLabel}>RERA Number</label>
                                        <input
                                            type="text"
                                            name="reraNumber"
                                            className={styles.textInput}
                                            style={{ paddingLeft: 14 }}
                                            value={bizData.reraNumber}
                                            onChange={handleBizChange}
                                            placeholder="RERA-2024-67890"
                                        />
                                    </div>

                                    <div className={styles.fullWidth}>
                                        <label className={styles.fieldLabel}>
                                            Registered Address <span className={styles.requiredStar}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            className={`${styles.textInput} ${bizErrors.address ? styles.textInputError : ""}`}
                                            style={{ paddingLeft: 14 }}
                                            value={bizData.address}
                                            onChange={handleBizChange}
                                            placeholder="Office 12, Al Sadd Street"
                                            required
                                        />
                                        {bizErrors.address && <span className={styles.errorText}>{bizErrors.address}</span>}
                                    </div>
                                </div>

                                <div className={styles.grid3} style={{ marginTop: 20 }}>
                                    <div>
                                        <label className={styles.fieldLabel}>
                                            City <span className={styles.requiredStar}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            className={styles.textInput}
                                            style={{ paddingLeft: 14 }}
                                            value={bizData.city}
                                            onChange={handleBizChange}
                                            placeholder="Doha"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={styles.fieldLabel}>
                                            Country <span className={styles.requiredStar}>*</span>
                                        </label>
                                        <select
                                            name="country"
                                            className={styles.selectInput}
                                            value={bizData.country}
                                            onChange={handleBizChange}
                                            required
                                        >
                                            <option value="Qatar">Qatar</option>
                                            <option value="United Arab Emirates">United Arab Emirates</option>
                                            <option value="Saudi Arabia">Saudi Arabia</option>
                                            <option value="Kuwait">Kuwait</option>
                                            <option value="Bahrain">Bahrain</option>
                                            <option value="Oman">Oman</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={styles.fieldLabel}>Website</label>
                                        <input
                                            type="url"
                                            name="website"
                                            className={styles.textInput}
                                            style={{ paddingLeft: 14 }}
                                            value={bizData.website}
                                            onChange={handleBizChange}
                                            placeholder="https://pearlrealestate.qa"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <label className={styles.fieldLabel}>Business Description</label>
                                    <textarea
                                        name="description"
                                        className={styles.textarea}
                                        value={bizData.description}
                                        onChange={handleBizChange}
                                        maxLength={500}
                                        placeholder="Luxury real estate agency specializing in premium properties."
                                    />
                                    <div className={styles.charCount}>{bizData.description.length} / 500</div>
                                </div>
                            </div>

                            {/* Section 3: Documents — Unified upload zone */}
                            <div className={styles.sectionCard} style={{ marginTop: 24 }}>
                                <h2 className={styles.sectionHeading}>
                                    Documents <span className={styles.requiredStar}>*</span>
                                </h2>
                                <p className={styles.sectionSubHeading}>
                                    Review your existing documents below. You can remove any document and add new ones. At least one document is required.
                                </p>

                                {/* Upload drop zone */}
                                <div
                                    className={styles.fileUploadArea}
                                    onClick={() => docInputRef.current?.click()}
                                    style={docError ? { borderColor: "#dc2626" } : undefined}
                                >
                                    <FiUploadCloud className={styles.uploadIcon} />
                                    <span className={styles.uploadText}>Click to add more documents</span>
                                    <span className={styles.uploadHint}>PDF, PNG, JPG — select multiple files</span>
                                    <input
                                        ref={docInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        style={{ display: "none" }}
                                        onChange={handleDocFileChange}
                                    />
                                </div>

                                {docError && (
                                    <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>
                                        {docError}
                                    </p>
                                )}

                                {/* Document list: existing + new */}
                                {docEntries.length > 0 && (
                                    <div className={styles.existingFileList}>
                                        {docEntries.map((entry, idx) => (
                                            <div key={idx} className={styles.existingFileItem}>
                                                <FiFileText className={styles.existingFileIcon} />
                                                <div className={styles.existingFileMeta}>
                                                    <span className={styles.existingFileName}>
                                                        {entry.kind === "existing" ? entry.name : entry.file.name}
                                                    </span>
                                                    <span className={styles.existingFileDate}>
                                                        {entry.kind === "existing"
                                                            ? formatUploadDate(entry.uploadedAt)
                                                            : `${formatFileSize(entry.file.size)} — new`}
                                                    </span>
                                                </div>
                                                {entry.kind === "new" && (
                                                    <span className={styles.newFileBadge}>New</span>
                                                )}
                                                <button
                                                    type="button"
                                                    className={styles.removeFileBtn}
                                                    onClick={() => handleRemoveDoc(idx)}
                                                    aria-label="Remove document"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className={styles.footerNav} style={{ marginTop: 28 }}>
                                <button
                                    type="button"
                                    className={styles.backBtn}
                                    onClick={() => router.back()}
                                >
                                    <FiArrowLeft /> Back
                                </button>

                                <button
                                    type="submit"
                                    className={styles.resubmitBtn}
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : <><FiSend /> Save Changes &amp; Resubmit</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── RIGHT: Sidebar ── */}
                    <div className={styles.sidebarColumn}>
                        <EditSidebar
                            latestRejectionMessage={editData?.latestRejectionMessage}
                            reviews={editData?.reviews}
                            submittedAt={editData?.createdAt}
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className={styles.siteFooter}>
                    <span>© 2026 Villas Qatar. All rights reserved.</span> |{" "}
                    <a href="#">Terms of Service</a> | <a href="#">Privacy Policy</a> |{" "}
                    <a href="#">Contact Us</a>
                </footer>
            </div>
        </div>
    );
}
