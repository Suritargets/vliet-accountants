// Single source of truth for business facts (NAP, socials, services) reused
// by JSON-LD, llms.txt, sitemap, and any page that states these facts in
// prose — keeps them consistent everywhere rather than duplicated per file.

export const SITE_URL = "https://www.vlietaccountants.com";

export const BUSINESS = {
  legalName: "Vliet Accountants & Consultants",
  streetAddress: "Wagenwegstraat 51",
  addressLocality: "Paramaribo",
  addressCountry: "SR", // Suriname has no formal postal-code system
  telephone: "+597 720 2090",
  email: "info@vlietaccountants.com",
  latitude: 5.82883,
  longitude: -55.15789,
  openingHours: "Mo-Fr 08:00-16:00",
  sameAs: [
    "https://www.facebook.com/profile.php?id=100073261638677",
    "https://www.linkedin.com/company/vliet-accountants-consultants/",
  ],
} as const;

export const SERVICES = [
  { key: "accounting-reporting", label: "Accounting & Reporting" },
  { key: "advisory-training", label: "Advisory & Training" },
  { key: "audit-assurance", label: "Audit & Assurance" },
  { key: "internal-audit-risk-governance", label: "Internal Audit, Risk & Governance" },
  { key: "tax-compliance", label: "Tax & Compliance" },
  { key: "transformation-project-management", label: "Transformation & Project Management" },
] as const;
