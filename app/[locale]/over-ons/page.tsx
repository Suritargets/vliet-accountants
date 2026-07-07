import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Shield, BarChart3, FileText, Scale, Lightbulb, FolderKanban } from "lucide-react";
import { LinkedInIcon } from "@/components/social-icons";
import { BUSINESS } from "@/lib/seo/site-info";
import { buildAlternates } from "@/lib/seo/alternates";

type Locale = "nl" | "en";

// Escape </script>-breakout, mirrors components/organization-jsonld.tsx.
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

interface FaqItem {
  question: string;
  answer: string;
}

const services = [
  { icon: Shield, title: "Audit & Assurance", href: "/diensten/audit-assurance" },
  { icon: BarChart3, title: "Internal Audit, Risk & Governance", href: "/diensten/internal-audit-risk-governance" },
  { icon: FileText, title: "Accounting & Reporting", href: "/diensten/accounting-reporting" },
  { icon: Scale, title: "Tax & Compliance", href: "/diensten/tax-compliance" },
  { icon: Lightbulb, title: "Advisory & Training", href: "/diensten/advisory-training" },
  { icon: FolderKanban, title: "Transformation & Project Management", href: "/diensten/transformation-project-management" },
];

const teamMembers = [
  { name: "Guillaume Vliet MSc RA CA", role: "Managing Director", linkedin: "#", photo: "/images/team-1.jpeg" },
  { name: "Majugra Andias MoA", role: "Supervisor", linkedin: "#", photo: "/images/team-2.jpg" },
  { name: "Natasha Anylus", role: "Senior Consultant", linkedin: "#", photo: "/images/natasha 1.jpeg" },
];

const content: Record<
  Locale,
  {
    title: string;
    description: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    whoWeAreTitle: string;
    whoWeAreParagraphs: string[];
    visionTitle: string;
    visionParagraphs: string[];
    affiliatedLabel: string;
    valuesBadge: string;
    valuesTitle: string;
    values: { title: string; description: string }[];
    servicesBadge: string;
    servicesTitle: string;
    whyBadge: string;
    whyTitle: string;
    whyText: string;
    distinguishers: string[];
    teamBadge: string;
    teamTitle: string;
    teamText: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    faqBadge: string;
    faqTitle: string;
    faqItems: FaqItem[];
    faqBookingAnswer: { before: string; link1: string; middle: string; link2: string; after: string };
  }
