"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
    FiSearch,
    FiFileText,
    FiCheckCircle,
    FiGift,
    FiChevronLeft,
    FiChevronRight,
    FiRotateCcw,
    FiEye,
    FiAlertTriangle,
} from "react-icons/fi";
import { AppLayout, Badge, Button } from "@/components/ui";
import InvoiceDetailModal from "@/components/invoices/InvoiceDetailModal";
import { invoiceService } from "@/services/invoice.service";
import { staffService, StaffMember } from "@/services/staff.service";
import { Invoice, InvoiceListMeta, InvoiceStatus, InvoiceType } from "@/types/invoice";
import styles from "./page.module.css";

const INVOICE_TYPES: InvoiceType[] = ["LISTING_PAYMENT", "FEATURED_LISTING", "DEALER_SUBSCRIPTION"];
const INVOICE_STATUSES: InvoiceStatus[] = ["PAID", "FREE"];
const PAGE_LIMIT = 20;

export default function InvoicesPage() {
    const t = useTranslations("invoices");
    const locale = useLocale();

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [meta, setMeta] = useState<InvoiceListMeta>({ total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<InvoiceType | "">("");
    const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | "">("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [page, setPage] = useState(1);

    const [staffOptions, setStaffOptions] = useState<StaffMember[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await staffService.getStaff(1, 100);
                setStaffOptions(res.data || []);
            } catch {
                // Staff filter options are a progressive enhancement only; ignore failures.
            }
        })();
    }, []);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await invoiceService.getInvoices({
                page,
                limit: PAGE_LIMIT,
                type: selectedType || undefined,
                status: selectedStatus || undefined,
                search: searchQuery.trim() || undefined,
                from: fromDate || undefined,
                to: toDate || undefined,
                userId: selectedUserId || undefined,
            });
            setInvoices(res.data || []);
            if (res.meta) setMeta(res.meta);
        } catch {
            setError(t("loadError"));
        } finally {
            setLoading(false);
        }
    }, [page, selectedType, selectedStatus, searchQuery, fromDate, toDate, selectedUserId, t]);

    useEffect(() => {
        void fetchInvoices();
    }, [fetchInvoices]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedType("");
        setSelectedStatus("");
        setSelectedUserId("");
        setFromDate("");
        setToDate("");
        setPage(1);
    };

    const hasActiveFilters = !!(searchQuery || selectedType || selectedStatus || selectedUserId || fromDate || toDate);

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    const formatAmount = (invoice: Invoice) => `${invoice.totalAmount.toLocaleString(locale)} ${invoice.currency}`;

    const paidOnPage = invoices.filter((inv) => inv.status === "PAID").length;
    const freeOnPage = invoices.filter((inv) => inv.status === "FREE").length;

    const startItem = meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
    const endItem = Math.min(meta.page * meta.limit, meta.total);

    return (
        <AppLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t("title")}</h1>
                        <p className={styles.subtitle}>{t("subtitle")}</p>
                    </div>
                </div>

                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryIcon} ${styles.summaryIconTotal}`}>
                            <FiFileText size={18} />
                        </div>
                        <div>
                            <span className={styles.summaryValue}>{meta.total}</span>
                            <span className={styles.summaryLabel}>{t("summary.total")}</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryIcon} ${styles.summaryIconPaid}`}>
                            <FiCheckCircle size={18} />
                        </div>
                        <div>
                            <span className={styles.summaryValue}>{paidOnPage}</span>
                            <span className={styles.summaryLabel}>{t("summary.paidThisPage")}</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryIcon} ${styles.summaryIconFree}`}>
                            <FiGift size={18} />
                        </div>
                        <div>
                            <span className={styles.summaryValue}>{freeOnPage}</span>
                            <span className={styles.summaryLabel}>{t("summary.freeThisPage")}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.filtersCard}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={t("searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>{t("filters.type")}</label>
                        <select
                            className={styles.selectInput}
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value as InvoiceType | "");
                                setPage(1);
                            }}
                        >
                            <option value="">{t("filters.allTypes")}</option>
                            {INVOICE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {t(`typeEnum.${type}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>{t("filters.status")}</label>
                        <select
                            className={styles.selectInput}
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value as InvoiceStatus | "");
                                setPage(1);
                            }}
                        >
                            <option value="">{t("filters.allStatuses")}</option>
                            {INVOICE_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {t(`statusEnum.${status}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {staffOptions.length > 0 && (
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t("filters.staff")}</label>
                            <select
                                className={styles.selectInput}
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">{t("filters.allStaff")}</option>
                                {staffOptions.map((member) => (
                                    <option key={member.staffUserId} value={member.staffUserId}>
                                        {member.staffUser?.name || member.position}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>{t("filters.dateRange")}</label>
                        <div className={styles.dateRangeGroup}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={fromDate}
                                max={toDate || undefined}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <span className={styles.dateSeparator}>&rarr;</span>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={toDate}
                                min={fromDate || undefined}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button type="button" className={styles.resetBtn} onClick={resetFilters}>
                            <FiRotateCcw size={13} /> {t("filters.reset")}
                        </button>
                    )}
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t("table.invoice")}</th>
                                    <th className={styles.th}>{t("table.type")}</th>
                                    <th className={styles.th}>{t("table.billedTo")}</th>
                                    <th className={styles.th}>{t("table.amount")}</th>
                                    <th className={styles.th}>{t("table.status")}</th>
                                    <th className={styles.th}>{t("table.date")}</th>
                                    <th className={styles.th} style={{ textAlign: "right" }}>
                                        {t("table.actions")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={`skeleton-${i}`}>
                                            {Array.from({ length: 7 }).map((__, j) => (
                                                <td className={styles.td} key={j}>
                                                    <div className={styles.skeletonBlock} style={{ width: 90, height: 14 }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyState}>
                                            <div className={styles.emptyStateIcon}>
                                                <FiAlertTriangle />
                                            </div>
                                            <div className={styles.emptyStateTitle}>{error}</div>
                                            <Button variant="secondary" onClick={fetchInvoices}>
                                                {t("retry")}
                                            </Button>
                                        </td>
                                    </tr>
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyState}>
                                            <div className={styles.emptyStateIcon}>
                                                <FiFileText />
                                            </div>
                                            {hasActiveFilters ? (
                                                <>
                                                    <div className={styles.emptyStateTitle}>{t("empty.noMatchTitle")}</div>
                                                    <div className={styles.emptyStateSubtext}>{t("empty.noMatchBody")}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={styles.emptyStateTitle}>{t("empty.noInvoicesTitle")}</div>
                                                    <div className={styles.emptyStateSubtext}>{t("empty.noInvoicesBody")}</div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => (
                                        <tr key={invoice.id} className={styles.tr} onClick={() => setSelectedInvoice(invoice)}>
                                            <td className={styles.td}>
                                                <div className={styles.invoiceNumber}>{invoice.invoiceNumber}</div>
                                                <div className={styles.invoiceDescription}>{invoice.description}</div>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.typeBadge}>{t(`typeEnum.${invoice.type}`)}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.billedName}>{invoice.billedToName}</div>
                                                <div className={styles.billedEmail}>{invoice.billedToEmail}</div>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.amount}>{formatAmount(invoice)}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <Badge variant={invoice.status === "PAID" ? "success" : "info"}>
                                                    {t(`statusEnum.${invoice.status}`)}
                                                </Badge>
                                            </td>
                                            <td className={styles.td}>{formatDate(invoice.createdAt)}</td>
                                            <td className={styles.td} style={{ textAlign: "right" }}>
                                                <button
                                                    type="button"
                                                    className={styles.viewBtn}
                                                    title={t("viewInvoice")}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedInvoice(invoice);
                                                    }}
                                                >
                                                    <FiEye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && !error && invoices.length > 0 && (
                        <div className={styles.pagination}>
                            <div className={styles.pageInfo}>
                                {t("pageInfo", { start: startItem, end: endItem, total: meta.total })}
                            </div>
                            <div className={styles.pageControls}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    aria-label={t("previous")}
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
                                    aria-label={t("next")}
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
        </AppLayout>
    );
}
