import { BUSINESS, SERVICES, SITE_URL } from "@/lib/seo/site-info";

// Escape </script>-breakout in case any field ever becomes admin-editable.
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function OrganizationJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: BUSINESS.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-dark.png`,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressCountry: BUSINESS.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    openingHours: BUSINESS.openingHours,
    sameAs: BUSINESS.sameAs,
    areaServed: "SR",
    serviceType: SERVICES.map((s) => s.label),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson(json) }}
    />
  );
}
