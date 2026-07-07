import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="py-32 text-center px-4">
      <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">404</p>
      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">{t("title")}</h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">{t("text")}</p>
      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
      >
        {t("backHome")}
      </Link>
    </section>
  );
}
