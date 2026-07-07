// Shared motion constants — one ease curve and a narrow duration band keep
// every booking-widget animation feeling like a single system.
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const DURATION = { fast: 0.25, base: 0.35, slow: 0.5 } as const;

// Topic keys stored in appointments.topic; labels resolve via the services
// list (same labels in NL and EN — the service names are English already).
export const BOOKING_TOPICS = [
  { key: "algemene-kennismaking", label: null }, // label comes from i18n (booking.service.general)
  { key: "accounting-reporting", label: "Accounting & Reporting" },
  { key: "advisory-training", label: "Advisory & Training" },
  { key: "audit-assurance", label: "Audit & Assurance" },
  { key: "internal-audit-risk-governance", label: "Internal Audit, Risk & Governance" },
  { key: "tax-compliance", label: "Tax & Compliance" },
  { key: "transformation-project-management", label: "Transformation & Project Management" },
] as const;

export type BookingTopicKey = (typeof BOOKING_TOPICS)[number]["key"];

export const BOOKING_TOPIC_KEYS = BOOKING_TOPICS.map((t) => t.key) as string[];

const GENERAL_TOPIC_LABEL = { nl: "Algemene kennismaking", en: "General introduction" } as const;

/** Human-readable topic label for server-side contexts without next-intl (e.g. email). */
export function resolveTopicLabel(topic: string | null, locale: "nl" | "en"): string {
  const match = BOOKING_TOPICS.find((t) => t.key === topic);
  if (!match) return GENERAL_TOPIC_LABEL[locale];
  return match.label ?? GENERAL_TOPIC_LABEL[locale];
}