> = {
  nl: {
    title: "Over ons | Vliet Accountants & Consultants",
    description:
      "Vliet Accountants & Consultants is een onafhankelijk accountants-, audit- en advieskantoor in Paramaribo met meer dan 15 jaar ervaring.",
    heroBadge: "Over ons",
    heroTitle: "Betrouwbare expertise. Praktische oplossingen. Duurzame waarde.",
    heroSubtitle:
      "Een onafhankelijk accountants-, audit- en advieskantoor dat organisaties ondersteunt bij het versterken van hun financiële betrouwbaarheid, governance en prestaties.",
    whoWeAreTitle: "Wie zijn wij",
    whoWeAreParagraphs: [
      "Vliet Accountants & Consultants is een onafhankelijk accountants-, audit- en advieskantoor dat organisaties ondersteunt bij het versterken van hun financiële betrouwbaarheid, governance, risicobeheersing en prestaties.",
      "Sinds onze oprichting hebben wij ons ontwikkeld tot een vertrouwde partner voor ondernemingen, overheidsinstanties, stichtingen, verenigingen en andere organisaties die behoefte hebben aan hoogwaardige dienstverlening en praktisch advies.",
      "Onze cliënten waarderen ons om onze betrokkenheid, deskundigheid en pragmatische aanpak. Wij luisteren, denken mee en zoeken naar oplossingen die niet alleen technisch juist zijn, maar ook daadwerkelijk bijdragen aan het succes van de organisatie.",
    ],
    visionTitle: "Onze visie",
    visionParagraphs: [
      "Wij geloven dat organisaties het meest succesvol zijn wanneer zij beschikken over betrouwbare informatie, sterke governance, effectieve risicobeheersing en deskundige ondersteuning bij belangrijke beslissingen.",
      "Onze ambitie is om organisaties te helpen groeien, verbeteren en toekomstbestendig te worden door hoogwaardige dienstverlening te combineren met praktische inzichten en persoonlijke betrokkenheid.",
    ],
    affiliatedLabel: "Aangesloten bij",
    valuesBadge: "Waar wij voor staan",
    valuesTitle: "Onze kernwaarden",
    values: [
      { title: "Kwaliteit", description: "Wij hanteren hoge professionele standaarden en streven naar dienstverlening van het hoogste niveau." },
      { title: "Integriteit", description: "Onafhankelijkheid, objectiviteit en betrouwbaarheid zijn essentieel voor het vertrouwen dat cliënten in ons stellen." },
      { title: "Betrokkenheid", description: "Wij investeren in duurzame relaties en begrijpen de uitdagingen en ambities van onze cliënten." },
      { title: "Toegevoegde waarde", description: "Wij kijken verder dan de opdracht en helpen organisaties risico's te beheersen en kansen te benutten." },
    ],
    servicesBadge: "Onze dienstverlening",
    servicesTitle: "Wat wij aanbieden",
    whyBadge: "Waarom Vliet",
    whyTitle: "Waarom cliënten voor Vliet kiezen",
    whyText:
      "Onze cliënten kiezen voor Vliet Accountants & Consultants omdat wij meer bieden dan alleen vaktechnische expertise. Wij combineren een persoonlijke benadering met diepgaande kennis van audit, accountancy, governance, risicomanagement en bedrijfsvoering.",
    distinguishers: [
      "Hoogwaardige professionele dienstverlening",
      "Persoonlijke betrokkenheid en korte communicatielijnen",
      "Praktische en oplossingsgerichte adviezen",
      "Focus op risico's én kansen",
      "Sterke expertise op het gebied van governance en internal audit",
      "Een integrale benadering van financiële, operationele en strategische vraagstukken",
    ],
    teamBadge: "Ons team",
    teamTitle: "Onze professionals",
    teamText:
      "Ons team bestaat uit ervaren professionals met expertise op het gebied van audit, accountancy, fiscaliteit, governance, risicomanagement en consultancy.",
    ctaTitle: "Samen bouwen aan duurzame waarde",
    ctaText:
      "Bij Vliet Accountants & Consultants geloven wij in langdurige relaties gebaseerd op vertrouwen, kwaliteit en toegevoegde waarde. Wij kijken ernaar uit om samen met u te bouwen aan een sterke, beheerste en toekomstbestendige organisatie.",
    ctaButton: "Plan een kennismaking",
    faqBadge: "Veelgestelde vragen",
    faqTitle: "Vaak gestelde vragen over Vliet",
    faqItems: [
      {
        question: "Welke diensten biedt Vliet Accountants & Consultants aan?",
        answer:
          "Vliet Accountants & Consultants biedt zes dienstverleningen aan: Audit & Assurance, Internal Audit, Risk & Governance, Accounting & Reporting, Tax & Compliance, Advisory & Training en Transformation & Project Management.",
      },
      {
        question: "Waar is Vliet Accountants & Consultants gevestigd?",
        answer: `Vliet Accountants & Consultants is gevestigd aan de ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, Suriname.`,
      },
      {
        question: "Hoe lang is Vliet Accountants & Consultants al actief?",
        answer: "Vliet Accountants & Consultants heeft meer dan 15 jaar ervaring in audit, accountancy en advies.",
      },
      {
        question: "Is Vliet Accountants & Consultants onafhankelijk?",
        answer: "Ja, Vliet Accountants & Consultants is een 100% onafhankelijk accountants-, audit- en advieskantoor.",
      },
      {
        question: "Bij welke beroepsorganisaties is Vliet aangesloten?",
        answer:
          "Vliet Accountants & Consultants is aangesloten bij de NBA (Koninklijke Nederlandse Beroepsorganisatie van Accountants), de IAASB en de SCAI.",
      },
      {
        question: "Hoe kan ik een afspraak maken?",
        answer:
          "U kunt eenvoudig online een afspraak maken via onze afsprakenpagina, of contact met ons opnemen via het contactformulier of telefonisch.",
      },
    ],
    faqBookingAnswer: {
      before: "U kunt eenvoudig online een afspraak maken via onze ",
      link1: "afsprakenpagina",
      middle: ", of contact met ons opnemen via het ",
      link2: "contactformulier",
      after: " of telefonisch.",
    },
  },
  en: {
    title: "About us | Vliet Accountants & Consultants",
    description:
      "Vliet Accountants & Consultants is an independent accounting, audit and advisory firm in Paramaribo with more than 15 years of experience.",
    heroBadge: "About us",
    heroTitle: "Reliable expertise. Practical solutions. Sustainable value.",
    heroSubtitle:
      "An independent accounting, audit and advisory firm that supports organisations in strengthening their financial reliability, governance and performance.",
    whoWeAreTitle: "Who we are",
    whoWeAreParagraphs: [
      "Vliet Accountants & Consultants is an independent accounting, audit and advisory firm that supports organisations in strengthening their financial reliability, governance, risk management and performance.",
      "Since our founding, we have grown into a trusted partner for businesses, government bodies, foundations, associations and other organisations that need high-quality services and practical advice.",
      "Our clients value us for our commitment, expertise and pragmatic approach. We listen, think along with you, and look for solutions that are not only technically sound but also genuinely contribute to the organisation's success.",
    ],
    visionTitle: "Our vision",
    visionParagraphs: [
      "We believe organisations are most successful when they have reliable information, strong governance, effective risk management and expert support for important decisions.",
      "Our ambition is to help organisations grow, improve and future-proof themselves by combining high-quality services with practical insights and personal commitment.",
    ],
    affiliatedLabel: "Affiliated with",
    valuesBadge: "What we stand for",
    valuesTitle: "Our core values",
    values: [
      { title: "Quality", description: "We maintain high professional standards and strive for the highest level of service." },
      { title: "Integrity", description: "Independence, objectivity and reliability are essential to the trust clients place in us." },
      { title: "Commitment", description: "We invest in lasting relationships and understand our clients' challenges and ambitions." },
      { title: "Added value", description: "We look beyond the assignment and help organisations manage risk and seize opportunities." },
    ],
    servicesBadge: "Our services",
    servicesTitle: "What we offer",
    whyBadge: "Why Vliet",
    whyTitle: "Why clients choose Vliet",
    whyText:
      "Our clients choose Vliet Accountants & Consultants because we offer more than technical expertise alone. We combine a personal approach with in-depth knowledge of audit, accountancy, governance, risk management and business operations.",
    distinguishers: [
      "High-quality professional services",
      "Personal involvement and short lines of communication",
      "Practical, solution-oriented advice",
      "Focus on both risks and opportunities",
      "Strong expertise in governance and internal audit",
      "An integrated approach to financial, operational and strategic matters",
    ],
    teamBadge: "Our team",
    teamTitle: "Our professionals",
    teamText:
      "Our team consists of experienced professionals with expertise in audit, accountancy, tax, governance, risk management and consultancy.",
    ctaTitle: "Building sustainable value together",
    ctaText:
      "At Vliet Accountants & Consultants, we believe in long-term relationships built on trust, quality and added value. We look forward to working with you to build a strong, well-governed and future-proof organisation.",
    ctaButton: "Schedule a consultation",
    faqBadge: "Frequently asked questions",
    faqTitle: "Frequently asked questions about Vliet",
    faqItems: [
      {
        question: "What services does Vliet Accountants & Consultants offer?",
        answer:
          "Vliet Accountants & Consultants offers six service lines: Audit & Assurance, Internal Audit, Risk & Governance, Accounting & Reporting, Tax & Compliance, Advisory & Training, and Transformation & Project Management.",
      },
      {
        question: "Where is Vliet Accountants & Consultants located?",
        answer: `Vliet Accountants & Consultants is located at ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, Suriname.`,
      },
      {
        question: "How long has Vliet Accountants & Consultants been active?",
        answer: "Vliet Accountants & Consultants has more than 15 years of experience in audit, accountancy and advisory.",
      },
      {
        question: "Is Vliet Accountants & Consultants independent?",
        answer: "Yes, Vliet Accountants & Consultants is a 100% independent accounting, audit and advisory firm.",
      },
      {
        question: "Which professional organisations is Vliet affiliated with?",
        answer:
          "Vliet Accountants & Consultants is affiliated with the NBA (Royal Dutch Professional Organisation of Accountants), the IAASB and SCAI.",
      },
      {
        question: "How can I schedule an appointment?",
        answer:
          "You can easily book an appointment online via our appointment page, or get in touch via the contact form or by phone.",
      },
    ],
    faqBookingAnswer: {
      before: "You can easily book an appointment online via our ",
      link1: "appointment page",
      middle: ", or get in touch via the ",
      link2: "contact form",
      after: " or by phone.",
    },
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
  const { canonical, languages } = buildAlternates(locale, "/over-ons");
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical, languages },
  };
}

