import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span>Loading...</span>
            ) : (
                <>
                    {leftIcon}
                    <span>{children}</span>
                    {rightIcon}
                </>
            )}
        </button>
    );
}