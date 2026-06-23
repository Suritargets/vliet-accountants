import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, FileText, Scale, Lightbulb, FolderKanban, ArrowRight } from "lucide-react";

export const metadata = { title: "Diensten | Vliet Accountants & Consultants" };

const services = [
  {
    icon: Shield,
    title: "Audit & Assurance",
    description:
      "Onafhankelijke audit- en assurancediensten gericht op betrouwbare financiële verslaggeving, transparantie en vertrouwen.",
    href: "/diensten/audit-assurance",
  },
  {
    icon: BarChart3,
    title: "Internal Audit, Risk & Governance",
    description:
      "Ondersteuning bij governance, risicomanagement en interne beheersing door middel van onafhankelijke beoordelingen en praktische aanbevelingen.",
    href: "/diensten/internal-audit-risk-governance",
  },
  {
    icon: FileText,
    title: "Accounting & Reporting",
    description:
      "Deskundige ondersteuning bij financiële verslaggeving, jaarrekeningen, managementrapportages en complexe accountingvraagstukken.",
    href: "/diensten/accounting-reporting",
  },
  {
    icon: Scale,
    title: "Tax & Compliance",
    description:
      "Advies en ondersteuning op het gebied van fiscaliteit, belastingverplichtingen en naleving van wet- en regelgeving.",
    href: "/diensten/tax-compliance",
  },
  {
    icon: Lightbulb,
    title: "Advisory & Training",
    description:
      "Praktisch advies en professionele trainingen gericht op het verbeteren van prestaties, kennis en besluitvorming.",
    href: "/diensten/advisory-training",
  },
  {
    icon: FolderKanban,
    title: "Transformation & Project Management",
    description:
      "Begeleiding van strategische initiatieven, verandertrajecten en complexe projecten met focus op beheersing, governance en succesvolle implementatie.",
    href: "/diensten/transformation-project-management",
  },
];

export default function DienstenPage() {
  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
            Onze dienstverlening
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
            Breed pakket aan professionele diensten
          </h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">
            Wij bieden een breed pakket aan professionele diensten waarmee wij organisaties
            ondersteunen in iedere fase van hun ontwikkeling.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.href} href={service.href} className="group">
                  <Card className="h-full border border-gray-100 hover:border-navy/20 hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-xl bg-navy/5 flex items-center justify-center mb-5 group-hover:bg-navy transition-colors">
                        <Icon className="w-7 h-7 text-navy group-hover:text-white transition-colors" />
                      </div>
                      <h2 className="font-semibold text-navy text-xl mb-3">{service.title}</h2>
                      <p className="text-gray-500 leading-relaxed mb-5">{service.description}</p>
                      <div className="flex items-center gap-1 text-gold font-medium">
                        Meer lezen <ArrowRight className="w-4 h-4" />
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Heeft u een vraag over onze diensten?</h2>
          <p className="text-white/75 mb-8">
            Neem contact met ons op voor een vrijblijvend gesprek over uw uitdagingen en hoe wij u kunnen ondersteunen.
          </p>
          <Button asChild className="bg-gold text-white hover:bg-gold/90 font-semibold">
            <Link href="/contact">
              Neem contact op <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
