// Static NL defaults for the homepage's admin-editable sections, extracted
// from the original hardcoded page. The DB (homepage_content) only ever holds
// overrides on top of this — an empty DB never blanks the site.

export interface HomepageStat {
  value: string;
  label: string;
}

export interface HomepageContent {
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: HomepageStat[];
  about: {
    badge: string;
    title: string;
    paragraphs: string[];
    highlights: string[];
    buttonLabel: string;
  };
  servicesTeaser: {
    badge: string;
    title: string;
    subtitle: string;
    readMore: string;
  };
  team: {
    badge: string;
    title: string;
    subtitle: string;
  };
  cta: {
    title: string;
    text: string;
    buttonLabel: string;
  };
}

export const HOMEPAGE_SECTIONS = [
  "hero",
  "stats",
  "about",
  "servicesTeaser",
  "team",
  "cta",
] as const satisfies readonly (keyof HomepageContent)[];

export const homepageDefaults: HomepageContent = {
  hero: {
    badge: "Audit · Accountancy · Strategisch Advies",
    titleLead: "Kwaliteit in cijfers.",
    titleAccent: "Waarde in elke beslissing.",
    subtitle:
      "Uw specialist in audit, accountancy en strategisch financieel advies. Wij combineren diepgaande expertise met een proactieve aanpak om risico's te beheersen en duurzame groei te realiseren.",
    ctaPrimary: "Plan een kennismaking",
    ctaSecondary: "Onze diensten",
  },
  stats: [
    { value: "15+", label: "Jaar ervaring" },
    { value: "100+", label: "Tevreden cliënten" },
    { value: "6", label: "Dienstverleningen" },
    { value: "100%", label: "Onafhankelijk" },
  ],
  about: {
    badge: "Over ons",
    title: "Meer dan cijfers: wij creëren financiële waarde",
    paragraphs: [
      "Vliet Accountants & Consultants ondersteunt organisaties met hoogwaardige audit-, accountancy- en adviesdiensten. Met diepgaande expertise en een proactieve aanpak helpen wij u om risico's te beheersen, prestaties te verbeteren en duurzame groei te realiseren.",
      "Goed advies begint met luisteren. Daarom denken wij actief met u mee, signaleren wij risico's tijdig en vertalen wij inzichten naar concrete, werkbare oplossingen.",
    ],
    highlights: [
      "Lokale expertise gecombineerd met internationale standaarden",
      "Proactieve advisering en risicogerichte aanpak",
      "Maatwerkoplossingen afgestemd op uw organisatie",
      "Focus op kwaliteit, compliance en duurzame waardecreatie",
    ],
    buttonLabel: "Meer over ons",
  },
  servicesTeaser: {
    badge: "Onze dienstverlening",
    title: "Wat wij voor u kunnen betekenen",
    subtitle:
      "Een breed pakket aan professionele diensten om organisaties te ondersteunen in iedere fase van hun ontwikkeling.",
    readMore: "Meer lezen",
  },
  team: {
    badge: "Ons team",
    title: "Ervaren professionals, gericht op kwaliteit en resultaat",
    subtitle:
      "Ons team bestaat uit ervaren professionals met expertise in audit, accountancy en advies.",
  },
  cta: {
    title: "Klaar om waarde te creëren voor uw organisatie?",
    text: "Wij combineren kwaliteit, inzicht en ervaring om organisaties te ondersteunen bij audit, accountancy en strategisch advies. Plan een vrijblijvend gesprek en ontdek wat wij voor u kunnen betekenen.",
    buttonLabel: "Plan een kennismaking",
  },
};
