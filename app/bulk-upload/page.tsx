"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    FiDownload,
    FiChevronDown,
    FiChevronUp,
    FiX,
    FiArrowRight,
    FiTrash2,
    FiAlertTriangle,
    FiCheckCircle,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiInbox,
} from "react-icons/fi";
import { AppLayout, Button, Badge, ConfirmModal } from "@/components/ui";
import UploadDropzone from "@/components/bulk-upload/UploadDropzone";
import { bulkUploadService } from "@/services/bulkUpload.service";
import { propertyService, PropertyOptionsResponse } from "@/services/property.service";
import {
    BulkUploadResponse,
    DraftStatus,
    DraftListMeta,
    PropertyDraft,
    KnownBatch,
} from "@/types/bulkUpload";
import styles from "./page.module.css";

const STATUS_FILTERS: (DraftStatus | "")[] = ["", "PENDING", "USED", "DISCARDED"];
const STEP_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;
const PAGE_LIMIT = 20;

export default function BulkUploadPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("bulkUpload");
    const tHow = useTranslations("bulkUpload.howItWorks");
    const tUpload = useTranslations("bulkUpload.upload");
    const tResult = useTranslations("bulkUpload.result");
    const tDrafts = useTranslations("bulkUpload.drafts");
    const tStatus = useTranslations("bulkUpload.statusEnum");
    const tPurpose = useTranslations("purposeEnum");
    const tPagination = useTranslations("pagination");

    // How it works
    const [notesExpanded, setNotesExpanded] = useState(false);

    // Reference options (type / municipality labels for the drafts table)
    const [options, setOptions] = useState<PropertyOptionsResponse | null>(null);

    // Upload
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(null);

    // Drafts list
    const [drafts, setDrafts] = useState<PropertyDraft[]>([]);
    const [meta, setMeta] = useState<DraftListMeta>({ total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 });
    const [draftsLoading, setDraftsLoading] = useState(true);
    const [draftsError, setDraftsError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<DraftStatus | "">("");
    const [batchFilter, setBatchFilter] = useState<string>("");
    const [page, setPage] = useState(1);
    const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);

    // Known batches (client-derived labels)
    const [knownBatches, setKnownBatches] = useState<Record<string, KnownBatch>>({});

    // Discard flow
    const [draftToDiscard, setDraftToDiscard] = useState<PropertyDraft | null>(null);
    const [discarding, setDiscarding] = useState(false);
    const [discardError, setDiscardError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await propertyService.getPropertyOptions();
                setOptions(res);
            } catch {
                // Type/municipality labels are a display enhancement only; ignore failures.
            }
        })();
    }, []);

    const registerBatches = useCallback((list: PropertyDraft[]) => {
        setKnownBatches((prev) => {
            const next = { ...prev };
            list.forEach((draft) => {
                const existing = next[draft.batchId];
                const existingCount = existing?.count || 0;
                next[draft.batchId] = {
                    batchId: draft.batchId,
                    source: draft.source,
                    createdAt: existing && existing.createdAt < draft.createdAt ? existing.createdAt : draft.createdAt,
                    count: Math.max(existingCount, 1),
                };
            });
            return next;
        });
    }, []);

    const fetchDrafts = useCallback(
        async (targetPage: number, status: DraftStatus | "", batchId: string) => {
            setDraftsLoading(true);
            setDraftsError(null);
            try {
                const res = await bulkUploadService.getDrafts({
                    page: targetPage,
                    limit: PAGE_LIMIT,
                    status: status || undefined,
                    batchId: batchId || undefined,
                });
                setDrafts(res.data || []);
                if (res.meta) setMeta(res.meta);
                registerBatches(res.data || []);
            } catch {
                setDraftsError(tDrafts("loadError"));
            } finally {
                setDraftsLoading(false);
            }
        },
        [registerBatches, tDrafts]
    );

    useEffect(() => {
        void fetchDrafts(page, statusFilter, batchFilter);
    }, [page, statusFilter, batchFilter, fetchDrafts]);

    const resolveUploadErrorMessage = (err: unknown): string => {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; request?: unknown };
        if (axiosErr?.response?.status === 401) return tUpload("errors.unauthorized");
        if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
        if (axiosErr?.request && !axiosErr?.response) return tUpload("errors.networkError");
        return tUpload("errors.genericError");
    };

    const handleFileSelected = async (file: File) => {
        setUploading(true);
        setUploadError(null);
        try {
            const res = await bulkUploadService.bulkUpload(file);
            if (!res || !Array.isArray(res.drafts)) {
                setUploadError(tUpload("errors.emptyResponse"));
                return;
            }
            setUploadResult(res);
            setKnownBatches((prev) => ({
                ...prev,
                [res.batchId]: {
                    batchId: res.batchId,
                    source: res.source,
                    createdAt: new Date().toISOString(),
                    count: res.totalRows,
                },
            }));
            setStatusFilter("");
            setBatchFilter("");
            setPage(1);
            await fetchDrafts(1, "", "");
        } catch (err) {
            setUploadError(resolveUploadErrorMessage(err));
        } finally {
            setUploading(false);
        }
    };

    const handleOpenDraft = (draft: PropertyDraft) => {
        router.push(`/properties/create?draftId=${draft.id}`);
    };

    const handleDiscardClick = (draft: PropertyDraft) => {
        setDiscardError(null);
        setDraftToDiscard(draft);
    };

    const handleConfirmDiscard = async () => {
        if (!draftToDiscard) return;
        setDiscarding(true);
        setDiscardError(null);
        try {
            await bulkUploadService.discardDraft(draftToDiscard.id);
            setDrafts((prev) => prev.filter((d) => d.id !== draftToDiscard.id));
            setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            setDraftToDiscard(null);
        } catch {
            setDiscardError(t("discardModal.errorToast"));
        } finally {
            setDiscarding(false);
        }
    };

    const typeLabel = (typeId?: string) => options?.listingTypes?.find((o) => o.id === typeId)?.title;
    const municipalityLabel = (municipalityId?: string) =>
        options?.municipalities?.find((o) => o.id === municipalityId)?.name;

    const batchOptions = useMemo(
        () =>
            Object.values(knownBatches).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
        [knownBatches]
    );

    const formatBatchDate = (iso: string) =>
        new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });

    const startItem = meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
    const endItem = Math.min(meta.page * meta.limit, meta.total);

    const invalidResultDrafts = uploadResult?.drafts.filter((d) => !d.isValid) || [];

    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t("title")}</h1>
                        <p className={styles.subtitle}>{t("subtitle")}</p>
                    </div>
                    <Button
                        leftIcon={<FiDownload size={16} />}
                        onClick={() => {
                            const link = document.createElement("a");
                            link.href = "/templates/bulk-upload-sample-template.xlsx";
                            link.download = "bulk-upload-sample-template.xlsx";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    >
                        {t("downloadTemplate")}
                    </Button>
                </div>

                {/* How it works */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2 className={styles.sectionTitle}>{tHow("title")}</h2>
                            <p className={styles.sectionSubtitle}>{tHow("subtitle")}</p>
                        </div>
                    </div>

                    <div className={styles.stepsGrid}>
                        {STEP_KEYS.map((num) => (
                            <div key={num} className={styles.stepItem}>
                                <span className={styles.stepNumber}>{num}</span>
                                <div>
                                    <p className={styles.stepTitle}>{tHow(`step${num}Title`)}</p>
                                    <p className={styles.stepDesc}>{tHow(`step${num}Desc`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className={styles.notesToggle}
                        onClick={() => setNotesExpanded((v) => !v)}
                        aria-expanded={notesExpanded}
                    >
                        {notesExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                        {notesExpanded ? tHow("toggleHide") : tHow("toggleShow")}
                    </button>

                    {notesExpanded && (
                        <ul className={styles.notesList}>
                            <li>{tHow("fieldRow")}</li>
                            <li>{tHow("fieldColumns")}</li>
                            <li>{tHow("fieldAmenities")}</li>
                            <li>{tHow("fieldPhotos")}</li>
                            <li>{tHow("fieldExtraProperties")}</li>
                            <li>{tHow("fieldErrors")}</li>
                        </ul>
                    )}
                </div>

                {/* Upload */}
                <div className={styles.sectionCard}>
                    <div className={styles.uploadTopRow}>
                        <div>
                            <h2 className={styles.sectionTitle}>{tUpload("title")}</h2>
                        </div>
                    </div>

                    <UploadDropzone onFileSelected={handleFileSelected} uploading={uploading} />

                    {uploadError && (
                        <div className={styles.uploadErrorBanner}>
                            <FiAlertTriangle size={16} />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </div>

                {/* Upload result */}
                {uploadResult && (
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h2 className={styles.sectionTitle}>{tResult("title")}</h2>
                                <p className={styles.sectionSubtitle}>
                                    {tResult("subtitle", { batchId: uploadResult.batchId })}
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles.dismissBtn}
                                onClick={() => setUploadResult(null)}
                            >
                                <FiX size={14} /> {tResult("dismiss")}
                            </button>
                        </div>

                        <div className={styles.resultStats}>
                            <div className={`${styles.statCard} ${styles.statTotal}`}>
                                <span className={styles.statLabel}>{tResult("totalRows")}</span>
                                <span className={styles.statValue}>{uploadResult.totalRows}</span>
                            </div>
                            <div className={`${styles.statCard} ${styles.statValid}`}>
                                <span className={styles.statLabel}>{tResult("validRows")}</span>
                                <span className={styles.statValue}>{uploadResult.validRows}</span>
                            </div>
                            <div className={`${styles.statCard} ${styles.statInvalid}`}>
                                <span className={styles.statLabel}>{tResult("invalidRows")}</span>
                                <span className={styles.statValue}>{uploadResult.invalidRows}</span>
                            </div>
                        </div>

                        {invalidResultDrafts.length > 0 && (
                            <div className={styles.invalidRowsList}>
                                {invalidResultDrafts.map((row) => (
                                    <div key={row.id} className={styles.invalidRowCard}>
                                        <div className={styles.invalidRowHeader}>
                                            <div>
                                                <div className={styles.invalidRowLabel}>
                                                    {tResult("rowLabel", { number: row.rowNumber })}
                                                </div>
                                                <div className={styles.invalidRowName}>
                                                    {row.data.propertyName || tResult("untitledRow")}
                                                </div>
                                            </div>
                                            <Badge variant="warning">
                                                {tResult("needsAttention")} · {tResult("issueCount", { count: row.errors.length })}
                                            </Badge>
                                        </div>
                                        <ul className={styles.invalidRowErrors}>
                                            {row.errors.map((error, i) => (
                                                <li key={i}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Draft properties */}
                <div>
                    <div className={styles.header}>
                        <div>
                            <h2 className={styles.sectionTitle}>{tDrafts("title")}</h2>
                            <p className={styles.sectionSubtitle}>{tDrafts("subtitle")}</p>
                        </div>
                    </div>

                    <div className={styles.filtersRow} style={{ marginTop: 16, marginBottom: 16 }}>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{tDrafts("statusLabel")}</label>
                            <select
                                className={styles.filterSelect}
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as DraftStatus | "");
                                    setPage(1);
                                }}
                            >
                                {STATUS_FILTERS.map((s) => (
                                    <option key={s || "all"} value={s}>
                                        {s ? tStatus(s) : tDrafts("statusAll")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{tDrafts("batchLabel")}</label>
                            <select
                                className={styles.filterSelect}
                                value={batchFilter}
                                onChange={(e) => {
                                    setBatchFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">{tDrafts("batchAll")}</option>
                                {batchOptions.map((b) => (
                                    <option key={b.batchId} value={b.batchId}>
                                        {tDrafts("batchOption", {
                                            source: b.source,
                                            date: formatBatchDate(b.createdAt),
                                            count: b.count,
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            variant="secondary"
                            className={styles.refreshBtn}
                            leftIcon={<FiRefreshCw size={14} />}
                            onClick={() => fetchDrafts(page, statusFilter, batchFilter)}
                            disabled={draftsLoading}
                        >
                            {tDrafts("refresh")}
                        </Button>
                    </div>

                    <div className={styles.tableContainer}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>{tDrafts("table.row")}</th>
                                        <th className={styles.th}>{tDrafts("table.property")}</th>
                                        <th className={styles.th}>{tDrafts("table.type")}</th>
                                        <th className={styles.th}>{tDrafts("table.purpose")}</th>
                                        <th className={styles.th}>{tDrafts("table.price")}</th>
                                        <th className={styles.th}>{tDrafts("table.location")}</th>
                                        <th className={styles.th}>{tDrafts("table.status")}</th>
                                        <th className={styles.th}>{tDrafts("table.validation")}</th>
                                        <th className={styles.th} style={{ textAlign: "right" }}>
                                            {tDrafts("table.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {draftsLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={`skeleton-${i}`}>
                                                {Array.from({ length: 9 }).map((__, j) => (
                                                    <td className={styles.td} key={j}>
                                                        <div className={styles.skeletonBlock} style={{ width: 80, height: 14 }} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : draftsError ? (
                                        <tr>
                                            <td colSpan={9} className={styles.emptyState}>
                                                <div className={styles.emptyStateIcon}>
                                                    <FiAlertTriangle />
                                                </div>
                                                <div className={styles.emptyStateTitle}>{draftsError}</div>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => fetchDrafts(page, statusFilter, batchFilter)}
                                                >
                                                    {tDrafts("refresh")}
                                                </Button>
                                            </td>
                                        </tr>
                                    ) : drafts.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className={styles.emptyState}>
                                                <div className={styles.emptyStateIcon}>
                                                    <FiInbox />
                                                </div>
                                                {statusFilter || batchFilter ? (
                                                    <>
                                                        <div className={styles.emptyStateTitle}>
                                                            {tDrafts("empty.noMatchTitle")}
                                                        </div>
                                                        <div className={styles.emptyStateSubtext}>
                                                            {tDrafts("empty.noMatchBody")}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={styles.emptyStateTitle}>
                                                            {tDrafts("empty.noDraftsTitle")}
                                                        </div>
                                                        <div className={styles.emptyStateSubtext}>
                                                            {tDrafts("empty.noDraftsBody")}
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        drafts.map((draft) => {
                                            const isExpanded = expandedDraftId === draft.id;
                                            const hasErrors = draft.errors && draft.errors.length > 0;
                                            const statusVariant =
                                                draft.status === "USED" ? "success" : draft.status === "DISCARDED" ? "danger" : "warning";

                                            return (
                                                <React.Fragment key={draft.id}>
                                                    <tr className={styles.tr}>
                                                        <td className={styles.td}>
                                                            <span className={styles.rowNumberBadge}>#{draft.rowNumber}</span>
                                                        </td>
                                                        <td className={styles.td}>
                                                            <div className={styles.propName}>
                                                                {draft.data?.propertyName || tDrafts("untitled")}
                                                            </div>
                                                        </td>
                                                        <td className={styles.td}>
                                                            {draft.data?.typeId ? (
                                                                <span className={styles.typeBadge}>
                                                                    {typeLabel(draft.data.typeId) || "—"}
                                                                </span>
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>
                                                        <td className={styles.td}>
                                                            {draft.data?.purpose ? tPurpose(draft.data.purpose) : "—"}
                                                        </td>
                                                        <td className={styles.td}>
                                                            {typeof draft.data?.price === "number" ? (
                                                                <span className={styles.price}>
                                                                    {draft.data.price.toLocaleString()} QAR
                                                                </span>
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>
                                                        <td className={styles.td}>
                                                            <div className={styles.propName}>{draft.data?.areaName || "—"}</div>
                                                            {draft.data?.municipalityId && (
                                                                <div className={styles.propLocation}>
                                                                    {municipalityLabel(draft.data.municipalityId)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className={styles.td}>
                                                            <Badge variant={statusVariant}>{tStatus(draft.status)}</Badge>
                                                        </td>
                                                        <td className={styles.td}>
                                                            {hasErrors ? (
                                                                <button
                                                                    type="button"
                                                                    className={styles.validationBtn}
                                                                    onClick={() => setExpandedDraftId(isExpanded ? null : draft.id)}
                                                                >
                                                                    <Badge variant="warning">
                                                                        {tDrafts("invalidIndicator", { count: draft.errors.length })}
                                                                    </Badge>
                                                                    {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                                                </button>
                                                            ) : (
                                                                <Badge variant="success">
                                                                    <FiCheckCircle size={12} style={{ marginRight: 4 }} />
                                                                    {tDrafts("validIndicator")}
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className={styles.td} style={{ textAlign: "right" }}>
                                                            <div className={styles.actionsCell}>
                                                                <button
                                                                    className={`${styles.actionBtn} ${styles.openActionBtn}`}
                                                                    title={tDrafts("openDraft")}
                                                                    onClick={() => handleOpenDraft(draft)}
                                                                    disabled={draft.status === "DISCARDED"}
                                                                >
                                                                    <FiArrowRight size={16} />
                                                                </button>
                                                                <button
                                                                    className={`${styles.actionBtn} ${styles.dangerActionBtn}`}
                                                                    title={tDrafts("discardDraft")}
                                                                    onClick={() => handleDiscardClick(draft)}
                                                                    disabled={draft.status === "DISCARDED"}
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && hasErrors && (
                                                        <tr className={styles.validationErrorsRow}>
                                                            <td className={styles.td} colSpan={9}>
                                                                <ul className={styles.validationErrorsList}>
                                                                    {draft.errors.map((error, i) => (
                                                                        <li key={i}>{error}</li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {!draftsLoading && !draftsError && drafts.length > 0 && (
                            <div className={styles.pagination}>
                                <div className={styles.pageInfo}>
                                    {tDrafts("pageInfo", { start: startItem, end: endItem, total: meta.total })}
                                </div>
                                <div className={styles.pageControls}>
                                    <button
                                        className={styles.pageBtn}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        aria-label={tPagination("previous")}
                                    >
                                        <FiChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            className={`${styles.pageBtn} ${pageNum === page ? styles.active : ""}`}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                    <button
                                        className={styles.pageBtn}
                                        onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
                                        disabled={page >= (meta.totalPages || 1)}
                                        aria-label={tPagination("next")}
                                    >
                                        <FiChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={!!draftToDiscard}
                title={t("discardModal.title")}
                description={
                    discardError
                        ? discardError
                        : t("discardModal.description", {
                              name: draftToDiscard?.data?.propertyName || tDrafts("untitled"),
                          })
                }
                confirmLabel={discarding ? t("discardModal.discarding") : t("discardModal.confirm")}
                cancelLabel={t("discardModal.cancel")}
                intent="danger"
                onConfirm={handleConfirmDiscard}
                onCancel={() => {
                    if (!discarding) setDraftToDiscard(null);
                }}
            />
        </AppLayout>
    );
}
