import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, GraduationCap, Briefcase, TrendingUp, Target, Users, Lightbulb, MapPin, Clock, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { vacancies, type Vacancy } from "@/drizzle/schema";
import { buildAlternates } from "@/lib/seo/alternates";

type Locale = "nl" | "en";

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

const disciplines = [
  "Audit & Assurance",
  "Internal Audit, Risk & Governance",
  "Accounting & Reporting",
  "Tax & Compliance",
  "Advisory & Training",
  "Transformation & Project Management",
];

const content: Record<
  Locale,
  {
    title: string;
    description: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    whyBadge: string;
    whyTitle: string;
    reasons: { icon: typeof TrendingUp; title: string; description: string }[];
    disciplinesTitle: string;
    cultureBadge: string;
    cultureTitle: string;
    cultureSubtitle: string;
    cultureValues: { title: string; description: string }[];
    startersTitle: string;
    startersText: string;
    experiencedTitle: string;
    experiencedText: string;
    contactButton: string;
    vacanciesBadge: string;
    vacanciesTitle: string;
    vacanciesSubtitle: string;
    sendCv: string;
    applySubjectPrefix: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
  }
> = {
  nl: {
    title: "Werken bij ons | Vliet Accountants & Consultants",
    description: "Bekijk openstaande vacatures bij Vliet Accountants & Consultants in Paramaribo en bouw mee aan onze organisatie.",
    heroBadge: "Werken bij ons",
    heroTitle: "Bouw mee aan vertrouwen, kwaliteit en duurzame waarde",
    heroSubtitle:
      "Bij Vliet Accountants & Consultants geloven wij dat het succes van onze organisatie begint bij onze mensen. Investeer in jouw toekomst bij een team dat er echt toe doet.",
    whyBadge: "Waarom kiezen voor Vliet?",
    whyTitle: "Wat wij jou bieden",
    reasons: [
      { icon: TrendingUp, title: "Professionele groei", description: "Wij geloven in continu leren en ontwikkelen. Daarom stimuleren wij onze medewerkers om opleidingen te volgen, certificeringen te behalen en hun kennis voortdurend uit te breiden." },
      { icon: Target, title: "Uitdagende opdrachten", description: "Onze cliënten zijn actief in uiteenlopende sectoren. Hierdoor werk je aan diverse vraagstukken op het gebied van financiële verslaggeving, governance, risicomanagement en strategische besluitvorming." },
      { icon: Users, title: "Persoonlijke aandacht", description: "Bij Vliet ben je geen nummer. Wij investeren in coaching, begeleiding en kennisdeling zodat iedere medewerker zijn of haar potentieel optimaal kan benutten." },
      { icon: Lightbulb, title: "Impact maken", description: "Het werk dat wij doen heeft directe invloed op organisaties, bestuurders en stakeholders. Jouw bijdrage helpt organisaties beter te presteren en duurzame waarde te creëren." },
    ],
    disciplinesTitle: "Disciplines waarin je kunt werken",
    cultureBadge: "Onze cultuur",
    cultureTitle: "Kernwaarden die ons drijven",
    cultureSubtitle: "Wij zijn ambitieus, professioneel en resultaatgericht, maar verliezen daarbij de menselijke kant nooit uit het oog.",
    cultureValues: [
      { title: "Kwaliteit", description: "Wij streven naar de hoogste professionele standaarden in onze dienstverlening." },
      { title: "Integriteit", description: "Wij handelen eerlijk, onafhankelijk en transparant." },
      { title: "Samenwerking", description: "Wij geloven dat de beste resultaten ontstaan wanneer kennis, ervaring en perspectieven samenkomen." },
      { title: "Ontwikkeling", description: "Wij investeren voortdurend in onze mensen en stimuleren een cultuur van leren en verbeteren." },
      { title: "Toegevoegde waarde", description: "Wij zoeken altijd naar manieren om meerwaarde te creëren voor onze cliënten, collega's en de samenleving." },
    ],
    startersTitle: "Voor studenten en starters",
    startersText:
      "Ben je student of recent afgestudeerd? Bij Vliet krijg je de mogelijkheid om praktijkervaring op te doen in een professionele omgeving waar leren centraal staat. Wij bieden stageplaatsen, traineeships en startersfuncties waarbij je wordt begeleid door ervaren professionals.",
    experiencedTitle: "Voor ervaren professionals",
    experiencedText:
      "Ben je op zoek naar een omgeving waarin jouw kennis en ervaring daadwerkelijk het verschil maken? Bij Vliet krijg je de ruimte om verantwoordelijkheid te nemen, cliënten te adviseren en actief bij te dragen aan de verdere groei van onze organisatie.",
    contactButton: "Neem contact op",
    vacanciesBadge: "Nu open",
    vacanciesTitle: "Openstaande vacatures",
    vacanciesSubtitle: "Ben jij de professional die wij zoeken? Bekijk onze openstaande posities en solliciteer direct.",
    sendCv: "Stuur je sollicitatiebrief en cv naar",
    applySubjectPrefix: "Sollicitatie",
    ctaTitle: "Samen bouwen aan de toekomst",
    ctaText:
      "Wij zijn voortdurend op zoek naar gedreven professionals die kwaliteit, integriteit en toegevoegde waarde belangrijk vinden. Jouw volgende stap begint hier.",
    ctaButton: "Plan een kennismakingsgesprek",
  },
  en: {
    title: "Careers | Vliet Accountants & Consultants",
    description: "View open vacancies at Vliet Accountants & Consultants in Paramaribo and help build our organisation.",
    heroBadge: "Careers",
    heroTitle: "Help build trust, quality and lasting value",
    heroSubtitle:
      "At Vliet Accountants & Consultants, we believe our organisation's success starts with our people. Invest in your future with a team that truly makes a difference.",
    whyBadge: "Why choose Vliet?",
    whyTitle: "What we offer you",
    reasons: [
      { icon: TrendingUp, title: "Professional growth", description: "We believe in continuous learning and development. That's why we encourage our employees to pursue training, obtain certifications and continuously expand their knowledge." },
      { icon: Target, title: "Challenging assignments", description: "Our clients operate across a wide range of sectors, so you'll work on diverse challenges in financial reporting, governance, risk management and strategic decision-making." },
      { icon: Users, title: "Personal attention", description: "At Vliet, you're not just a number. We invest in coaching, mentoring and knowledge sharing so every employee can reach their full potential." },
      { icon: Lightbulb, title: "Making an impact", description: "The work we do directly influences organisations, directors and stakeholders. Your contribution helps organisations perform better and create lasting value." },
    ],
    disciplinesTitle: "Disciplines you can work in",
    cultureBadge: "Our culture",
    cultureTitle: "Core values that drive us",
    cultureSubtitle: "We are ambitious, professional and results-driven, yet we never lose sight of the human side.",
    cultureValues: [
      { title: "Quality", description: "We strive for the highest professional standards in our services." },
      { title: "Integrity", description: "We act honestly, independently and transparently." },
      { title: "Collaboration", description: "We believe the best results come from combining knowledge, experience and perspectives." },
      { title: "Development", description: "We continuously invest in our people and foster a culture of learning and improvement." },
      { title: "Added value", description: "We always look for ways to create added value for our clients, colleagues and society." },
    ],
    startersTitle: "For students and starters",
    startersText:
      "Are you a student or recent graduate? At Vliet, you'll get the chance to gain practical experience in a professional environment where learning comes first. We offer internships, traineeships and entry-level positions with guidance from experienced professionals.",
    experiencedTitle: "For experienced professionals",
    experiencedText:
      "Are you looking for an environment where your knowledge and experience truly make a difference? At Vliet, you'll have the space to take ownership, advise clients and actively contribute to our organisation's continued growth.",
    contactButton: "Get in touch",
    vacanciesBadge: "Now hiring",
    vacanciesTitle: "Open positions",
    vacanciesSubtitle: "Are you the professional we're looking for? Browse our open positions and apply directly.",
    sendCv: "Send your application letter and CV to",
    applySubjectPrefix: "Application",
    ctaTitle: "Building the future together",
    ctaText:
      "We are always looking for driven professionals who value quality, integrity and added value. Your next step starts here.",
    ctaButton: "Schedule an introductory meeting",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === "en" ? "en" : "nl";
  const t = content[l];
  const { canonical, languages } = buildAlternates(locale, "/werken-bij-ons");
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical, languages },
  };
}

