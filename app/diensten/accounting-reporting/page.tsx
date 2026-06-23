import ServicePageLayout from "@/components/service-page-layout";

export const metadata = { title: "Accounting & Reporting | Vliet Accountants & Consultants" };

export default function AccountingReportingPage() {
  return (
    <ServicePageLayout
      badge="Accounting & Reporting"
      title="Accounting & Reporting"
      subtitle="Betrouwbare financiële informatie voor effectieve besluitvorming"
      intro={[
        "Tijdige, betrouwbare en inzichtelijke financiële informatie vormt de basis voor goed bestuur en succesvolle bedrijfsvoering. Organisaties hebben behoefte aan financiële rapportages die niet alleen voldoen aan wet- en regelgeving, maar ook waardevolle inzichten bieden voor strategische en operationele besluitvorming.",
        "Vliet Accountants & Consultants ondersteunt organisaties bij financiële verslaggeving, accounting vraagstukken en managementrapportages. Wij combineren vaktechnische expertise met praktijkgerichte ondersteuning om ervoor te zorgen dat financiële informatie accuraat, relevant en bruikbaar is.",
        "Onze dienstverlening helpt organisaties bij het verbeteren van de kwaliteit van financiële rapportages, het voldoen aan verslaggevingsvereisten en het versterken van de financiële functie.",
      ]}
      services={[
        {
          title: "Jaarrekeningvoorbereiding",
          description:
            "Wij ondersteunen organisaties bij het samenstellen en voorbereiden van jaarrekeningen die voldoen aan de toepasselijke regelgeving en de informatiebehoeften van stakeholders.",
        },
        {
          title: "Financial Reporting",
          description:
            "Wij ondersteunen organisaties bij het opstellen van periodieke financiële rapportages, managementrapportages en externe verslaggeving die inzicht bieden in prestaties, risico's en financiële positie.",
        },
        {
          title: "IFRS Advisory & Reporting",
          description:
            "Wij adviseren en ondersteunen bij de toepassing van International Financial Reporting Standards (IFRS), implementaties van nieuwe standaarden en complexe verslaggevingsvraagstukken.",
        },
        {
          title: "Consolidatie & Group Reporting",
          description:
            "Voor groepen van ondernemingen verzorgen wij ondersteuning bij consolidaties en concernrapportages, inclusief het inrichten van efficiënte rapportageprocessen binnen de groep.",
        },
        {
          title: "Management Reporting & Dashboards",
          description:
            "Wij ondersteunen organisaties bij het ontwikkelen van managementrapportages, KPI-rapportages en dashboards die inzicht bieden in prestaties, trends en risico's.",
        },
        {
          title: "Accounting Advisory Services",
          description:
            "Wij adviseren organisaties over verslaggevingsvraagstukken, accounting policies, financiële processen en de toepassing van relevante verslaggevingsstandaarden.",
        },
      ]}
      whyUs={[
        "Diepgaande expertise in financiële verslaggeving en accounting",
        "Kennis van IFRS en andere relevante verslaggevingsstandaarden",
        "Praktische en oplossingsgerichte aanpak",
        "Ondersteuning bij zowel lokale als internationale rapportagevraagstukken",
        "Focus op betrouwbaarheid, transparantie en kwaliteit",
        "Ervaring binnen diverse sectoren en organisaties",
      ]}
      ctaTitle="Klaar om uw financiële informatievoorziening te versterken?"
      ctaText="Wij helpen organisaties bij het verbeteren van financiële verslaggeving, managementinformatie en rapportageprocessen. Neem contact met ons op voor een vrijblijvend gesprek."
    />
  );
}
