import { Link } from "@/i18n/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, GraduationCap, Briefcase, TrendingUp, Target, Users, Lightbulb, MapPin, Clock, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { vacancies, type Vacancy } from "@/drizzle/schema";

export const metadata = { title: "Werken bij ons | Vliet Accountants & Consultants" };
export const dynamic = "force-dynamic";

// Active vacancies in the current language; EN falls back to the NL list
// while no EN vacancies exist yet.
async function getVacancies(locale: string): Promise<Vacancy[]> {
  try {
    const rows = await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.active, true))
      .orderBy(asc(vacancies.sortOrder), desc(vacancies.createdAt));
    const localized = rows.filter((v) => v.locale === locale);
    return localized.length > 0 ? localized : rows.filter((v) => v.locale === "nl");
  } catch {
    return [];
  }
}

const cultureValues = [
  {
    title: "Kwaliteit",
    description: "Wij streven naar de hoogste professionele standaarden in onze dienstverlening.",
  },
  {
    title: "Integriteit",
    description: "Wij handelen eerlijk, onafhankelijk en transparant.",
  },
  {
    title: "Samenwerking",
    description: "Wij geloven dat de beste resultaten ontstaan wanneer kennis, ervaring en perspectieven samenkomen.",
  },
  {
    title: "Ontwikkeling",
    description: "Wij investeren voortdurend in onze mensen en stimuleren een cultuur van leren en verbeteren.",
  },
  {
    title: "Toegevoegde waarde",
    description: "Wij zoeken altijd naar manieren om meerwaarde te creëren voor onze cliënten, collega's en de samenleving.",
  },
];

const disciplines = [
  "Audit & Assurance",
  "Internal Audit, Risk & Governance",
  "Accounting & Reporting",
  "Tax & Compliance",
  "Advisory & Training",
  "Transformation & Project Management",
];

const reasons = [
  {
    icon: TrendingUp,
    title: "Professionele groei",
    description:
      "Wij geloven in continu leren en ontwikkelen. Daarom stimuleren wij onze medewerkers om opleidingen te volgen, certificeringen te behalen en hun kennis voortdurend uit te breiden.",
  },
  {
    icon: Target,
    title: "Uitdagende opdrachten",
    description:
      "Onze cliënten zijn actief in uiteenlopende sectoren. Hierdoor werk je aan diverse vraagstukken op het gebied van financiële verslaggeving, governance, risicomanagement en strategische besluitvorming.",
  },
  {
    icon: Users,
    title: "Persoonlijke aandacht",
    description:
      "Bij Vliet ben je geen nummer. Wij investeren in coaching, begeleiding en kennisdeling zodat iedere medewerker zijn of haar potentieel optimaal kan benutten.",
  },
  {
    icon: Lightbulb,
    title: "Impact maken",
    description:
      "Het werk dat wij doen heeft directe invloed op organisaties, bestuurders en stakeholders. Jouw bijdrage helpt organisaties beter te presteren en duurzame waarde te creëren.",
  },
];

