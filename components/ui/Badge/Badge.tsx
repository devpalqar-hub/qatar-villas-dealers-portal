import styles from "./Badge.module.css";

type BadgeVariant =
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export default function Badge({
    children,
    variant = "default",
    className = "",
}: BadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className}`}>
            {children}
        </span>
    );
}