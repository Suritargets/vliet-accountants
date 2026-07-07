// Idempotent seed: weekly availability, the two legal CMS pages (content
// taken verbatim from the former static pages) and the two existing
// vacancies. Run with `npm run db:seed` (requires DATABASE_URL).
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import {
  availabilityConfig,
  pages,
  vacancies,
} from "../drizzle/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — vul .env.local in en probeer opnieuw.");
  process.exit(1);
}
const db = drizzle(neon(url));

const PRIVACY_MD = `## 1. Inleiding

Vliet Accountants & Consultants (hierna: "wij", "ons" of "onze") hecht groot belang aan de bescherming van uw persoonsgegevens. In deze Privacy Policy informeren wij u over de wijze waarop wij persoonsgegevens verzamelen, gebruiken, opslaan en beschermen in overeenstemming met de toepasselijke wet- en regelgeving.

## 2. Verantwoordelijke

De verantwoordelijke voor de verwerking van uw persoonsgegevens is:

**Vliet Accountants & Consultants**
Wagenwegstraat 51, Suriname
E-mail: info@vlietaccountants.com
Telefoon: +597 720 2090

## 3. Welke gegevens verzamelen wij?

Wij kunnen de volgende persoonsgegevens verwerken:

- Naam en contactgegevens (e-mailadres, telefoonnummer)
- Bedrijfsnaam en functie
- Inhoud van berichten die u via ons contactformulier stuurt
- Technische gegevens (IP-adres, browsertype, paginabezoeken) via cookies

## 4. Doeleinden van verwerking

Wij verwerken uw persoonsgegevens voor de volgende doeleinden:

- Het beantwoorden van uw vragen en verzoeken via het contactformulier
- Het uitvoeren van onze dienstverlening (audit, accountancy en advies)
- Het voldoen aan wettelijke verplichtingen
- Het verbeteren van onze website en dienstverlening
- Het versturen van relevante informatie indien u daarvoor toestemming heeft gegeven

## 5. Grondslag voor verwerking

Wij verwerken uw persoonsgegevens op basis van:

- **Toestemming** – wanneer u ons contactformulier invult of cookies accepteert
- **Uitvoering van een overeenkomst** – voor het leveren van onze diensten
- **Wettelijke verplichting** – voor de naleving van regelgeving
- **Gerechtvaardigd belang** – voor het verbeteren van onze dienstverlening

## 6. Bewaartermijn

Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor zij zijn verzameld, tenzij een langere bewaartermijn wettelijk vereist is. Financiële en boekhoudkundige gegevens worden bewaard conform de wettelijke bewaarplicht van 7 jaar.

## 7. Cookies

Onze website maakt gebruik van cookies om uw gebruikerservaring te verbeteren. U kunt uw cookievoorkeuren beheren via de cookiebanner op onze website. Voor meer informatie over de cookies die wij gebruiken, kunt u contact met ons opnemen.

## 8. Delen met derden

Wij verkopen uw persoonsgegevens niet aan derden. Wij kunnen uw gegevens delen met verwerkers die namens ons diensten verlenen (zoals IT-dienstverleners), uitsluitend voor de in deze Privacy Policy genoemde doeleinden en op basis van een verwerkersovereenkomst.

## 9. Uw rechten

U heeft de volgende rechten met betrekking tot uw persoonsgegevens:

- Recht op inzage in uw persoonsgegevens
- Recht op rectificatie van onjuiste gegevens
- Recht op verwijdering van uw gegevens
- Recht op beperking van de verwerking
- Recht op overdraagbaarheid van gegevens
- Recht om bezwaar te maken tegen verwerking

Om gebruik te maken van uw rechten kunt u contact opnemen via info@vlietaccountants.com. Wij reageren binnen 30 dagen op uw verzoek.

## 10. Beveiliging

Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen ongeautoriseerde toegang, verlies of misbruik.

## 11. Wijzigingen

Wij behouden ons het recht voor deze Privacy Policy te wijzigen. De meest actuele versie is altijd beschikbaar op onze website. Wij raden u aan deze pagina regelmatig te raadplegen.

## 12. Contact

Voor vragen over deze Privacy Policy kunt u contact opnemen via:
[info@vlietaccountants.com](mailto:info@vlietaccountants.com) | +597 720 2090
`;