export default async function WerkenBijOnsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l: Locale = locale === "en" ? "en" : "nl";
  const t = content[l];
  const careersT = await getTranslations("careers");
  const openVacancies = await getVacancies(locale);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/werken bij ons.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">{t.heroBadge}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">{t.heroTitle}</h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">{t.heroSubtitle}</p>
        </div>
      </section>

      {/* Why Vliet */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">{t.whyBadge}</Badge>
            <h2 className="text-3xl font-bold text-navy">{t.whyTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.reasons.map((reason) => {
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
            <h3 className="font-semibold text-navy text-xl mb-4">{t.disciplinesTitle}</h3>
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
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">{t.cultureBadge}</Badge>
            <h2 className="text-3xl font-bold text-navy mb-4">{t.cultureTitle}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.cultureSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.cultureValues.map((value) => (
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
                <h3 className="font-bold text-navy text-xl mb-3">{t.startersTitle}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{t.startersText}</p>
                <Button asChild className="bg-navy text-white hover:bg-navy/90">
                  <Link href="/contact">
                    {t.contactButton} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-5">
                  <Briefcase className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-bold text-navy text-xl mb-3">{t.experiencedTitle}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{t.experiencedText}</p>
                <Button asChild className="bg-navy text-white hover:bg-navy/90">
                  <Link href="/contact">
                    {t.contactButton} <ArrowRight className="w-4 h-4 ml-2" />
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
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">{t.vacanciesBadge}</Badge>
            <h2 className="text-3xl font-bold text-navy">{t.vacanciesTitle}</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{t.vacanciesSubtitle}</p>
          </div>

          <div className="space-y-8">
            {openVacancies.length === 0 && (
              <p className="text-center text-gray-400 py-8">{careersT("noVacancies")}</p>
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
                        [careersT("duties"), vacancy.duties],
                        [careersT("requirements"), vacancy.requirements],
                        [careersT("offers"), vacancy.offers],
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
                      {t.sendCv}{" "}
                      <a href={`mailto:${vacancy.applyEmail}`} className="text-gold hover:underline font-medium">
                        {vacancy.applyEmail}
                      </a>
                    </span>
                    <Button asChild className="bg-navy text-white hover:bg-navy/90 font-semibold shrink-0">
                      <a href={`mailto:${vacancy.applyEmail}?subject=${encodeURIComponent(`${t.applySubjectPrefix} ${vacancy.title}`)}`}>
                        {careersT("apply")} <ArrowRight className="w-4 h-4 ml-2" />
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-white/75 leading-relaxed mb-8">{t.ctaText}</p>
          <Button asChild className="bg-gold text-white hover:bg-gold/90 font-semibold">
            <Link href="/afspraak">
              {t.ctaButton} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
