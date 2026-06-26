import ServicePageLayout from "@/components/service-page-layout";

export const metadata = { title: "Internal Audit, Risk & Governance | Vliet Accountants & Consultants" };

export default function InternalAuditPage() {
  return (
    <ServicePageLayout
      badge="Internal Audit, Risk & Governance"
      title="Internal Audit, Risk & Governance"
      subtitle="Versterking van governance, risicobeheersing en interne controle"
      intro={[
        "Organisaties opereren in een steeds complexere omgeving waarin risico's, wet- en regelgeving en verwachtingen van stakeholders voortdurend toenemen. Een effectieve governance-structuur, goed functionerend risicomanagement en een sterke interne beheersing zijn essentieel voor het realiseren van strategische doelstellingen en duurzame groei.",
        "Vliet Accountants & Consultants ondersteunt organisaties bij het versterken van hun governance, risicobeheersing en interne controleomgeving. Door middel van onafhankelijke beoordelingen, diepgaande analyses en praktische aanbevelingen helpen wij organisaties risico's tijdig te identificeren, beheersen en monitoren.",
        "Onze dienstverlening gaat verder dan het signaleren van tekortkomingen. Wij richten ons op het creëren van inzicht, het verbeteren van processen en het versterken van de beheersingsomgeving.",
      ]}
      services={[
        {
          title: "Internal Audit Services",
          description:
            "Interne audits bieden onafhankelijke zekerheid over de effectiviteit van governance, risicomanagement en interne beheersing. Wij voeren operationele, financiële, compliance- en procesaudits uit.",
        },
        {
          title: "Internal Audit Outsourcing & Co-Sourcing",
          description:
            "Wij bieden ondersteuning door middel van outsourcing of co-sourcing van internal auditactiviteiten. Hiermee krijgen organisaties toegang tot ervaren auditprofessionals en specialistische expertise.",
        },
        {
          title: "Enterprise Risk Management (ERM)",
          description:
            "Wij ondersteunen organisaties bij het identificeren, analyseren, evalueren en monitoren van risico's en het implementeren van een geïntegreerd Enterprise Risk Management framework.",
        },
        {
          title: "Governance Reviews",
          description:
            "Onze governance reviews beoordelen de effectiviteit van governance-structuren, besluitvormingsprocessen, verantwoordelijkheden en toezichtmechanismen.",
        },
        {
          title: "Internal Control Reviews",
          description:
            "Wij beoordelen de opzet, het bestaan en de werking van interne controles en doen aanbevelingen om de effectiviteit van de beheersingsomgeving verder te versterken.",
        },
        {
          title: "Compliance Reviews",
          description:
            "Wij voeren onafhankelijke beoordelingen uit van compliance-processen, interne beleidslijnen en wettelijke verplichtingen zodat organisaties inzicht krijgen in compliance-risico's.",
        },
      ]}
      whyUs={[
        "Ervaren professionals op het gebied van internal audit, governance en risicomanagement",
        "Onafhankelijke en objectieve beoordelingen",
        "Praktische aanbevelingen gericht op duurzame verbetering",
        "Risicogerichte aanpak gebaseerd op internationale best practices",
        "Ervaring binnen zowel private als publieke organisaties",
        "Focus op beheersing, transparantie en waardecreatie",
      ]}
      ctaTitle="Klaar om uw organisatie verder te versterken?"
      ctaText="Wij helpen organisaties bij het verbeteren van governance, het beheersen van risico's en het versterken van interne beheersing. Neem contact met ons op voor een vrijblijvend gesprek."
      image="/images/dienst-internal-audit.jpg"
    />
  );
}
