"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { FiX, FiFileText, FiCheckCircle, FiMail } from "react-icons/fi";
import { Badge } from "@/components/ui";
import { Invoice } from "@/types/invoice";
import styles from "./InvoiceDetailModal.module.css";

interface InvoiceDetailModalProps {
    invoice: Invoice | null;
    onClose: () => void;
}

export default function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
    const t = useTranslations("invoices");
    const locale = useLocale();

    useEffect(() => {
        if (!invoice) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [invoice, onClose]);

    if (!invoice) return null;

    const formatAmount = (amount: number) => `${amount.toLocaleString(locale)} ${invoice.currency}`;
    const formatDateTime = (iso: string | null) =>
        iso ? new Date(iso).toLocaleString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    return createPortal(
        <div
            className={styles.backdrop}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-modal-title"
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerTitleContainer}>
                        <div className={styles.iconBadge}>
                            <FiFileText size={18} />
                        </div>
                        <div>
                            <h2 id="invoice-modal-title" className={styles.title}>
                                {invoice.invoiceNumber}
                            </h2>
                            <p className={styles.subtitle}>{invoice.description}</p>
                        </div>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t("close")}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.statusRow}>
                        <Badge variant={invoice.status === "PAID" ? "success" : "info"}>
                            {t(`statusEnum.${invoice.status}`)}
                        </Badge>
                        <Badge variant="default">{t(`typeEnum.${invoice.type}`)}</Badge>
                        {invoice.emailedAt && (
                            <span className={styles.emailedNote}>
                                <FiMail size={12} /> {t("emailedOn", { date: formatDateTime(invoice.emailedAt) })}
                            </span>
                        )}
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>{t("billedTo")}</h3>
                        <div className={styles.billingGrid}>
                            <div>
                                <span className={styles.fieldLabel}>{t("fields.name")}</span>
                                <span className={styles.fieldValue}>{invoice.billedToName || "—"}</span>
                            </div>
                            <div>
                                <span className={styles.fieldLabel}>{t("fields.company")}</span>
                                <span className={styles.fieldValue}>{invoice.billedToCompany || "—"}</span>
                            </div>
                            <div>
                                <span className={styles.fieldLabel}>{t("fields.email")}</span>
                                <span className={styles.fieldValue}>{invoice.billedToEmail || "—"}</span>
                            </div>
                            <div>
                                <span className={styles.fieldLabel}>{t("fields.phone")}</span>
                                <span className={styles.fieldValue}>{invoice.billedToPhone || "—"}</span>
                            </div>
                            <div className={styles.billingGridWide}>
                                <span className={styles.fieldLabel}>{t("fields.address")}</span>
                                <span className={styles.fieldValue}>{invoice.billedToAddress || "—"}</span>
                            </div>
                            {invoice.billedToTradeNumber && (
                                <div>
                                    <span className={styles.fieldLabel}>{t("fields.tradeNumber")}</span>
                                    <span className={styles.fieldValue}>{invoice.billedToTradeNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>{t("lineItems")}</h3>
                        <div className={styles.lineItemsTableWrapper}>
                            <table className={styles.lineItemsTable}>
                                <thead>
                                    <tr>
                                        <th>{t("table.description")}</th>
                                        <th>{t("table.quantity")}</th>
                                        <th>{t("table.unitPrice")}</th>
                                        <th>{t("table.amount")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.lineItems.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.description}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatAmount(item.unitPrice)}</td>
                                            <td>{formatAmount(item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.totalsBlock}>
                            <div className={styles.totalsRow}>
                                <span>{t("table.subtotal")}</span>
                                <span>{formatAmount(invoice.subtotal)}</span>
                            </div>
                            {invoice.vatRate > 0 && (
                                <div className={styles.totalsRow}>
                                    <span>{t("table.vat", { rate: invoice.vatRate })}</span>
                                    <span>{formatAmount(invoice.vatAmount)}</span>
                                </div>
                            )}
                            <div className={`${styles.totalsRow} ${styles.totalsRowFinal}`}>
                                <span>{t("table.total")}</span>
                                <span>{formatAmount(invoice.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>{t("paymentInfo")}</h3>
                        <div className={styles.billingGrid}>
                            <div>
                                <span className={styles.fieldLabel}>{t("fields.paymentMethod")}</span>
                                <span className={styles.fieldValue}>{invoice.paymentMethod || "—"}</span>
                            </div>
                            <div>
                                <span className={styles.fieldLabel}>{t("fields.paidAt")}</span>
                                <span className={styles.fieldValue}>
                                    {invoice.paidAt ? (
                                        <span className={styles.paidValue}>
                                            <FiCheckCircle size={13} /> {formatDateTime(invoice.paidAt)}
                                        </span>
                                    ) : (
                                        "—"
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.closeFooterBtn} onClick={onClose}>
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
