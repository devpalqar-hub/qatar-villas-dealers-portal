"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiCheckCircle, FiHome, FiList, FiCreditCard } from "react-icons/fi";
import styles from "../page.module.css";

function PaymentSuccessContent() {
    const t = useTranslations("payments.success");
    const searchParams = useSearchParams();
    const listingId = searchParams.get("listingId");

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={`${styles.iconBadge} ${styles.iconBadgeSuccess}`}>
                    <FiCheckCircle size={40} />
                </div>
                <h1 className={styles.title}>{t("title")}</h1>
                <p className={styles.subtitle}>{listingId ? t("listingSubtitle") : t("subscriptionSubtitle")}</p>

                <div className={styles.actions}>
                    {listingId ? (
                        <>
                            <Link href={`/properties/${listingId}`} className={styles.primaryBtn}>
                                <FiHome size={16} /> {t("viewProperty")}
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

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={null}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
