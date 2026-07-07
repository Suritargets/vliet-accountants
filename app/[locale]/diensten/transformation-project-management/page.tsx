import ServicePageLayout from "@/components/service-page-layout";

export const metadata = { title: "Transformation & Project Management | Vliet Accountants & Consultants" };

export default function TransformationPage() {
  return (
    <ServicePageLayout
      badge="Transformation & Project Management"
      title="Transformation & Project Management"
      subtitle="Van strategie naar succesvolle uitvoering"
      intro={[
        "Organisaties worden voortdurend geconfronteerd met veranderingen. Digitalisering, nieuwe wet- en regelgeving, organisatorische groei, procesverbeteringen en technologische ontwikkelingen vragen om een gestructureerde aanpak om veranderingen succesvol te realiseren.",
        "Vliet Accountants & Consultants ondersteunt organisaties bij het uitvoeren van strategische initiatieven, verandertrajecten en complexe projecten. Door effectief projectmanagement, sterke governance en een focus op beheersing helpen wij organisaties hun doelstellingen tijdig, beheerst en duurzaam te realiseren.",
        "Onze aanpak combineert projectbeheersing met risicomanagement, stakeholdermanagement en governance, waardoor wij de kans op succesvolle implementaties vergroten.",
      ]}
      services={[
        {
          title: "Project Management",
          description:
            "Wij ondersteunen organisaties bij het initiëren, plannen, uitvoeren en monitoren van projecten om een succesvolle realisatie van projectdoelstellingen te waarborgen.",
        },
        {
          title: "Programme Management",
          description:
            "Wij ondersteunen organisaties bij het coördineren, monitoren en beheersen van programma's om maximale waarde uit strategische investeringen te realiseren.",
        },
        {
          title: "Change Management",
          description:
            "Wij begeleiden organisaties bij het managen van organisatorische veranderingen, communicatie, stakeholderbetrokkenheid en adoptie van nieuwe processen en systemen.",
        },
        {
          title: "Project Governance",
          description:
            "Wij ondersteunen organisaties bij het inrichten en beoordelen van governance-structuren, besluitvormingsprocessen, rollen en verantwoordelijkheden voor projecten.",
        },
        {
          title: "Project Assurance",
          description:
            "Onze onafhankelijke project assurance werkzaamheden bieden inzicht in de beheersing van projecten. Wij beoordelen governance, risicomanagement, voortgang en budgetbeheersing.",
        },
        {
          title: "PMO Services",
          description:
            "Wij helpen organisaties bij het opzetten, versterken of tijdelijk ondersteunen van PMO-functies, inclusief rapportages, planning, kwaliteitsbewaking en portfoliomanagement.",
        },
      ]}
      whyUs={[
        "Combinatie van projectmanagement, governance en risicobeheersing",
        "Onafhankelijke en objectieve begeleiding",
        "Praktische aanpak gericht op resultaat en realisatie",
        "Ervaring met complexe verander- en implementatietrajecten",
        "Sterke focus op beheersing, transparantie en stakeholdermanagement",
        "Ondersteuning van strategie tot implementatie",
      ]}
      ctaTitle="Klaar om uw projecten en verandertrajecten succesvol te realiseren?"
      ctaText="Wij ondersteunen organisaties bij het realiseren van strategische initiatieven, complexe projecten en duurzame veranderingen. Neem contact met ons op voor een vrijblijvend gesprek."
      image="/images/Transformation & projectmanagement.jpg"
    />
  );
}
