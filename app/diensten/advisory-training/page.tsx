import ServicePageLayout from "@/components/service-page-layout";

export const metadata = { title: "Advisory & Training | Vliet Accountants & Consultants" };

export default function AdvisoryTrainingPage() {
  return (
    <ServicePageLayout
      badge="Advisory & Training"
      title="Advisory & Training"
      subtitle="Praktisch advies en kennisontwikkeling voor duurzame groei"
      intro={[
        "Succesvolle organisaties worden gekenmerkt door sterke besluitvorming, effectieve processen en medewerkers die beschikken over de juiste kennis en vaardigheden. In een steeds veranderende omgeving hebben organisaties behoefte aan deskundig advies en gerichte ontwikkeling.",
        "Vliet Accountants & Consultants ondersteunt organisaties met praktisch advies en professionele trainingen op het gebied van finance, governance, risicomanagement en bedrijfsvoering.",
        "Onze dienstverlening is gericht op het creëren van duurzame waarde door organisaties te ondersteunen bij groei, verbetering en kennisontwikkeling.",
      ]}
      services={[
        {
          title: "Business Advisory",
          description:
            "Wij bieden praktisch en resultaatgericht advies dat organisaties ondersteunt bij het maken van weloverwogen beslissingen en het realiseren van hun doelstellingen.",
        },
        {
          title: "Financial Advisory",
          description:
            "Wij ondersteunen organisaties bij financiële analyses, investeringsvraagstukken, bedrijfsplanning en het verbeteren van financiële prestaties.",
        },
        {
          title: "Business Valuations",
          description:
            "Wij voeren onafhankelijke bedrijfs- en aandelenwaarderingen uit op basis van erkende waarderingsmethodieken en marktinzichten voor investeringsbeslissingen, fusies en overnames.",
        },
        {
          title: "Process Improvement",
          description:
            "Wij analyseren bedrijfsprocessen, identificeren verbeterkansen en ondersteunen organisaties bij het optimaliseren van processen en interne beheersingsmaatregelen.",
        },
        {
          title: "Corporate Training",
          description:
            "Wij verzorgen praktijkgerichte trainingen op het gebied van audit, accountancy, financiële verslaggeving, governance, risicomanagement, interne beheersing en compliance.",
        },
        {
          title: "Leadership & Governance Workshops",
          description:
            "Onze workshops ondersteunen bestuurders, toezichthouders en managementteams bij het versterken van hun kennis, verantwoordelijkheden en besluitvormingsprocessen.",
        },
      ]}
      whyUs={[
        "Combinatie van vaktechnische expertise en praktijkervaring",
        "Praktische en resultaatgerichte aanpak",
        "Maatwerkoplossingen afgestemd op de organisatie",
        "Ervaring binnen zowel private als publieke organisaties",
        "Focus op kennisoverdracht en duurzame verbetering",
        "Ondersteuning bij zowel strategische als operationele vraagstukken",
      ]}
      ctaTitle="Klaar om uw organisatie verder te ontwikkelen?"
      ctaText="Wij helpen organisaties bij het verbeteren van prestaties, het versterken van kennis en het realiseren van duurzame groei. Neem contact met ons op voor een vrijblijvend gesprek."
      image="/images/dienst-advisory.jpg"
    />
  );
}
