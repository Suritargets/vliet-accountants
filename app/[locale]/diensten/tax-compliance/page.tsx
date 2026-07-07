import ServicePageLayout from "@/components/service-page-layout";

export const metadata = { title: "Tax & Compliance | Vliet Accountants & Consultants" };

export default function TaxCompliancePage() {
  return (
    <ServicePageLayout
      badge="Tax & Compliance"
      title="Tax & Compliance"
      subtitle="Fiscale zekerheid en compliance in een complexe omgeving"
      intro={[
        "Organisaties worden geconfronteerd met steeds veranderende fiscale wetgeving, toenemende rapportageverplichtingen en strengere eisen op het gebied van compliance. Het tijdig voldoen aan fiscale verplichtingen en het beheersen van fiscale risico's zijn essentieel voor een gezonde en duurzame bedrijfsvoering.",
        "Vliet Accountants & Consultants ondersteunt organisaties bij fiscale vraagstukken, belastingverplichtingen en compliance-uitdagingen. Wij combineren vaktechnische expertise met een praktische en oplossingsgerichte aanpak.",
        "Onze dienstverlening is gericht op het creëren van fiscale zekerheid, het voorkomen van verrassingen en het ondersteunen van een transparante en compliant bedrijfsvoering.",
      ]}
      services={[
        {
          title: "Corporate Tax Advisory",
          description:
            "Wij adviseren organisaties over uiteenlopende fiscale vraagstukken en helpen bij het ontwikkelen van fiscaal efficiënte oplossingen die aansluiten bij de doelstellingen van de organisatie.",
        },
        {
          title: "Tax Compliance",
          description:
            "Wij ondersteunen bij het voorbereiden, beoordelen en indienen van belastingaangiften en helpen organisaties te voldoen aan de relevante fiscale wet- en regelgeving.",
        },
        {
          title: "Payroll Tax Services",
          description:
            "Wij adviseren en ondersteunen organisaties bij loonheffingen, personeelsgerelateerde fiscale vraagstukken en compliance met arbeidsgerelateerde fiscale regelgeving.",
        },
        {
          title: "Tax Risk Management",
          description:
            "Wij helpen organisaties bij het identificeren, beoordelen en beheersen van fiscale risico's door middel van reviews, risicoanalyses en versterking van fiscale beheersingsmaatregelen.",
        },
        {
          title: "Tax Reviews & Assessments",
          description:
            "Door middel van onafhankelijke fiscale beoordelingen brengen wij potentiële risico's, aandachtspunten en verbeterkansen in kaart.",
        },
        {
          title: "Regulatory Compliance",
          description:
            "Wij ondersteunen organisaties bij het beoordelen van compliance-risico's, het versterken van compliance-processen en het bevorderen van een cultuur van naleving en integriteit.",
        },
      ]}
      whyUs={[
        "Actuele kennis van fiscale wet- en regelgeving",
        "Praktische en oplossingsgerichte advisering",
        "Integrale benadering van fiscaliteit, risico en compliance",
        "Focus op beheersing van fiscale risico's",
        "Ondersteuning bij complexe fiscale vraagstukken",
        "Onafhankelijke en professionele dienstverlening",
      ]}
      ctaTitle="Klaar om fiscale risico's te beheersen en compliance te versterken?"
      ctaText="Wij ondersteunen organisaties bij fiscale vraagstukken, belastingverplichtingen en compliance-uitdagingen. Neem contact met ons op voor een vrijblijvend gesprek."
      image="/images/Tax & compliance.jpg"
    />
  );
}