const VOORWAARDEN_MD = `## 1. Algemeen

Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes en overeenkomsten van Vliet Accountants & Consultants (hierna: "Vliet"), gevestigd te Wagenwegstraat 51, Suriname. Door gebruik te maken van onze diensten verklaart u zich akkoord met deze voorwaarden.

## 2. Dienstverlening

Vliet verleent professionele diensten op het gebied van audit & assurance, internal audit, accounting & reporting, tax & compliance, advisory & training en transformation & project management. Alle werkzaamheden worden uitgevoerd conform de geldende beroeps- en gedragsregels en de toepasselijke wet- en regelgeving.

## 3. Offertes en overeenkomsten

Alle offertes van Vliet zijn vrijblijvend en geldig gedurende 30 dagen, tenzij anders vermeld. Een overeenkomst komt tot stand op het moment dat de opdrachtbevestiging door beide partijen is ondertekend, dan wel wanneer Vliet een begin maakt met de uitvoering van de werkzaamheden.

## 4. Verplichtingen van de cliënt

De cliënt is verplicht:

- Alle voor de uitvoering van de opdracht benodigde informatie tijdig en volledig aan te leveren
- Vliet te informeren over relevante wijzigingen in de bedrijfssituatie
- Mee te werken aan de uitvoering van de opdracht
- Betaling te voldoen conform de overeengekomen betalingstermijnen

## 5. Honorarium en betaling

Het honorarium wordt vastgesteld op basis van de bestede tijd, het gehanteerde uurtarief en/of een vaste prijs zoals overeengekomen in de opdracht. Facturen dienen te worden voldaan binnen 14 dagen na factuurdatum, tenzij schriftelijk anders overeengekomen. Bij niet-tijdige betaling is Vliet gerechtigd de werkzaamheden op te schorten.

## 6. Geheimhouding

Vliet is verplicht tot geheimhouding van alle vertrouwelijke informatie die in het kader van de opdracht wordt verkregen. Deze geheimhoudingsplicht geldt niet indien Vliet op grond van een wettelijke bepaling of een rechterlijke uitspraak gehouden is de informatie te verstrekken.

## 7. Aansprakelijkheid

De aansprakelijkheid van Vliet is beperkt tot het bedrag dat in het desbetreffende geval door de beroepsaansprakelijkheidsverzekering wordt uitgekeerd. Vliet is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst. Vliet is evenmin aansprakelijk voor schade die voortvloeit uit onjuiste of onvolledige informatieverstrekking door de cliënt.

## 8. Intellectueel eigendom

Alle door Vliet vervaardigde rapporten, adviezen en andere documenten zijn uitsluitend bestemd voor gebruik door de cliënt in het kader van de opdracht. Het is de cliënt niet toegestaan deze stukken zonder schriftelijke toestemming van Vliet aan derden te verstrekken of openbaar te maken.

## 9. Opzegging

Zowel de cliënt als Vliet kan de overeenkomst schriftelijk opzeggen met inachtneming van een opzegtermijn van 30 dagen. Vliet behoudt in dat geval het recht op vergoeding van reeds verrichte werkzaamheden.

## 10. Toepasselijk recht en geschillen

Op alle overeenkomsten tussen Vliet en de cliënt is het recht van Suriname van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Suriname, tenzij partijen overeenkomen het geschil te beslechten via arbitrage of mediation.

## 11. Wijzigingen

Vliet behoudt zich het recht voor deze algemene voorwaarden te wijzigen. De meest actuele versie is beschikbaar op onze website. Bij wijziging van de voorwaarden worden cliënten hiervan op de hoogte gesteld.

## 12. Contact

Voor vragen over deze algemene voorwaarden kunt u contact opnemen via:
[info@vlietaccountants.com](mailto:info@vlietaccountants.com) | +597 720 2090
`;

const APPLY_EMAIL = "info@vlietaccountants.com";

async function seedAvailability() {
  const existing = await db.select().from(availabilityConfig);
  if (existing.length > 0) {
    console.log("availability_config: al gevuld, overslaan");
    return;
  }
  // Footer: Ma – Vr 8:00 – 16:00, 60-minuten slots.
  for (let day = 0; day <= 6; day++) {
    const isWeekday = day >= 1 && day <= 5;
    await db.insert(availabilityConfig).values({
      dayOfWeek: day,
      startTime: "08:00",
      endTime: "16:00",
      slotDuration: 60,
      isActive: isWeekday,
    });
  }
  console.log("availability_config: ma-vr 08:00-16:00 (60 min) aangemaakt");
}

async function seedPage(slug: string, title: string, content: string, metaDescription: string) {
  const existing = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug));
  if (existing.length > 0) {
    console.log(`pages/${slug}: bestaat al, overslaan`);
    return;
  }
  await db.insert(pages).values({
    slug,
    locale: null, // fallback row: applies to every language
    title,
    content,
    metaTitle: title,
    metaDescription,
    published: true,
  });
  console.log(`pages/${slug}: aangemaakt (locale NULL, published)`);
}

