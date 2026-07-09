const REPORT_URI = "/api/csp-report";

// Pure function — kept separate from proxy.ts so the actual policy values
// are easy to read and adjust without touching the routing plumbing.
//
// script-src is 'self' only, deliberately WITHOUT a nonce/'strict-dynamic'.
// A nonce-based policy was tried first and reverted: several public pages
// are statically generated at build time (generateStaticParams — the
// homepage and all 12 diensten pages) or cached after their first render
// (ISR/Full Route Cache). Next.js only threads a nonce into a page's
// <script> tags from *request-time* context (it reads an x-nonce-bearing
// header via parseRequestHeaders()) — build-time static generation has no
// request at all, so those pages get zero nonce on any script tag no
// matter what value is chosen, and cached pages bake in whichever nonce
// existed at cache-generation time while a fresh per-request (or even
// per-deployment, if regenerated at the wrong scope) value in the response
// header would drift out of sync. 'strict-dynamic' requires every single
// script to carry a valid, matching nonce — on this codebase's caching
// architecture that's not reliably achievable, and shipping it anyway
// would mean enforcing CSP breaks hydration on exactly the fastest,
// most-cached pages. 'self' has no such request-time dependency: it's a
// static, deployment-independent rule that Next's own same-origin script
// tags always satisfy, whether the page was rendered just now or a week
// ago at build time.
//
// This does trade away nonce/strict-dynamic's defense against a same-origin
// script-injection attack (an attacker who could get a malicious .js file
// hosted under this origin's own paths could still have it execute). That
// gap doesn't apply here in practice: the only upload path (app/api/upload
// /route.ts) accepts image MIME types only (jpeg/png/webp/gif, no SVG,
// which can carry scripts), so there's no way to plant an arbitrary script
// file under this origin. Inline injected scripts (classic stored-XSS via
// CMS content) and cross-origin script loading are still fully blocked.
//
// style-src allows 'unsafe-inline' deliberately: several pages use React
// inline style={{}} (e.g. the /admin/statistieken trend-chart bars), and
// CSS injection is a much weaker attack vector than script injection.
export function buildCsp(): string {
  return [
    `default-src 'self'`,
    `script-src 'self'`,
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
