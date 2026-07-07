import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageLayout from "@/components/service-page-layout";
import { getService } from "@/lib/content/queries";
import {
  SERVICE_KEYS,
  SERVICE_LABELS,
  type ServiceKey,
} from "@/lib/content/services-defaults";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

const PAGE_KEYS: readonly string[] = SERVICE_KEYS.filter(
  (key) => key !== "diensten-index"
);

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PAGE_KEYS.map((service) => ({ locale, service }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}): Promise<Metadata> {
  const { locale, service } = await params;
  if (!PAGE_KEYS.includes(service as ServiceKey)) return {};

  const content = await getService(service as ServiceKey, locale);
  const intro = content.intro[0] ?? "";
  const description =
    intro.length > 160 ? `${intro.slice(0, 157)}...` : intro;

  const { canonical, languages } = buildAlternates(
    locale,
    `/diensten/${service}`
  );

  return {
    title: `${SERVICE_LABELS[service as ServiceKey]} | Vliet Accountants & Consultants`,
    description,
    alternates: { canonical, languages },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { locale, service } = await params;
  if (!PAGE_KEYS.includes(service as ServiceKey)) notFound();

  const content = await getService(service as ServiceKey, locale);

  return (
    <ServicePageLayout
      locale={locale === "en" ? "en" : "nl"}
      badge={content.badge}
      title={content.title}
      subtitle={content.subtitle}
      intro={content.intro}
      services={content.services}
      whyUs={content.whyUs}
      ctaTitle={content.ctaTitle}
      ctaText={content.ctaText}
      image={content.image}
    />
  );
}