async function seedVacancies() {
  const existing = await db.select({ id: vacancies.id }).from(vacancies);
  if (existing.length > 0) {
    console.log("vacancies: al gevuld, overslaan");
    return;
  }

  await db.insert(vacancies).values([
    {
      locale: "nl",
      title: "(Senior) Consultant Advisory",
      department: "Advisory",
      location: "Paramaribo, Suriname",
      employmentType: "Fulltime",
      description:
        "Wil jij organisaties helpen hun governance te versterken, risico's te beheersen en duurzame groei te realiseren? Als (Senior) Consultant Advisory maak je deel uit van een ambitieus en groeiend team waarin kwaliteit, ondernemerschap en persoonlijke ontwikkeling centraal staan. Je krijgt al vroeg verantwoordelijkheid, werkt rechtstreeks samen met cliënten en levert een zichtbare bijdrage aan complexe advies- en verandertrajecten.",
      duties: [
        "Consultancyopdrachten op het gebied van Corporate Governance, Risk Management & Compliance",
        "Ondersteuning bij organisatieverbeteringen en transformatieprojecten",
        "Uitvoeren van risicoanalyses en governance assessments",
        "Opstellen van adviesrapporten en managementpresentaties",
        "Begeleiden van junior consultants",
        "Verzorgen van workshops en trainingen",
      ],
      requirements: [
        "Afgeronde hbo- of wo-opleiding (Accountancy, Bedrijfseconomie, Finance of Bedrijfskunde)",
        "2 tot 4 jaar relevante werkervaring in consultancy, accountancy of internal audit",
        "Sterke analytische en communicatieve vaardigheden",
        "Goede beheersing van de Nederlandse taal",
        "Beheersing van de Engelse taal is een pré",
      ],
      offers: [
        "Marktconform salaris, deels uitbetaald in valuta",
        "Goede werksfeer in een betrokken en hecht team",
        "Interne vakinhoudelijke en persoonlijke vaardigheidstrainingen",
        "Mogelijkheden voor professionele certificeringen",
      ],
      applyEmail: APPLY_EMAIL,
      active: true,
      sortOrder: 0,
    },
    {
      locale: "nl",
      title: "(Senior) Assistant Accountant Audit & Assurance",
      department: "Audit & Assurance",
      location: "Paramaribo, Suriname",
      employmentType: "Fulltime",
      description:
        "Wil jij werken aan uitdagende controle- én adviesopdrachten voor toonaangevende organisaties in Suriname? Als (Senior) Assistant Accountant maak je deel uit van een ambitieus en groeiend team waarin kwaliteit, persoonlijke ontwikkeling en samenwerking centraal staan. Je krijgt al vroeg verantwoordelijkheid en bouwt mee aan opdrachten die daadwerkelijk impact hebben bij onze cliënten.",
      duties: [
        "Uitvoeren van jaarrekeningcontroles van verschillende organisaties",
        "Opstellen van werkdossiers, rapportages en managementletters",
        "Ondersteuning bij consultancy-, governance- en internal audit-opdrachten",
        "Signaleren van risico's en verbetermogelijkheden bij cliënten",
        "Begeleiden van junior assistenten en stagiaires",
        "Professioneel contact onderhouden met cliënten",
      ],
      requirements: [
        "Relevante hbo- of wo-opleiding",
        "1 tot 4 jaar relevante werkervaring binnen de accountancy",
        "Goede analytische en communicatieve vaardigheden",
        "Affiniteit met audit, financiële verslaggeving en bedrijfsprocessen",
        "Professionele instelling en klantgerichte houding",
        "Goede beheersing van de Nederlandse taal (Engels is een pré)",
      ],
      offers: [
        "Marktconform salaris, deels uitbetaald in valuta",
        "Goede werksfeer in een betrokken en hecht team",
        "Interne vakinhoudelijke en persoonlijke vaardigheidstrainingen",
        "Mogelijkheden voor professionele certificeringen",
      ],
      applyEmail: APPLY_EMAIL,
      active: true,
      sortOrder: 1,
    },
  ]);
  console.log("vacancies: 2 vacatures aangemaakt");
}

async function main() {
  await seedAvailability();
  await seedPage(
    "privacy-policy",
    "Privacy Policy",
    PRIVACY_MD,
    "Privacy Policy van Vliet Accountants & Consultants."
  );
  await seedPage(
    "algemene-voorwaarden",
    "Algemene Voorwaarden",
    VOORWAARDEN_MD,
    "Algemene voorwaarden van Vliet Accountants & Consultants."
  );
  await seedVacancies();
  console.log("Seed voltooid.");
}

main().catch((error) => {
  console.error("Seed mislukt:", error);
  process.exit(1);
});
