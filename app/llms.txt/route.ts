import { NextResponse } from "next/server";
import { BUSINESS, SERVICES, SITE_URL } from "@/lib/seo/site-info";
import { servicesDefaults } from "@/lib/content/services-defaults";

// Plain-text summary for AI crawlers/answer engines (llmstxt.org convention).
// Rebuilt from static content defaults, not the DB — always available even
// if the CMS override tables are empty.
export function GET() {
  const serviceLines = SERVICES.map((s) => {
    const intro = servicesDefaults[s.key]?.intro?.[0] ?? "";
    return `- [${s.label}](${SITE_URL}/diensten/${s.key}): ${intro}`;
  }).join("\n");

  const body = `# ${BUSINESS.legalName}

> Onafhankelijk accountants-, audit- en advieskantoor in Paramaribo, Suriname.

Vliet Accountants & Consultants ondersteunt organisaties met audit, accountancy,
tax compliance en strategisch advies. 15+ jaar ervaring, onafhankelijk, actief
aangesloten bij NBA, IAASB en SCAI.

## Diensten

${serviceLines}

## Belangrijke pagina's

- [Home](${SITE_URL})
- [Over ons](${SITE_URL}/over-ons)
- [Alle diensten](${SITE_URL}/diensten)
- [Blog](${SITE_URL}/blog)
- [Werken bij ons](${SITE_URL}/werken-bij-ons)
- [Afspraak maken](${SITE_URL}/afspraak)
- [Contact](${SITE_URL}/contact)

## Contact

- Adres: ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, Suriname
- Telefoon: ${BUSINESS.telephone}
- E-mail: ${BUSINESS.email}
- Openingstijden: maandag t/m vrijdag, 08:00–16:00
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