export default async function WerkenBijOnsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");
  const openVacancies = await getVacancies(locale);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/Video_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">Werken bij ons</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
            Bouw mee aan vertrouwen, kwaliteit en duurzame waarde
          </h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">
            Bij Vliet Accountants & Consultants geloven wij dat het succes van onze organisatie begint
            bij onze mensen. Investeer in jouw toekomst bij een team dat er echt toe doet.
          </p>
        </div>
      </section>

      {/* Why Vliet */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Waarom kiezen voor Vliet?</Badge>
            <h2 className="text-3xl font-bold text-navy">Wat wij jou bieden</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <Card key={reason.title} className="border border-gray-100 hover:border-navy/20 hover:shadow-lg transition-all duration-200 group hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-4 group-hover:bg-navy transition-colors">
                      <Icon className="w-6 h-6 text-navy group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-navy text-lg mb-3">{reason.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 bg-gray-50 rounded-2xl p-8">
            <h3 className="font-semibold text-navy text-xl mb-4">Disciplines waarin je kunt werken</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {disciplines.map((disc) => (
                <div key={disc} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-gray-700 text-sm">{disc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Onze cultuur</Badge>
            <h2 className="text-3xl font-bold text-navy mb-4">Kernwaarden die ons drijven</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Wij zijn ambitieus, professioneel en resultaatgericht, maar verliezen daarbij de menselijke
              kant nooit uit het oog.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cultureValues.map((value) => (
              <div
                key={value.title}
                className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-gold font-bold text-sm">{value.title[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1">{value.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Starters & Experienced */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-5">
                  <GraduationCap className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-bold text-navy text-xl mb-3">Voor studenten en starters</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Ben je student of recent afgestudeerd? Bij Vliet krijg je de mogelijkheid om
                  praktijkervaring op te doen in een professionele omgeving waar leren centraal staat.
                  Wij bieden stageplaatsen, traineeships en startersfuncties waarbij je wordt begeleid
                  door ervaren professionals.
                </p>
                <Button asChild className="bg-navy text-white hover:bg-navy/90">
                  <Link href="/contact">
                    Neem contact op <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-5">
                  <Briefcase className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-bold text-navy text-xl mb-3">Voor ervaren professionals</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Ben je op zoek naar een omgeving waarin jouw kennis en ervaring daadwerkelijk het
                  verschil maken? Bij Vliet krijg je de ruimte om verantwoordelijkheid te nemen,
                  cliënten te adviseren en actief bij te dragen aan de verdere groei van onze organisatie.
                </p>
                <Button asChild className="bg-navy text-white hover:bg-navy/90">
                  <Link href="/contact">
                    Neem contact op <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Openstaande vacatures */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">Nu open</Badge>
            <h2 className="text-3xl font-bold text-navy">Openstaande vacatures</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Ben jij de professional die wij zoeken? Bekijk onze openstaande posities en solliciteer direct.</p>
          </div>

          <div className="space-y-8">
            {openVacancies.length === 0 && (
              <p className="text-center text-gray-400 py-8">{t("noVacancies")}</p>
            )}

            {openVacancies.map((vacancy) => (
              <Card
                key={vacancy.id}
                className="border border-gray-100 hover:border-navy/20 hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-navy mb-2">{vacancy.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold" /> {vacancy.location}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold" /> {vacancy.employmentType}</span>
                      </div>
                    </div>
                    <Badge className="bg-gold/10 text-gold border-gold/30 hover:bg-gold/10 text-sm px-3 py-1">
                      {vacancy.department}
                    </Badge>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">{vacancy.description}</p>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {(
                      [
                        [t("duties"), vacancy.duties],
                        [t("requirements"), vacancy.requirements],
                        [t("offers"), vacancy.offers],
                      ] as const
                    ).map(([heading, items]) =>
                      items.length === 0 ? null : (
                        <div key={heading}>
                          <h4 className="font-semibold text-navy mb-3">{heading}</h4>
                          <ul className="space-y-2">
                            {items.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-100">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4 text-gold" />
                      Stuur je sollicitatiebrief en cv naar{" "}
                      <a href={`mailto:${vacancy.applyEmail}`} className="text-gold hover:underline font-medium">
                        {vacancy.applyEmail}
                      </a>
                    </span>
                    <Button asChild className="bg-navy text-white hover:bg-navy/90 font-semibold shrink-0">
                      <a href={`mailto:${vacancy.applyEmail}?subject=${encodeURIComponent(`Sollicitatie ${vacancy.title}`)}`}>
                        {t("apply")} <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Samen bouwen aan de toekomst</h2>
          <p className="text-white/75 leading-relaxed mb-8">
            Wij zijn voortdurend op zoek naar gedreven professionals die kwaliteit, integriteit en
            toegevoegde waarde belangrijk vinden. Jouw volgende stap begint hier.
          </p>
          <Button asChild className="bg-gold text-white hover:bg-gold/90 font-semibold">
            <Link href="/afspraak">
              Plan een kennismakingsgesprek <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
