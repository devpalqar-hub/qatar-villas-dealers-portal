"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RiEyeLine, RiEyeOffLine, RiLockPasswordLine, RiMailLine, RiAlertLine, RiArrowRightLine, RiShieldKeyholeLine } from "react-icons/ri";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui";
import { authService } from "@/services/auth.service";
import styles from "./page.module.css";

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
                            <Image
                                src="/VillasLogo.png"
                                alt={tCommon("appName")}
                                width={200}
                                height={120}
                                className={styles.logoImage}
                                priority
                            />
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
                            <Image
                                src="/VillasLogo.png"
                                alt={tCommon("appName")}
                                width={100}
                                height={60}
                                className={styles.badgeImage}
                            />
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

