"use client";

import { FiBell, FiSearch } from "react-icons/fi";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <header className={styles.navbar}>
            <div className={styles.search}>
                <FiSearch />

                <input
                    type="text"
                    placeholder="Search..."
                />
            </div>

            <div className={styles.right}>
                <button className={styles.notification}>
                    <FiBell />
                </button>

                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        F
                    </div>

                    <div>
                        <h4>Fayaz</h4>
                        <span>Agency Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}