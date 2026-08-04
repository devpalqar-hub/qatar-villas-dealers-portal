"use client";

import React from "react";
import {useTranslations} from "next-intl";
import { FiMessageSquare } from "react-icons/fi";
import styles from "./EmptyState.module.css";

export default function EmptyState() {
    const t = useTranslations("chat");
    return <div className={styles.container}><div className={styles.iconWrapper}><FiMessageSquare size={32} /></div><h3 className={styles.title}>{t("selectConversation")}</h3><p className={styles.subtitle}>{t("selectConversationSubtitle")}</p></div>;
}
