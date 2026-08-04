"use client";

import React, {useState} from "react";
import Image from "next/image";
import {RiEyeLine, RiEyeOffLine, RiLockPasswordLine, RiMailLine, RiAlertLine, RiArrowRightLine} from "react-icons/ri";
import {useLocale, useTranslations} from "next-intl";
import {Input} from "@/components/ui";
import {authService} from "@/services/auth.service";
import styles from "./page.module.css";

export default function LoginPage() {
    const t = useTranslations("login");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!identifier.trim()) {
            setError(t("errors.emailRequired"));
            return;
        }
        if (!password) {
            setError(t("errors.passwordRequired"));
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login({identifier, password});
            const {access_token} = response;
            if (!access_token) {
                throw new Error(t("errors.missingToken"));
            }

            document.cookie = `auth_token=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
            localStorage.setItem("auth_token", access_token);
            window.location.href = `/${locale}`;
        } catch (err: unknown) {
            const serviceError = err as {response?: {data?: {message?: string}}, message?: string};
            const message = serviceError?.response?.data?.message || serviceError?.message || t("errors.invalidCredentials");
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <aside className={styles.imagePanel}>
                <Image
                    src="/login-bg.jpeg"
                    alt={tCommon("appName")}
                    fill
                    priority
                    className={styles.bgImage}
                />
                <div className={styles.overlay} />

                <h1 className={styles.brandTitle}>
                    {tCommon("appName")}<br />{tCommon("dealerPortal")}
                </h1>
            </aside>

            <section className={styles.formPanel}>
                <div className={styles.formInner}>
                    <h2 className={styles.heading}>{t("title")}</h2>
                    <p className={styles.subheading}>{t("subtitle")}</p>

                    {error && (
                        <div className={styles.alert} role="alert">
                            <RiAlertLine size={16} className={styles.alertIcon} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}
                        noValidate
                        aria-label={t("formLabel")}
                    >
                        <Input
                            id="identifier"
                            label={t("emailLabel")}
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            leftIcon={<RiMailLine size={17} />}
                            required
                            autoComplete="email"
                            autoFocus
                            disabled={loading}
                        />

                        <Input
                            id="password"
                            label={t("passwordLabel")}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<RiLockPasswordLine size={17} />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        color: "var(--text-light)",
                                        padding: 0,
                                    }}
                                >
                                    {showPassword ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                                </button>
                            }
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner} aria-hidden="true" />
                                    {t("submitting")}
                                </>
                            ) : (
                                <>
                                    {t("submit")}
                                    <RiArrowRightLine size={17} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className={styles.footerNote}>
                        {t("supportPrompt")} {" "}
                        <a
                            href="mailto:support@palqar.cloud"
                            style={{color: "var(--primary)", textDecoration: "none"}}
                        >
                            {t("supportLink")}
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
