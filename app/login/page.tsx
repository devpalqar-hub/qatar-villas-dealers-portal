"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RiEyeLine, RiEyeOffLine, RiLockPasswordLine, RiMailLine, RiAlertLine, RiArrowRightLine, RiShieldKeyholeLine } from "react-icons/ri";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui";
import { authService } from "@/services/auth.service";
import styles from "./page.module.css";

/**
 * Abstract faceted logomark (four triangles forming a stylised "V").
 * Reused for the top-left wordmark and the floating badge on the form card.
 */
function LogoMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="vqGoldFill" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#e9cd8f" />
                    <stop offset="100%" stopColor="#b3893f" />
                </linearGradient>
            </defs>
            <path d="M6 7 L24 7 L14 23 Z" fill="url(#vqGoldFill)" />
            <path d="M24 7 L42 7 L34 23 Z" fill="url(#vqGoldFill)" opacity="0.85" />
            <path d="M14 23 L24 41 L6 41 Z" fill="url(#vqGoldFill)" opacity="0.7" />
            <path d="M34 23 L42 41 L24 41 Z" fill="url(#vqGoldFill)" opacity="0.55" />
        </svg>
    );
}

export default function LoginPage() {
    const t = useTranslations("login");
    const tCommon = useTranslations("common");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
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
            const response = await authService.login({ identifier, password });
            const { access_token } = response;
            if (!access_token) {
                throw new Error(t("errors.missingToken"));
            }

            document.cookie = `auth_token=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
            localStorage.setItem("auth_token", access_token);
            window.location.href = "/";
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string } }, message?: string };
            const message = serviceError?.response?.data?.message || serviceError?.message || t("errors.invalidCredentials");
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <svg
                width="0"
                height="0"
                style={{ position: "absolute" }}
                aria-hidden="true"
            >
                <defs>
                    <clipPath id="heroClip" clipPathUnits="objectBoundingBox">
                        <path
                            d="
M0,0
H0.92

C1.02,0.06
0.98,0.22
0.88,0.34

C0.80,0.47
0.82,0.57
0.92,0.70

C1.00,0.82
1.02,0.96
0.90,1

H0
Z"
                        />
                    </clipPath>
                </defs>
            </svg>
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

                    <div className={styles.imageContent}>
                        <div className={styles.logoRow}>
                            <LogoMark className={styles.logoMark} />
                            <div className={styles.logoTextGroup}>
                                <span className={styles.logoBrand}>{tCommon("appName")}</span>
                                <span className={styles.logoTag}>Living Simplified</span>
                            </div>
                        </div>

                        <div className={styles.heroText}>
                            <span className={styles.eyebrow}>Welcome to</span>
                            <h1 className={styles.heroTitle}>
                                {tCommon("appName")}<br />{tCommon("dealerPortal")}
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Connecting premium properties with trusted professionals.
                            </p>
                        </div>
                    </div>
                </aside>

                <section className={styles.formPanel}>
                    <div className={styles.formCard}>
                        <div className={styles.badgeCircle}>
                            <LogoMark className={styles.badgeMark} />
                        </div>

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
                                            className={styles.eyeToggle}
                                        >
                                            {showPassword ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                                        </button>
                                    }
                                    required
                                    autoComplete="current-password"
                                    disabled={loading}
                                />

                                <div className={styles.optionsRow}>
                                    <label className={styles.rememberLabel}>
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className={styles.rememberCheckbox}
                                            disabled={loading}
                                        />
                                        {("remember me")}
                                    </label>
                                    <a href="/forgot-password" className={styles.forgotLink}>
                                        {("forgot password?")}
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                    aria-busy={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className={styles.spinner} aria-hidden="true" />
                                            {("Submitting")}
                                        </>
                                    ) : (
                                        <>
                                            {("Submit")}
                                            <RiArrowRightLine size={17} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className={styles.divider}>
                                <span>{("Or")}</span>
                            </div>

                            {/* <button type="button" className={styles.otpBtn} disabled={loading}>
                                <RiShieldKeyholeLine size={17} />
                                {t("signInWithOtp")}
                            </button> */}

                            <p className={styles.footerNote}>
                                {("New here?")} {" "}
                                <a href="/dealer-onboarding" className={styles.supportLink}>
                                    {("Onboard Now!")}
                                </a>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

