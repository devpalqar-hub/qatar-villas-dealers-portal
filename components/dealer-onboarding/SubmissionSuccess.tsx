import React from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslations } from "next-intl";
import Button from "../ui/Button/Button";
import styles from "./SubmissionSuccess.module.css";
import Badge from "../ui/Badge/Badge";

interface Props {
    submissionId: string;
    onCheckStatus: () => void;
}

export default function SubmissionSuccess({ submissionId, onCheckStatus }: Props) {
    const t = useTranslations("onboarding.success");
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <FiCheck />
            </div>

            <h2 className={styles.title}>{t("title")}</h2>

            <div className={styles.reference}>
                <span>{t("referenceNumber")}</span>
                {submissionId}
            </div>

            <div style={{ marginBottom: "24px" }}>
                <Badge variant="success">{t("submittedBadge")}</Badge>
            </div>

            <p className={styles.message}>
                {t("message")}
            </p>

            <div className={styles.actions}>
                <Button size="lg" onClick={onCheckStatus}>
                    {t("checkStatus")}
                </Button>
            </div>
        </div>
    );
}