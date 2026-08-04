import AppLayout from "@/components/layout/AppLayout/AppLayout";
import Card from "@/components/ui/Card/Card";
import {getTranslations} from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <AppLayout>
      <Card>
        <h1>{t("welcome")}</h1>
      </Card>
    </AppLayout>
  );
}
