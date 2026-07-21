import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

import styles from "./AppLayout.module.css";

interface Props {
    children: React.ReactNode;
}

export default function AppLayout({
    children,
}: Props) {
    return (
        <div className={styles.layout}>
            <Sidebar />

            <div className={styles.main}>
                <Navbar />

                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}