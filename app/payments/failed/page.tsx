"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiXCircle, FiRefreshCw, FiList, FiCreditCard } from "react-icons/fi";
import styles from "../page.module.css";

function PaymentFailedContent() {
    const t = useTranslations("payments.failed");
    const searchParams = useSearchParams();
    const listingId = searchParams.get("listingId");

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={`${styles.iconBadge} ${styles.iconBadgeError}`}>
                    <FiXCircle size={40} />
                </div>
                <h1 className={styles.title}>{t("title")}</h1>
                <p className={styles.subtitle}>{t("subtitle")}</p>

                <div className={styles.actions}>
                    {listingId ? (
                        <>
                            <Link href={`/properties/${listingId}`} className={styles.primaryBtn}>
                                <FiRefreshCw size={16} /> {t("tryAgain")}
                            </Link>
                            <Link href="/properties" className={styles.secondaryBtn}>
                                <FiList size={16} /> {t("goToProperties")}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/subscription" className={styles.primaryBtn}>
                                <FiCreditCard size={16} /> {t("viewSubscription")}
                            </Link>
                            <Link href="/properties" className={styles.secondaryBtn}>
                                <FiList size={16} /> {t("goToProperties")}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={null}>
            <PaymentFailedContent />
        </Suspense>
    );
}
