"use client";

import { FiBell, FiSearch, FiMenu } from "react-icons/fi";
import styles from "./Navbar.module.css";

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    return (
        <header className={styles.navbar}>
            <div className={styles.left}>
                <button
                    type="button"
                    className={styles.menuBtn}
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                >
                    <FiMenu size={22} />
                </button>

                <span className={styles.mobileLogo}>Villas Qatar</span>

                <div className={styles.search}>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search..."
                    />
                </div>
            </div>

            <div className={styles.right}>
                <button className={styles.notification} aria-label="Notifications">
                    <FiBell />
                </button>

                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        F
                    </div>

                    <div className={styles.profileInfo}>
                        <h4>Fayaz</h4>
                        <span>Agency Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}