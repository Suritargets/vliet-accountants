import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Shield, BarChart3, FileText, Scale, Lightbulb, FolderKanban } from "lucide-react";
import { LinkedInIcon } from "@/components/social-icons";
import { BUSINESS } from "@/lib/seo/site-info";

export const metadata = { title: "Over ons | Vliet Accountants & Consultants" };

// Escape </script>-breakout, mirrors components/organization-jsonld.tsx.
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
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
    answer:
      "Vliet Accountants & Consultants heeft meer dan 15 jaar ervaring in audit, accountancy en advies.",
  },
  {
    question: "Is Vliet Accountants & Consultants onafhankelijk?",
    answer:
      "Ja, Vliet Accountants & Consultants is een 100% onafhankelijk accountants-, audit- en advieskantoor.",
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
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const values = [
  {
    title: "Kwaliteit",
    description: "Wij hanteren hoge professionele standaarden en streven naar dienstverlening van het hoogste niveau.",
  },
  {
    title: "Integriteit",
    description: "Onafhankelijkheid, objectiviteit en betrouwbaarheid zijn essentieel voor het vertrouwen dat cliënten in ons stellen.",
  },
  {
    title: "Betrokkenheid",
    description: "Wij investeren in duurzame relaties en begrijpen de uitdagingen en ambities van onze cliënten.",
  },
  {
    title: "Toegevoegde waarde",
    description: "Wij kijken verder dan de opdracht en helpen organisaties risico's te beheersen en kansen te benutten.",
  },
];

const teamMembers = [
  { name: "Guillaume Vliet MSc RA CA", role: "Managing Director", linkedin: "#", photo: "/images/team-1.jpeg" },
  { name: "Majugra Andias MoA", role: "Supervisor", linkedin: "#", photo: "/images/team-2.jpg" },
  { name: "Natasha Anylus", role: "Senior Consultant", linkedin: "#", photo: "/images/natasha 1.jpeg" },
];

const services = [
  { icon: Shield, title: "Audit & Assurance", href: "/diensten/audit-assurance" },
  { icon: BarChart3, title: "Internal Audit, Risk & Governance", href: "/diensten/internal-audit-risk-governance" },
  { icon: FileText, title: "Accounting & Reporting", href: "/diensten/accounting-reporting" },
  { icon: Scale, title: "Tax & Compliance", href: "/diensten/tax-compliance" },
  { icon: Lightbulb, title: "Advisory & Training", href: "/diensten/advisory-training" },
  { icon: FolderKanban, title: "Transformation & Project Management", href: "/diensten/transformation-project-management" },
];

const distinguishers = [
  "Hoogwaardige professionele dienstverlening",
  "Persoonlijke betrokkenheid en korte communicatielijnen",
  "Praktische en oplossingsgerichte adviezen",
  "Focus op risico's én kansen",
  "Sterke expertise op het gebied van governance en internal audit",
  "Een integrale benadering van financiële, operationele en strategische vraagstukken",
];

export default function OverOnsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/Video_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">Over ons</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
            Betrouwbare expertise. Praktische oplossingen. Duurzame waarde.
          </h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">
            Een onafhankelijk accountants-, audit- en advieskantoor dat organisaties ondersteunt
            bij het versterken van hun financiële betrouwbaarheid, governance en prestaties.
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-6">Wie zijn wij</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Vliet Accountants & Consultants is een onafhankelijk accountants-, audit- en advieskantoor
                  dat organisaties ondersteunt bij het versterken van hun financiële betrouwbaarheid,
                  governance, risicobeheersing en prestaties.
                </p>
                <p>
                  Sinds onze oprichting hebben wij ons ontwikkeld tot een vertrouwde partner voor
                  ondernemingen, overheidsinstanties, stichtingen, verenigingen en andere organisaties
                  die behoefte hebben aan hoogwaardige dienstverlening en praktisch advies.
                </p>
                <p>
                  Onze cliënten waarderen ons om onze betrokkenheid, deskundigheid en pragmatische aanpak.
                  Wij luisteren, denken mee en zoeken naar oplossingen die niet alleen technisch juist zijn,
                  maar ook daadwerkelijk bijdragen aan het succes van de organisatie.
                </p>
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
          <h2 className="text-3xl font-bold text-navy mb-6">Onze visie</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Wij geloven dat organisaties het meest succesvol zijn wanneer zij beschikken over
              betrouwbare informatie, sterke governance, effectieve risicobeheersing en deskundige
              ondersteuning bij belangrijke beslissingen.
            </p>
            <p>
              Onze ambitie is om organisaties te helpen groeien, verbeteren en toekomstbestendig
              te worden door hoogwaardige dienstverlening te combineren met praktische inzichten
              en persoonlijke betrokkenheid.
            </p>
          </div>
        </div>
      </section>

      {/* Aangesloten bij */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">Aangesloten bij</p>
          <div className="flex flex-wrap items-center justify-center gap-20">
            <Image src="/images/cert-nba.png" alt="NBA" width={240} height={96} className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
            <div className="overflow-hidden h-24 relative opacity-70 hover:opacity-100 transition-opacity" style={{ width: '165px' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, height: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/cert-iaasb.png" alt="IAASB" style={{ height: '100%', width: 'auto', maxWidth: 'none' }} />
              </div>
            </div>
            <Image src="/images/cert-scai.png" alt="SCAI" width={240} height={96} className="h-24 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Waar wij voor staan</Badge>
            <h2 className="text-3xl font-bold text-navy">Onze kernwaarden</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
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
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Onze dienstverlening</Badge>
            <h2 className="text-3xl font-bold text-navy">Wat wij aanbieden</h2>
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
              <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Waarom Vliet</Badge>
              <h2 className="text-3xl font-bold text-navy mb-6">Waarom cliënten voor Vliet kiezen</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Onze cliënten kiezen voor Vliet Accountants & Consultants omdat wij meer bieden dan
                alleen vaktechnische expertise. Wij combineren een persoonlijke benadering met
                diepgaande kennis van audit, accountancy, governance, risicomanagement en bedrijfsvoering.
              </p>
              <ul className="space-y-3">
                {distinguishers.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Ons team</Badge>
              <h2 className="text-3xl font-bold text-navy mb-6">Onze professionals</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Ons team bestaat uit ervaren professionals met expertise op het gebied van audit,
                accountancy, fiscaliteit, governance, risicomanagement en consultancy.
              </p>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Samen bouwen aan duurzame waarde</h2>
          <p className="text-white/75 leading-relaxed mb-8">
            Bij Vliet Accountants & Consultants geloven wij in langdurige relaties gebaseerd op vertrouwen,
            kwaliteit en toegevoegde waarde. Wij kijken ernaar uit om samen met u te bouwen aan een
            sterke, beheerste en toekomstbestendige organisatie.
          </p>
          <Button asChild className="bg-gold text-white hover:bg-gold/90 font-semibold">
            <Link href="/afspraak">
              Plan een kennismaking <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Veelgestelde vragen</Badge>
            <h2 className="text-3xl font-bold text-navy">Vaak gestelde vragen over Vliet</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.map((item, index) => (
              <Card key={item.question} className="border border-gray-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy">{item.question}</h3>
                  {index === faqItems.length - 1 ? (
                    <p className="text-gray-600 leading-relaxed mt-2">
                      U kunt eenvoudig online een afspraak maken via onze{" "}
                      <Link href="/afspraak" className="text-navy font-medium underline underline-offset-2 hover:text-gold">
                        afsprakenpagina
                      </Link>
                      , of contact met ons opnemen via het{" "}
                      <Link href="/contact" className="text-navy font-medium underline underline-offset-2 hover:text-gold">
                        contactformulier
                      </Link>{" "}
                      of telefonisch.
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
