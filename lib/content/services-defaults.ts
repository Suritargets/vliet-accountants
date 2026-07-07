export interface ServiceContentItem {
  title: string;
  description: string;
}

export interface ServiceContent {
  badge: string;
  title: string;
  subtitle: string;
  intro: string[];
  services: ServiceContentItem[];
  whyUs: string[];
  ctaTitle: string;
  ctaText: string;
  image?: string;
}

export const SERVICE_KEYS = [
  "accounting-reporting",
  "advisory-training",
  "audit-assurance",
  "internal-audit-risk-governance",
  "tax-compliance",
  "transformation-project-management",
  "diensten-index",
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  "accounting-reporting": "Accounting & Reporting",
  "advisory-training": "Advisory & Training",
  "audit-assurance": "Audit & Assurance",
  "internal-audit-risk-governance": "Internal Audit, Risk & Governance",
  "tax-compliance": "Tax & Compliance",
  "transformation-project-management": "Transformation & Project Management",
  "diensten-index": "Diensten (overzicht)",
};

export const servicesDefaults: Record<ServiceKey, ServiceContent> = {
  "accounting-reporting": {
    badge: "Accounting & Reporting",
    title: "Accounting & Reporting",
    subtitle: "Betrouwbare financiële informatie voor effectieve besluitvorming",
    intro: [
      "Tijdige, betrouwbare en inzichtelijke financiële informatie vormt de basis voor goed bestuur en succesvolle bedrijfsvoering. Organisaties hebben behoefte aan financiële rapportages die niet alleen voldoen aan wet- en regelgeving, maar ook waardevolle inzichten bieden voor strategische en operationele besluitvorming.",
      "Vliet Accountants & Consultants ondersteunt organisaties bij financiële verslaggeving, accounting vraagstukken en managementrapportages. Wij combineren vaktechnische expertise met praktijkgerichte ondersteuning om ervoor te zorgen dat financiële informatie accuraat, relevant en bruikbaar is.",
      "Onze dienstverlening helpt organisaties bij het verbeteren van de kwaliteit van financiële rapportages, het voldoen aan verslaggevingsvereisten en het versterken van de financiële functie.",
    ],
    services: [
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
    ],
    whyUs: [
      "Diepgaande expertise in financiële verslaggeving en accounting",
      "Kennis van IFRS en andere relevante verslaggevingsstandaarden",
      "Praktische en oplossingsgerichte aanpak",
      "Ondersteuning bij zowel lokale als internationale rapportagevraagstukken",
      "Focus op betrouwbaarheid, transparantie en kwaliteit",
      "Ervaring binnen diverse sectoren en organisaties",
    ],
    ctaTitle: "Klaar om uw financiële informatievoorziening te versterken?",
    ctaText:
      "Wij helpen organisaties bij het verbeteren van financiële verslaggeving, managementinformatie en rapportageprocessen. Neem contact met ons op voor een vrijblijvend gesprek.",
    image: "/images/Accounting & Reporting.jpg",
  },
  "advisory-training": {
    badge: "Advisory & Training",
    title: "Advisory & Training",
    subtitle: "Praktisch advies en kennisontwikkeling voor duurzame groei",
    intro: [
      "Succesvolle organisaties worden gekenmerkt door sterke besluitvorming, effectieve processen en medewerkers die beschikken over de juiste kennis en vaardigheden. In een steeds veranderende omgeving hebben organisaties behoefte aan deskundig advies en gerichte ontwikkeling.",
      "Vliet Accountants & Consultants ondersteunt organisaties met praktisch advies en professionele trainingen op het gebied van finance, governance, risicomanagement en bedrijfsvoering.",
      "Onze dienstverlening is gericht op het creëren van duurzame waarde door organisaties te ondersteunen bij groei, verbetering en kennisontwikkeling.",
    ],
    services: [
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
    ],
    whyUs: [
      "Combinatie van vaktechnische expertise en praktijkervaring",
      "Praktische en resultaatgerichte aanpak",
      "Maatwerkoplossingen afgestemd op de organisatie",
      "Ervaring binnen zowel private als publieke organisaties",
      "Focus op kennisoverdracht en duurzame verbetering",
      "Ondersteuning bij zowel strategische als operationele vraagstukken",
    ],
    ctaTitle: "Klaar om uw organisatie verder te ontwikkelen?",
    ctaText:
      "Wij helpen organisaties bij het verbeteren van prestaties, het versterken van kennis en het realiseren van duurzame groei. Neem contact met ons op voor een vrijblijvend gesprek.",
    image: "/images/Advisory & Training.jpg",
  },
  "audit-assurance": {
    badge: "Audit & Assurance",
    title: "Audit & Assurance",
    subtitle: "Onafhankelijke zekerheid voor vertrouwen, transparantie en groei",
    intro: [
      "Betrouwbare financiële informatie en effectieve beheersingsmaatregelen vormen de basis voor goed bestuur, verantwoorde besluitvorming en het vertrouwen van stakeholders. Organisaties worden geconfronteerd met toenemende eisen op het gebied van transparantie, compliance en verantwoording.",
      "Vliet Accountants & Consultants levert hoogwaardige audit- en assurancediensten die organisaties ondersteunen bij het voldoen aan wettelijke verplichtingen, het beheersen van risico's en het verbeteren van de kwaliteit van hun financiële verslaggeving en interne beheersing.",
      "Door onze combinatie van vaktechnische expertise, sectorkennis en praktijkervaring helpen wij organisaties bij het vergroten van transparantie, betrouwbaarheid en duurzame waardecreatie.",
    ],
    services: [
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
    ],
    whyUs: [
      "Onafhankelijke en objectieve dienstverlening",
      "Risicogerichte auditmethodologie",
      "Sterke expertise op het gebied van governance en interne beheersing",
      "Praktische aanbevelingen met directe toegevoegde waarde",
      "Ervaring binnen zowel private als publieke organisaties",
      "Focus op kwaliteit, transparantie en vertrouwen",
    ],
    ctaTitle: "Klaar om uw organisatie verder te versterken?",
    ctaText:
      "Onze audit- en assurancediensten helpen organisaties bij het vergroten van vertrouwen, het beheersen van risico's en het versterken van de kwaliteit van financiële en operationele informatie. Neem contact met ons op voor een vrijblijvend gesprek.",
    image: "/images/Audit & Assurance.jpg",
  },
  "internal-audit-risk-governance": {
    badge: "Internal Audit, Risk & Governance",
    title: "Internal Audit, Risk & Governance",
    subtitle: "Versterking van governance, risicobeheersing en interne controle",
    intro: [
      "Organisaties opereren in een steeds complexere omgeving waarin risico's, wet- en regelgeving en verwachtingen van stakeholders voortdurend toenemen. Een effectieve governance-structuur, goed functionerend risicomanagement en een sterke interne beheersing zijn essentieel voor het realiseren van strategische doelstellingen en duurzame groei.",
      "Vliet Accountants & Consultants ondersteunt organisaties bij het versterken van hun governance, risicobeheersing en interne controleomgeving. Door middel van onafhankelijke beoordelingen, diepgaande analyses en praktische aanbevelingen helpen wij organisaties risico's tijdig te identificeren, beheersen en monitoren.",
      "Onze dienstverlening gaat verder dan het signaleren van tekortkomingen. Wij richten ons op het creëren van inzicht, het verbeteren van processen en het versterken van de beheersingsomgeving.",
    ],
    services: [
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
    ],
    whyUs: [
      "Ervaren professionals op het gebied van internal audit, governance en risicomanagement",
      "Onafhankelijke en objectieve beoordelingen",
      "Praktische aanbevelingen gericht op duurzame verbetering",
      "Risicogerichte aanpak gebaseerd op internationale best practices",
      "Ervaring binnen zowel private als publieke organisaties",
      "Focus op beheersing, transparantie en waardecreatie",
    ],
    ctaTitle: "Klaar om uw organisatie verder te versterken?",
    ctaText:
      "Wij helpen organisaties bij het verbeteren van governance, het beheersen van risico's en het versterken van interne beheersing. Neem contact met ons op voor een vrijblijvend gesprek.",
    image: "/images/Governance, Internal audit & Risk.jpg",
  },
  "tax-compliance": {
    badge: "Tax & Compliance",
    title: "Tax & Compliance",
    subtitle: "Fiscale zekerheid en compliance in een complexe omgeving",
    intro: [
      "Organisaties worden geconfronteerd met steeds veranderende fiscale wetgeving, toenemende rapportageverplichtingen en strengere eisen op het gebied van compliance. Het tijdig voldoen aan fiscale verplichtingen en het beheersen van fiscale risico's zijn essentieel voor een gezonde en duurzame bedrijfsvoering.",
      "Vliet Accountants & Consultants ondersteunt organisaties bij fiscale vraagstukken, belastingverplichtingen en compliance-uitdagingen. Wij combineren vaktechnische expertise met een praktische en oplossingsgerichte aanpak.",
      "Onze dienstverlening is gericht op het creëren van fiscale zekerheid, het voorkomen van verrassingen en het ondersteunen van een transparante en compliant bedrijfsvoering.",
    ],
    services: [
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
    ],
    whyUs: [
      "Actuele kennis van fiscale wet- en regelgeving",
      "Praktische en oplossingsgerichte advisering",
      "Integrale benadering van fiscaliteit, risico en compliance",
      "Focus op beheersing van fiscale risico's",
      "Ondersteuning bij complexe fiscale vraagstukken",
      "Onafhankelijke en professionele dienstverlening",
    ],
    ctaTitle: "Klaar om fiscale risico's te beheersen en compliance te versterken?",
    ctaText:
      "Wij ondersteunen organisaties bij fiscale vraagstukken, belastingverplichtingen en compliance-uitdagingen. Neem contact met ons op voor een vrijblijvend gesprek.",
    image: "/images/Tax & compliance.jpg",
  },
  "transformation-project-management": {
    badge: "Transformation & Project Management",
    title: "Transformation & Project Management",
    subtitle: "Van strategie naar succesvolle uitvoering",
    intro: [
      "Organisaties worden voortdurend geconfronteerd met veranderingen. Digitalisering, nieuwe wet- en regelgeving, organisatorische groei, procesverbeteringen en technologische ontwikkelingen vragen om een gestructureerde aanpak om veranderingen succesvol te realiseren.",
      "Vliet Accountants & Consultants ondersteunt organisaties bij het uitvoeren van strategische initiatieven, verandertrajecten en complexe projecten. Door effectief projectmanagement, sterke governance en een focus op beheersing helpen wij organisaties hun doelstellingen tijdig, beheerst en duurzaam te realiseren.",
      "Onze aanpak combineert projectbeheersing met risicomanagement, stakeholdermanagement en governance, waardoor wij de kans op succesvolle implementaties vergroten.",
    ],
    services: [
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
    ],
    whyUs: [
      "Combinatie van projectmanagement, governance en risicobeheersing",
      "Onafhankelijke en objectieve begeleiding",
      "Praktische aanpak gericht op resultaat en realisatie",
      "Ervaring met complexe verander- en implementatietrajecten",
      "Sterke focus op beheersing, transparantie en stakeholdermanagement",
      "Ondersteuning van strategie tot implementatie",
    ],
    ctaTitle: "Klaar om uw projecten en verandertrajecten succesvol te realiseren?",
    ctaText:
      "Wij ondersteunen organisaties bij het realiseren van strategische initiatieven, complexe projecten en duurzame veranderingen. Neem contact met ons op voor een vrijblijvend gesprek.",
    image: "/images/Transformation & projectmanagement.jpg",
  },
  "diensten-index": {
    badge: "Onze dienstverlening",
    title: "Breed pakket aan professionele diensten",
    subtitle:
      "Wij bieden een breed pakket aan professionele diensten waarmee wij organisaties ondersteunen in iedere fase van hun ontwikkeling.",
    intro: [],
    services: [
      {
        title: "Accounting & Reporting",
        description:
          "Deskundige ondersteuning bij financiële verslaggeving, jaarrekeningen, managementrapportages en complexe accountingvraagstukken.",
      },
      {
        title: "Advisory & Training",
        description:
          "Praktisch advies en professionele trainingen gericht op het verbeteren van prestaties, kennis en besluitvorming.",
      },
      {
        title: "Audit & Assurance",
        description:
          "Onafhankelijke audit- en assurancediensten gericht op betrouwbare financiële verslaggeving, transparantie en vertrouwen.",
      },
      {
        title: "Internal Audit, Risk & Governance",
        description:
          "Ondersteuning bij governance, risicomanagement en interne beheersing door middel van onafhankelijke beoordelingen en praktische aanbevelingen.",
      },
      {
        title: "Tax & Compliance",
        description:
          "Advies en ondersteuning op het gebied van fiscaliteit, belastingverplichtingen en naleving van wet- en regelgeving.",
      },
      {
        title: "Transformation & Project Management",
        description:
          "Begeleiding van strategische initiatieven, verandertrajecten en complexe projecten met focus op beheersing, governance en succesvolle implementatie.",
      },
    ],
    whyUs: [],
    ctaTitle: "Heeft u een vraag over onze diensten?",
    ctaText:
      "Neem contact met ons op voor een vrijblijvend gesprek over uw uitdagingen en hoe wij u kunnen ondersteunen.",
  },
};
