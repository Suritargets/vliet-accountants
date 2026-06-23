import ServicePageLayout from "@/components/service-page-layout";

export const metadata = { title: "Audit & Assurance | Vliet Accountants & Consultants" };

export default function AuditAssurancePage() {
  return (
    <ServicePageLayout
      badge="Audit & Assurance"
      title="Audit & Assurance"
      subtitle="Onafhankelijke zekerheid voor vertrouwen, transparantie en groei"
      intro={[
        "Betrouwbare financiële informatie en effectieve beheersingsmaatregelen vormen de basis voor goed bestuur, verantwoorde besluitvorming en het vertrouwen van stakeholders. Organisaties worden geconfronteerd met toenemende eisen op het gebied van transparantie, compliance en verantwoording.",
        "Vliet Accountants & Consultants levert hoogwaardige audit- en assurancediensten die organisaties ondersteunen bij het voldoen aan wettelijke verplichtingen, het beheersen van risico's en het verbeteren van de kwaliteit van hun financiële verslaggeving en interne beheersing.",
        "Door onze combinatie van vaktechnische expertise, sectorkennis en praktijkervaring helpen wij organisaties bij het vergroten van transparantie, betrouwbaarheid en duurzame waardecreatie.",
      ]}
      services={[
        {
          title: "Controle van jaarrekeningen",
          description:
            "Een betrouwbare jaarrekening is essentieel voor aandeelhouders, financiers, toezichthouders en andere stakeholders. Wij voeren onafhankelijke controles uit conform de toepasselijke wet- en regelgeving en verslaggevingsstandaarden.",
        },
        {
          title: "Bijzondere controleopdrachten",
          description:
            "Naast reguliere jaarrekeningcontroles voeren wij controles uit op specifieke financiële verantwoordingen en rapportages, waaronder subsidieafrekeningen, projectverantwoordingen en contractuele rapportages.",
        },
        {
          title: "Agreed-Upon Procedures",
          description:
            "Soms bestaat behoefte aan onderzoek naar specifieke onderwerpen zonder dat een assurance-oordeel wordt verstrekt. Wij voeren vooraf overeengekomen werkzaamheden uit en rapporteren uitsluitend onze feitelijke bevindingen.",
        },
        {
          title: "Overige assurance-opdrachten",
          description:
            "Wij verstrekken zekerheid over financiële en niet-financiële informatie, processen en beheersingsmaatregelen ter ondersteuning van stakeholders, financiers en toezichthouders.",
        },
        {
          title: "IT Audits",
          description:
            "Onze IT-audits bieden inzicht in de betrouwbaarheid, beschikbaarheid en beveiliging van informatiesystemen en de effectiviteit van IT-beheersingsmaatregelen.",
        },
      ]}
      whyUs={[
        "Onafhankelijke en objectieve dienstverlening",
        "Risicogerichte auditmethodologie",
        "Sterke expertise op het gebied van governance en interne beheersing",
        "Praktische aanbevelingen met directe toegevoegde waarde",
        "Ervaring binnen zowel private als publieke organisaties",
        "Focus op kwaliteit, transparantie en vertrouwen",
      ]}
      ctaTitle="Klaar om uw organisatie verder te versterken?"
      ctaText="Onze audit- en assurancediensten helpen organisaties bij het vergroten van vertrouwen, het beheersen van risico's en het versterken van de kwaliteit van financiële en operationele informatie. Neem contact met ons op voor een vrijblijvend gesprek."
    />
  );
}