export default async function OverOnsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = locale === "en" ? "en" : "nl";
  const t = content[l];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/Video_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">{t.heroBadge}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">{t.heroTitle}</h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">{t.heroSubtitle}</p>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-6">{t.whoWeAreTitle}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {t.whoWeAreParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/Voorpagina.jpg"
                alt="Vliet Accountants kantoor"
                width={640}
                height={480}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">{t.visionTitle}</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            {t.visionParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Aangesloten bij */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">{t.affiliatedLabel}</p>
          <div className="flex flex-wrap items-center justify-center gap-20">
            <a href="https://www.nba.nl/" target="_blank" rel="noopener noreferrer" aria-label="NBA">
              <Image src="/images/cert-nba.png" alt="NBA" width={240} height={96} className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="https://www.iaasb.org/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IAASB"
              className="block overflow-hidden h-24 relative opacity-70 hover:opacity-100 transition-opacity"
              style={{ width: '165px' }}
            >
              <div style={{ position: 'absolute', right: 0, top: 0, height: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/cert-iaasb.png" alt="IAASB" style={{ height: '100%', width: 'auto', maxWidth: 'none' }} />
              </div>
            </a>
            <a href="https://www.scai.sr/" target="_blank" rel="noopener noreferrer" aria-label="SCAI">
              <Image src="/images/cert-scai.png" alt="SCAI" width={240} height={96} className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">{t.valuesBadge}</Badge>
            <h2 className="text-3xl font-bold text-navy">{t.valuesTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.values.map((value) => (
              <Card key={value.title} className="border border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center mb-4">
                    <span className="text-gold font-bold text-lg">{value.title[0]}</span>
                  </div>
                  <h3 className="font-semibold text-navy text-lg mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">{t.servicesBadge}</Badge>
            <h2 className="text-3xl font-bold text-navy">{t.servicesTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-navy/20 hover:bg-gray-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center shrink-0 group-hover:bg-navy transition-colors">
                    <Icon className="w-5 h-5 text-navy group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-medium text-navy text-sm">{service.title}</span>
                  <ArrowRight className="w-4 h-4 text-gold ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why clients choose us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">{t.whyBadge}</Badge>
              <h2 className="text-3xl font-bold text-navy mb-6">{t.whyTitle}</h2>
              <p className="text-gray-600 leading-relaxed mb-8">{t.whyText}</p>
              <ul className="space-y-3">
                {t.distinguishers.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">{t.teamBadge}</Badge>
              <h2 className="text-3xl font-bold text-navy mb-6">{t.teamTitle}</h2>
              <p className="text-gray-600 leading-relaxed mb-8">{t.teamText}</p>
              <div className="grid gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-navy text-sm">{member.name}</div>
                      <div className="text-gray-500 text-xs">{member.role}</div>
                    </div>
                    <a
                      href={member.linkedin}
                      className="text-navy/40 hover:text-gold transition-colors"
                      aria-label="LinkedIn"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
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

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">{t.faqBadge}</Badge>
            <h2 className="text-3xl font-bold text-navy">{t.faqTitle}</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {t.faqItems.map((item, index) => (
              <Card key={item.question} className="border border-gray-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy">{item.question}</h3>
                  {index === t.faqItems.length - 1 ? (
                    <p className="text-gray-600 leading-relaxed mt-2">
                      {t.faqBookingAnswer.before}
                      <Link href="/afspraak" className="text-navy font-medium underline underline-offset-2 hover:text-gold">
                        {t.faqBookingAnswer.link1}
                      </Link>
                      {t.faqBookingAnswer.middle}
                      <Link href="/contact" className="text-navy font-medium underline underline-offset-2 hover:text-gold">
                        {t.faqBookingAnswer.link2}
                      </Link>
                      {t.faqBookingAnswer.after}
                    </p>
                  ) : (
                    <p className="text-gray-600 leading-relaxed mt-2">{item.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(faqJsonLd) }}
        />
      </section>
    </>
  );
}
