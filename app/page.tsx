import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-bold">{t("home.title")}</h1>
      <p className="text-lg opacity-80">{t("home.comingSoon")}</p>
    </main>
  );
}
