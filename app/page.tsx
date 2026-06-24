import Link from "next/link";
import Image from "next/image";
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

const services = [
  {
    icon: Shield,
    title: "Audit & Assurance",
    description:
      "Onafhankelijke en kwalitatieve auditdiensten gericht op betrouwbare financiële verslaggeving en effectieve interne beheersing.",
    href: "/diensten/audit-assurance",
  },
  {
    icon: BarChart3,
    title: "Internal Audit & Governance",
    description:
      "Versterking van governance en interne beheersing door internal audit, risk assessments en evaluatie van beheersmaatregelen.",
    href: "/diensten/internal-audit-risk-governance",
  },
  {
    icon: FileText,
    title: "Accounting & Reporting",
    description:
      "Ondersteuning bij financiële verslaggeving, jaarrekeningen en compliance voor betrouwbare en tijdige rapportages.",
    href: "/diensten/accounting-reporting",
  },
  {
    icon: Scale,
    title: "Tax & Compliance",
    description:
      "Specialistisch belastingadvies en ondersteuning bij fiscale en wettelijke verplichtingen om risico's te beheersen.",
    href: "/diensten/tax-compliance",
  },
  {
    icon: Lightbulb,
    title: "Advisory & Risk Management",
    description:
      "Strategisch financieel advies gericht op waardecreatie, risicobeheersing en performance verbetering.",
    href: "/diensten/advisory-training",
  },
  {
    icon: FolderKanban,
    title: "Consultancy & Training",
    description:
      "Advies en maatwerktrainingen op het gebied van corporate governance, compliance en interne beheersing.",
    href: "/diensten/transformation-project-management",
  },
];

const teamMembers = [
  { name: "Guillaume Vliet MSc RA CA", role: "Managing Director", linkedin: "#", photo: "/images/team-1.jpeg" },
  { name: "Majugra Andias MoA", role: "Supervisor", linkedin: "#", photo: "/images/team-2.jpg" },
  { name: "Natasha Anylus", role: "Senior Consultant", linkedin: "#", photo: "/images/team-3.jpg" },
];

const highlights = [
  "Lokale expertise gecombineerd met internationale standaarden",
  "Proactieve advisering en risicogerichte aanpak",
  "Maatwerkoplossingen afgestemd op uw organisatie",
  "Focus op kwaliteit, compliance en duurzame waardecreatie",
];

export default function HomePage() {
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
              Audit · Accountancy · Strategisch Advies
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Kwaliteit in cijfers.{" "}
              <span className="text-gold">Waarde in elke beslissing.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              Uw specialist in audit, accountancy en strategisch financieel advies.
              Wij combineren diepgaande expertise met een proactieve aanpak om
              risico&apos;s te beheersen en duurzame groei te realiseren.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gold text-white hover:bg-gold/90 font-semibold px-8">
                <Link href="/contact">Plan een kennismaking</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10">
                <Link href="/diensten">Onze diensten</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15+", label: "Jaar ervaring" },
              { value: "100+", label: "Tevreden cliënten" },
              { value: "6", label: "Dienstverleningen" },
              { value: "100%", label: "Onafhankelijk" },
            ].map((stat) => (
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
              <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Over ons</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 leading-tight">
                Meer dan cijfers: wij creëren financiële waarde
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Vliet Accountants & Consultants ondersteunt organisaties met hoogwaardige audit-,
                accountancy- en adviesdiensten. Met diepgaande expertise en een proactieve aanpak
                helpen wij u om risico&apos;s te beheersen, prestaties te verbeteren en duurzame
                groei te realiseren.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Goed advies begint met luisteren. Daarom denken wij actief met u mee, signaleren
                wij risico&apos;s tijdig en vertalen wij inzichten naar concrete, werkbare oplossingen.
              </p>
              <ul className="space-y-3 mb-8">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-navy text-white hover:bg-navy/90">
                <Link href="/over-ons">
                  Meer over ons <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative space-y-6">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/team-office.jpeg"
                  alt="Vliet Accountants kantoor"
                  width={640}
                  height={400}
                  className="w-full h-72 object-cover"
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Aangesloten bij</p>
                <div className="flex items-center justify-around gap-4">
                  <Image src="/images/cert-nba.png" alt="NBA" width={100} height={40} className="h-9 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                  <Image src="/images/cert-iaasb.png" alt="IAASB" width={120} height={40} className="h-9 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                  <Image src="/images/cert-scai.png" alt="SCAI" width={100} height={40} className="h-9 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diensten */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Onze dienstverlening</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Wat wij voor u kunnen betekenen</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Een breed pakket aan professionele diensten om organisaties te ondersteunen in iedere fase van hun ontwikkeling.
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
                        Meer lezen <ArrowRight className="w-3.5 h-3.5" />
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
            <Badge className="mb-4 bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">Ons team</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Ervaren professionals, gericht op kwaliteit en resultaat
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Ons team bestaat uit ervaren professionals met expertise in audit, accountancy en advies.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {teamMembers.map((member) => (
              <Card key={member.name} className="border border-gray-100 hover:shadow-md transition-shadow text-center overflow-hidden">
                <div className="w-full h-48 relative">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klaar om waarde te creëren voor uw organisatie?
          </h2>
          <p className="text-white/75 text-lg mb-10 leading-relaxed">
            Wij combineren kwaliteit, inzicht en ervaring om organisaties te ondersteunen bij audit,
            accountancy en strategisch advies. Plan een vrijblijvend gesprek en ontdek wat wij voor
            u kunnen betekenen.
          </p>
          <Button asChild size="lg" className="bg-gold text-white hover:bg-gold/90 font-semibold px-10">
            <Link href="/contact">Plan een kennismaking</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
