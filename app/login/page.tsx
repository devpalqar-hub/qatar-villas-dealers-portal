"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    RiEyeLine,
    RiEyeOffLine,
    RiLockPasswordLine,
    RiMailLine,
    RiAlertLine,
    RiArrowRightLine,
} from "react-icons/ri";
import { Input } from "@/components/ui";
import { authService } from "@/services/auth.service";
import styles from "./page.module.css";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!identifier.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);
        console.log("Submitting login...");

        try {
            const response = await authService.login({ identifier, password });
            console.log("Login response:", response);

            const { access_token } = response;
            if (!access_token) {
                throw new Error("No access_token returned from server.");
            }

            // Set cookie for Next.js proxy middleware route protection
            document.cookie = `auth_token=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

            // Set localStorage for client-side Axios calls
            localStorage.setItem("auth_token", access_token);

            window.location.href = "/";
        } catch (err: any) {
            console.error("Login error:", err);
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Invalid credentials. Please check your email and password.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* ── Left: background image panel ── */}
            <aside className={styles.imagePanel}>
                <Image
                    src="/login-bg.jpeg"
                    alt="Villas Qatar"
                    fill
                    priority
                    className={styles.bgImage}
                />
                {/* dark overlay */}
                <div className={styles.overlay} />

                <h1 className={styles.brandTitle}>
                    Villas Qatar<br />Dealers Portal
                </h1>
            </aside>

            {/* ── Right: form panel ── */}
            <section className={styles.formPanel}>
                <div className={styles.formInner}>
                    <h2 className={styles.heading}>Welcome back</h2>
                    <p className={styles.subheading}>
                        Sign in to your dealer account to continue.
                    </p>

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
                        aria-label="Login form"
                    >
                        <Input
                            id="identifier"
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
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
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<RiLockPasswordLine size={17} />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                                    {showPassword ? (
                                        <RiEyeOffLine size={17} />
                                    ) : (
                                        <RiEyeLine size={17} />
                                    )}
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
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <RiArrowRightLine size={17} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className={styles.footerNote}>
                        Having trouble?{" "}
                        <a
                            href="mailto:support@palqar.cloud"
                            style={{ color: "var(--primary)", textDecoration: "none" }}
                        >
                            Contact support
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
