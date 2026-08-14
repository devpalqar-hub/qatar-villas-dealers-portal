import AppLayout from "@/components/layout/AppLayout/AppLayout";
import DashboardView from "@/components/dashboard/DashboardView";
import { getTranslations } from "next-intl/server";
import styles from "./page.module.css";

export default async function Home() {
    const t = await getTranslations("home");
    const tDashboard = await getTranslations("dashboard");

    return (
        <AppLayout>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t("welcome")}</h1>
                <p className={styles.pageSubtitle}>{tDashboard("subtitle")}</p>
            </div>

            <DashboardView />
        </AppLayout>
    );
}
