import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import BookingWidget from "@/components/booking/booking-widget";
import { buildAlternates } from "@/lib/seo/alternates";

const TITLE: Record<string, string> = {
  nl: "Afspraak maken | Vliet Accountants & Consultants",
  en: "Schedule an appointment | Vliet Accountants & Consultants",
};
const DESCRIPTION: Record<string, string> = {
  nl: "Plan online een vrijblijvende kennismaking met Vliet Accountants & Consultants. Kies zelf een datum en tijd die u schikt.",
  en: "Book a free introductory meeting with Vliet Accountants & Consultants online. Choose a date and time that suits you.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { canonical, languages } = buildAlternates(locale, "/afspraak");
  return {
    title: TITLE[locale] ?? TITLE.nl,
    description: DESCRIPTION[locale] ?? DESCRIPTION.nl,
    alternates: { canonical, languages },
  };
}

export default async function AfspraakPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/Video_Contact.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
            {t("heroBadge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
            {t("heroTitleLead")} <span className="text-gold">{t("heroTitleAccent")}</span>
          </h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">{t("heroSubtitle")}</p>
        </div>
      </section>

      {/* Booking widget */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingWidget />
        </div>
      </section>
    </>
  );
}
