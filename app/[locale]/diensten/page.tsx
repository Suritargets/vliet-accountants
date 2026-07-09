import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, FileText, Scale, Lightbulb, FolderKanban, ArrowRight, type LucideIcon } from "lucide-react";
import { getService } from "@/lib/content/queries";
import { buildAlternates } from "@/lib/seo/alternates";

// Icons and routes stay in code; titles/descriptions come from the CMS
// (services_content, key 'diensten-index') with code defaults as fallback.
const SERVICE_CARDS: { icon: LucideIcon; href: string }[] = [
  { icon: FileText, href: "/diensten/accounting-reporting" },
  { icon: Lightbulb, href: "/diensten/advisory-training" },
  { icon: Shield, href: "/diensten/audit-assurance" },
  { icon: BarChart3, href: "/diensten/internal-audit-risk-governance" },
  { icon: Scale, href: "/diensten/tax-compliance" },
  { icon: FolderKanban, href: "/diensten/transformation-project-management" },
];

const CHROME = {
  nl: { title: "Diensten | Vliet Accountants & Consultants", readMore: "Meer lezen", contactCta: "Neem contact op" },
  en: { title: "Services | Vliet Accountants & Consultants", readMore: "Read more", contactCta: "Contact us" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = locale === "en" ? "en" : "nl";
  const { canonical, languages } = buildAlternates(locale, "/diensten");
  return { title: CHROME[l].title, alternates: { canonical, languages } };
}

export default async function DienstenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale === "en" ? "en" : "nl";
  const t = CHROME[l];
  const content = await getService("diensten-index", locale);

  return (
    <>
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/Video_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
            {content.badge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
            {content.title}
          </h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">{content.subtitle}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.services.map((service, index) => {
              const card = SERVICE_CARDS[index];
              if (!card) return null;
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className="group">
                  <Card className="h-full border border-gray-100 hover:border-navy/20 hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-xl bg-navy/5 flex items-center justify-center mb-5 group-hover:bg-navy transition-colors">
                        <Icon className="w-7 h-7 text-navy group-hover:text-white transition-colors" />
                      </div>
                      <h2 className="font-semibold text-navy text-xl mb-3">{service.title}</h2>
                      <p className="text-gray-500 leading-relaxed mb-5">{service.description}</p>
                      <div className="flex items-center gap-1 text-gold font-medium">
                        {t.readMore} <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{content.ctaTitle}</h2>
          <p className="text-white/75 mb-8">{content.ctaText}</p>
          <Button asChild className="bg-gold text-white hover:bg-gold/90 font-semibold">
            <Link href="/contact">
              {t.contactCta} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
