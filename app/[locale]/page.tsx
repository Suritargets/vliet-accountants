import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  BarChart3,
  FileText,
  Scale,
  Lightbulb,
  FolderKanban,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { LinkedInIcon } from "@/components/social-icons";
import { getHomepage } from "@/lib/content/queries";

export const dynamic = "force-dynamic";

const services = [
  {
    icon: FileText,
    title: "Accounting & Reporting",
    description:
      "Ondersteuning bij financiële verslaggeving, jaarrekeningen en compliance voor betrouwbare en tijdige rapportages.",
    href: "/diensten/accounting-reporting",
  },
  {
    icon: Lightbulb,
    title: "Advisory & Training",
    description:
      "Strategisch financieel advies gericht op waardecreatie, risicobeheersing en performance verbetering.",
    href: "/diensten/advisory-training",
  },
  {
    icon: Shield,
    title: "Audit & Assurance",
    description:
      "Onafhankelijke en kwalitatieve auditdiensten gericht op betrouwbare financiële verslaggeving en effectieve interne beheersing.",
    href: "/diensten/audit-assurance",
  },
  {
    icon: BarChart3,
    title: "Internal Audit, Risk & Governance",
    description:
      "Versterking van governance en interne beheersing door internal audit, risk assessments en evaluatie van beheersmaatregelen.",
    href: "/diensten/internal-audit-risk-governance",
  },
  {
    icon: Scale,
    title: "Tax & Compliance",
    description:
      "Specialistisch belastingadvies en ondersteuning bij fiscale en wettelijke verplichtingen om risico's te beheersen.",
    href: "/diensten/tax-compliance",
  },
  {
    icon: FolderKanban,
    title: "Transformation & Project Management",
    description:
      "Advies en maatwerktrainingen op het gebied van corporate governance, compliance en interne beheersing.",
    href: "/diensten/transformation-project-management",
  },
];

const teamMembers = [
  { name: "Guillaume Vliet MSc RA CA", role: "Managing Director", linkedin: "#", photo: "/images/team-1.jpeg", position: "object-top" },
  { name: "Majugra Andias MoA", role: "Supervisor", linkedin: "#", photo: "/images/team-2.jpg", position: "object-top" },
  { name: "Natasha Anylus", role: "Senior Consultant", linkedin: "#", photo: "/images/natasha 1.jpeg", position: "object-[center_15%]" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getHomepage(locale);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/website.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
              {content.hero.badge}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {content.hero.titleLead}{" "}
              <span className="text-gold">{content.hero.titleAccent}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gold text-white hover:bg-gold/90 font-semibold px-8">
                <Link href="/afspraak">{content.hero.ctaPrimary}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10">
                <Link href="/diensten">{content.hero.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {content.stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-navy">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Over ons preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">
                {content.about.badge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 leading-tight">
                {content.about.title}
              </h2>
              {content.about.paragraphs.map((paragraph, i) => (
                <p key={i} className={`text-gray-600 leading-relaxed ${i === content.about.paragraphs.length - 1 ? "mb-8" : "mb-4"}`}>
                  {paragraph}
                </p>
              ))}
              <ul className="space-y-3 mb-8">
                {content.about.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-navy text-white hover:bg-navy/90">
                <Link href="/over-ons">
                  {content.about.buttonLabel} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative space-y-6">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/Voorpagina.jpg"
                  alt="Vliet Accountants"
                  width={640}
                  height={400}
                  className="w-full h-72 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diensten */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">
              {content.servicesTeaser.badge}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              {content.servicesTeaser.title}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {content.servicesTeaser.subtitle}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.href} href={service.href} className="group">
                  <Card className="h-full border border-gray-100 hover:border-navy/20 hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-4 group-hover:bg-navy transition-colors">
                        <Icon className="w-6 h-6 text-navy group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-navy text-lg mb-2">{service.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.description}</p>
                      <div className="flex items-center gap-1 text-gold text-sm font-medium">
                        {content.servicesTeaser.readMore} <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">
              {content.team.badge}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              {content.team.title}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{content.team.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {teamMembers.map((member) => (
              <Card key={member.name} className="border border-gray-100 hover:shadow-md transition-shadow text-center overflow-hidden">
                <div className="w-full h-48 relative">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className={`object-cover ${member.position}`}
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy text-sm leading-tight mb-1">{member.name}</h3>
                  <p className="text-gray-500 text-xs mb-4">{member.role}</p>
                  <a href={member.linkedin} className="inline-flex items-center gap-1.5 text-xs text-navy/60 hover:text-gold transition-colors">
                    <LinkedInIcon className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{content.cta.title}</h2>
          <p className="text-white/75 text-lg mb-10 leading-relaxed">{content.cta.text}</p>
          <Button asChild size="lg" className="bg-gold text-white hover:bg-gold/90 font-semibold px-10">
            <Link href="/afspraak">{content.cta.buttonLabel}</Link>
          </Button>
        </div>
      </section>

      {/* Aangesloten bij */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">Aangesloten bij</p>
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
    </>
  );
}
