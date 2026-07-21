import React from "react";
import { FiCheck } from "react-icons/fi";
import Button from "../ui/Button/Button";
import styles from "./SubmissionSuccess.module.css";
import Badge from "../ui/Badge/Badge";

interface Props {
    submissionId: string;
    onCheckStatus: () => void;
}

export default function SubmissionSuccess({ submissionId, onCheckStatus }: Props) {
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <FiCheck />
            </div>
            
            <h2 className={styles.title}>Application Submitted</h2>
            
            <div className={styles.reference}>
                <span>Reference Number</span>
                {submissionId}
            </div>

            <div style={{ marginBottom: "24px" }}>
                <Badge variant="success">SUBMITTED</Badge>
            </div>
            
            <p className={styles.message}>
                Our team will review your application. You will receive an email once your application has been reviewed.
            </p>
            
            <div className={styles.actions}>
                <Button size="lg" onClick={onCheckStatus}>
                    Check Status
                </Button>
            </div>
        </div>
    );
}
