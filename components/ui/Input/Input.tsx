import React from "react";
import styles from "./Input.module.css";

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Input({
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className = "",
    required,
    ...props
}: InputProps) {
    return (
        <div className={styles.wrapper}>
            {label && (
                <label className={styles.label}>
                    {label}

                    {required && (
                        <span className={styles.required}>
                            *
                        </span>
                    )}
                </label>
            )}

            <div
                className={`${styles.inputContainer} ${error ? styles.errorState : ""
                    }`}
            >
                {leftIcon && (
                    <span className={styles.icon}>
                        {leftIcon}
                    </span>
                )}

                <input
                    className={`${styles.input} ${className}`}
                    required={required}
                    {...props}
                />

                {rightIcon && (
                    <span className={styles.icon}>
                        {rightIcon}
                    </span>
                )}
            </div>

            {error ? (
                <p className={styles.error}>
                    {error}
                </p>
            ) : (
                helperText && (
                    <p className={styles.helper}>
                        {helperText}
                    </p>
                )
            )}
        </div>
    );
}