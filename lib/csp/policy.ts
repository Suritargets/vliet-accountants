const REPORT_URI = "/api/csp-report";

// Pure function — kept separate from proxy.ts so the actual policy values
// are easy to read and adjust without touching the nonce/routing plumbing.
// style-src allows 'unsafe-inline' deliberately: several pages use React
// inline style={{}} (e.g. the /admin/statistieken trend-chart bars), and
// CSS injection is a much weaker attack vector than script injection —
// script-src gets the strict nonce treatment instead, where the real risk is.
export function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' https://images.unsplash.com https://*.public.blob.vercel-storage.com data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-src https://www.google.com https://maps.google.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `report-uri ${REPORT_URI}`,
  ].join("; ");
}
